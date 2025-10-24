/**
 * Endpoint Path Normalization Utilities
 * 
 * This module provides functions to normalize API endpoint paths
 * by replacing dynamic segments with parameter placeholders.
 * 
 * Examples:
 * - DELETE /posts/5 → DELETE /posts/{id}
 * - PUT /posts/2 → PUT /posts/{id}
 * - GET /users/123-abc-456 → GET /users/{uuid}
 * - POST /api/v1/users/123/profile → POST /api/v1/users/{id}/profile
 */

/**
 * Detects if a path segment is likely a dynamic parameter
 * @param segment - The path segment to analyze
 * @returns true if the segment appears to be a dynamic parameter
 */
function isDynamicSegment(segment: string): boolean {
  // Skip empty segments
  if (!segment) return false;
  
  // Skip segments that are clearly static (contain letters and are short)
  if (segment.length <= 3 && /^[a-zA-Z]+$/.test(segment)) {
    return false;
  }
  
  // Skip common static words
  const staticWords = ['api', 'v1', 'v2', 'v3', 'admin', 'public', 'static', 'assets', 'css', 'js', 'img', 'images'];
  if (staticWords.includes(segment.toLowerCase())) {
    return false;
  }
  
  // Check if it's a number (likely an ID)
  if (/^\d+$/.test(segment)) {
    return true;
  }
  
  // Check if it's a UUID pattern
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) {
    return true;
  }
  
  // Check if it's a UUID without dashes
  if (/^[0-9a-f]{32}$/i.test(segment)) {
    return true;
  }
  
  // Check if it's a mixed alphanumeric string (likely an ID)
  if (/^[a-zA-Z0-9-_]+$/.test(segment) && segment.length > 8) {
    return true;
  }
  
  // Check if it contains numbers and letters (likely an ID)
  if (/\d/.test(segment) && /[a-zA-Z]/.test(segment)) {
    return true;
  }
  
  return false;
}

/**
 * Determines the appropriate parameter name for a dynamic segment
 * @param segment - The path segment to analyze
 * @param context - The surrounding path context
 * @returns The parameter name to use
 */
function getParameterName(segment: string, context: string[]): string {
  // If it's a number, it's likely an ID
  if (/^\d+$/.test(segment)) {
    return 'id';
  }
  
  // If it's a UUID, use uuid
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment) ||
      /^[0-9a-f]{32}$/i.test(segment)) {
    return 'uuid';
  }
  
  // Look at the previous segment to determine context
  const prevSegment = context[context.length - 1];
  if (prevSegment) {
    const singular = prevSegment.replace(/s$/, ''); // Remove trailing 's'
    if (singular !== prevSegment) {
      return singular.toLowerCase();
    }
  }
  
  // Default to 'id' for other cases
  return 'id';
}

/**
 * Normalizes an API endpoint path by replacing dynamic segments with parameter placeholders
 * @param path - The original endpoint path
 * @returns The normalized path with parameter placeholders
 */
export function normalizeEndpointPath(path: string): string {
  if (!path) return path;
  
  // Split the path into segments
  const segments = path.split('/').filter(segment => segment !== '');
  
  // Process each segment
  const normalizedSegments = segments.map((segment, index) => {
    if (isDynamicSegment(segment)) {
      const context = segments.slice(0, index);
      const paramName = getParameterName(segment, context);
      return `{${paramName}}`;
    }
    return segment;
  });
  
  // Reconstruct the path
  return '/' + normalizedSegments.join('/');
}

/**
 * Groups endpoints by their normalized path and method
 * @param endpoints - Array of endpoint items
 * @returns Grouped endpoints with aggregated data
 */
export function groupEndpointsByNormalizedPath(endpoints: Array<{ method: string; path: string; [key: string]: any }>): Array<{
  method: string;
  path: string;
  normalizedPath: string;
  count: number;
  avgResponseTime: number;
  errorRate: number;
  requestCount: number;
  lastRequest: string;
  status: 'healthy' | 'warning' | 'error';
  originalEndpoints: any[];
}> {
  const groups = new Map<string, any>();
  
  endpoints.forEach(endpoint => {
    const normalizedPath = normalizeEndpointPath(endpoint.path);
    const key = `${endpoint.method}:${normalizedPath}`;
    
    if (!groups.has(key)) {
      groups.set(key, {
        method: endpoint.method,
        path: endpoint.path,
        normalizedPath,
        count: 0,
        avgResponseTime: 0,
        errorRate: 0,
        requestCount: 0,
        lastRequest: endpoint.lastRequest,
        status: endpoint.status,
        // Keep original endpoint data for reference
        originalEndpoints: []
      });
    }
    
    const group = groups.get(key);
    group.count++;
    group.requestCount += endpoint.requestCount || 0;
    group.avgResponseTime = (group.avgResponseTime + endpoint.avgResponseTime) / 2;
    group.errorRate = Math.max(group.errorRate, endpoint.errorRate || 0);
    
    // Keep the most recent lastRequest
    if (new Date(endpoint.lastRequest) > new Date(group.lastRequest)) {
      group.lastRequest = endpoint.lastRequest;
    }
    
    // Keep the worst status
    const statusPriority = { error: 3, warning: 2, healthy: 1 };
    if (statusPriority[endpoint.status] > statusPriority[group.status]) {
      group.status = endpoint.status;
    }
    
    group.originalEndpoints.push(endpoint);
  });
  
  return Array.from(groups.values());
}

/**
 * Creates a display-friendly version of the normalized path
 * @param normalizedPath - The normalized path with parameter placeholders
 * @returns A formatted string for display
 */
export function formatNormalizedPath(normalizedPath: string): string {
  return normalizedPath.replace(/\{([^}]+)\}/g, '<span class="param">{$1}</span>');
}
