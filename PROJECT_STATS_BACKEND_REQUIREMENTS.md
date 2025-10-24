# Project Statistics Backend Requirements

## Overview
The frontend now fetches actual request counts for each project on the projects page. Currently, it makes individual API calls to get request counts, but this can be optimized with a dedicated stats endpoint.

## Current Implementation
The frontend currently calls `/api/projects/{projectId}/requests?page=1&limit=1` for each project to get the total count from the pagination response.

## Recommended Backend Optimization

### Option 1: Enhanced Projects Endpoint (Recommended)
Modify the existing `/api/projects` endpoint to include statistics:

```javascript
// GET /api/projects
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        _count: {
          select: {
            apiRequestLogs: true
          }
        },
        // Add aggregated statistics
        apiRequestLogs: {
          select: {
            durationMs: true,
            responseCode: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1 // Only need the latest request
        }
      }
    });

    // Calculate statistics for each project
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const totalRequests = project._count.apiRequestLogs;
        
        // Calculate average response time
        const avgResponseTime = totalRequests > 0 
          ? await prisma.apiRequestLog.aggregate({
              where: { projectId: project.id },
              _avg: { durationMs: true }
            })
          : { _avg: { durationMs: 0 } };

        // Calculate error rate (4xx and 5xx responses)
        const errorCount = totalRequests > 0
          ? await prisma.apiRequestLog.count({
              where: {
                projectId: project.id,
                responseCode: {
                  gte: 400
                }
              }
            })
          : 0;

        const errorRate = totalRequests > 0 ? errorCount / totalRequests : 0;
        const lastRequest = project.apiRequestLogs[0]?.createdAt || project.createdAt;

        return {
          ...project,
          stats: {
            totalRequests,
            avgResponseTime: Math.round(avgResponseTime._avg.durationMs || 0),
            errorRate,
            lastRequest
          }
        };
      })
    );

    res.json(projectsWithStats);
  } catch (error) {
    console.error('Error fetching projects with stats:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});
```

### Option 2: Dedicated Stats Endpoint
Create a new endpoint `/api/projects/{projectId}/stats`:

```javascript
// GET /api/projects/:projectId/stats
app.get('/api/projects/:projectId/stats', async (req, res) => {
  try {
    const { projectId } = req.params;

    const [
      totalRequests,
      avgResponseTime,
      errorCount,
      lastRequest
    ] = await Promise.all([
      prisma.apiRequestLog.count({ where: { projectId } }),
      prisma.apiRequestLog.aggregate({
        where: { projectId },
        _avg: { durationMs: true }
      }),
      prisma.apiRequestLog.count({
        where: {
          projectId,
          responseCode: { gte: 400 }
        }
      }),
      prisma.apiRequestLog.findFirst({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      })
    ]);

    const errorRate = totalRequests > 0 ? errorCount / totalRequests : 0;

    res.json({
      totalRequests,
      avgResponseTime: Math.round(avgResponseTime._avg.durationMs || 0),
      errorRate,
      lastRequest: lastRequest?.createdAt || null
    });
  } catch (error) {
    console.error('Error fetching project stats:', error);
    res.status(500).json({ error: 'Failed to fetch project statistics' });
  }
});
```

## Frontend Integration

### Current Implementation
```typescript
// Current approach - makes individual calls
const projectsWithCounts = await Promise.allSettled(
  backendProjects.map(async (backendProject) => {
    const requestsData = await apiClient.getProjectRequests(backendProject.id, {
      page: 1,
      limit: 1
    });
    const requestCount = requestsData.pagination.total;
    return convertBackendProject(backendProject, requestCount);
  })
);
```

### Optimized Implementation (Option 1)
```typescript
// If backend includes stats in projects endpoint
const backendProjects = await apiClient.getProjects();
const convertedProjects = backendProjects.map(project => 
  convertBackendProject(project, project.stats?.totalRequests || 0)
);
```

### Optimized Implementation (Option 2)
```typescript
// If using dedicated stats endpoint
const projectsWithStats = await Promise.allSettled(
  backendProjects.map(async (backendProject) => {
    try {
      const stats = await apiClient.getProjectStats(backendProject.id);
      return convertBackendProject(backendProject, stats.totalRequests);
    } catch (err) {
      return convertBackendProject(backendProject);
    }
  })
);
```

## Benefits

### Option 1 (Enhanced Projects Endpoint)
- ✅ **Single API Call**: Only one request to get all projects with stats
- ✅ **Better Performance**: No multiple round trips
- ✅ **Atomic Data**: All data fetched together
- ✅ **Simpler Frontend**: No complex Promise.allSettled logic

### Option 2 (Dedicated Stats Endpoint)
- ✅ **Modular**: Stats endpoint can be reused elsewhere
- ✅ **Flexible**: Can add more statistics without changing projects endpoint
- ✅ **Cached**: Stats can be cached independently
- ✅ **Detailed**: Can provide more granular statistics

## Database Considerations

### Indexes for Performance
```sql
-- Index for counting requests by project
CREATE INDEX idx_api_request_logs_project_id ON api_request_logs(project_id);

-- Index for error rate calculations
CREATE INDEX idx_api_request_logs_project_response ON api_request_logs(project_id, response_code);

-- Index for latest request queries
CREATE INDEX idx_api_request_logs_project_created ON api_request_logs(project_id, created_at DESC);
```

### Caching Strategy
```javascript
// Consider caching project stats for 1-5 minutes
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

app.get('/api/projects/:projectId/stats', async (req, res) => {
  const { projectId } = req.params;
  const cacheKey = `stats-${projectId}`;
  
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json(cached.data);
    }
  }
  
  // Fetch fresh data and cache it
  const stats = await fetchProjectStats(projectId);
  cache.set(cacheKey, {
    data: stats,
    timestamp: Date.now()
  });
  
  res.json(stats);
});
```

## Testing

### Test Cases
1. **Empty Project**: Project with no requests should show 0 counts
2. **Active Project**: Project with recent requests should show accurate counts
3. **Error Handling**: Invalid project ID should return 404
4. **Performance**: Multiple projects should load within reasonable time
5. **Caching**: Subsequent requests should be faster (if caching implemented)

### Example Response (Option 1)
```json
[
  {
    "id": "project-123",
    "name": "My API",
    "originalBaseUrl": "https://api.example.com",
    "proxyUrl": "https://proxy.runtime.com/project-123",
    "createdAt": "2024-01-20T10:00:00Z",
    "_count": {
      "apiRequestLogs": 1250
    },
    "stats": {
      "totalRequests": 1250,
      "avgResponseTime": 145,
      "errorRate": 0.02,
      "lastRequest": "2024-01-20T15:30:00Z"
    }
  }
]
```

### Example Response (Option 2)
```json
{
  "totalRequests": 1250,
  "avgResponseTime": 145,
  "errorRate": 0.02,
  "lastRequest": "2024-01-20T15:30:00Z"
}
```

## Migration Path

1. **Phase 1**: Implement current individual API calls (already done)
2. **Phase 2**: Add stats to projects endpoint or create stats endpoint
3. **Phase 3**: Update frontend to use optimized approach
4. **Phase 4**: Add caching for better performance
5. **Phase 5**: Add real-time updates with WebSockets (optional)

This will significantly improve the performance of the projects page and provide more accurate, real-time statistics! 🚀
