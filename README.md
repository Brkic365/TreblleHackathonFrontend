# RunTime - API Monitoring Platform

A modern, real-time API monitoring and analytics platform built with Next.js 15, TypeScript, and NextAuth.js. RunTime provides comprehensive insights into your API performance, security, and usage patterns.

## 🚀 Features

### 📊 **Real-Time Monitoring**
- **Live API Performance Tracking** - Monitor response times, error rates, and throughput
- **Request/Response Logging** - Detailed logs with headers, body, and timing data
- **Endpoint Analytics** - Track individual endpoint performance and usage patterns
- **Security Monitoring** - Detect and alert on security issues and vulnerabilities

### 📈 **Advanced Analytics**
- **Performance Dashboards** - Visualize API metrics with interactive charts
- **Geographic Heatmaps** - See where your API requests are coming from
- **Trend Analysis** - Track performance trends over time
- **Custom Time Ranges** - Filter data by 1h, 24h, 7d, or 30d periods

### 🔐 **Authentication & Security**
- **Multiple Auth Providers** - Google OAuth, GitHub OAuth, and Email/Password
- **JWT Token Management** - Secure session handling with backend integration
- **User Profile Management** - Update profile, change password, export data
- **Account Security** - Password changes and account deletion

### 🎨 **Modern UI/UX**
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Dark Theme** - Beautiful dark mode with gradient backgrounds
- **Interactive Components** - Smooth animations and transitions
- **Real-Time Updates** - Live data refresh every 30 seconds

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **SCSS/Sass** - Styling with CSS modules
- **Framer Motion** - Smooth animations
- **Recharts** - Data visualization
- **Ark UI** - Headless UI components
- **SWR** - Data fetching and caching

### **Authentication**
- **NextAuth.js** - Authentication framework
- **Google OAuth** - Social login
- **GitHub OAuth** - Developer-friendly login
- **JWT Tokens** - Secure session management

### **Backend Integration**
- **REST API** - Express.js backend integration
- **Real-Time Data** - Live API monitoring
- **Error Handling** - Comprehensive error management
- **Data Validation** - Input validation and sanitization

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── components/              # Reusable UI components
│   │   ├── analytics/           # Analytics-specific components
│   │   ├── charts/              # Chart components
│   │   ├── layout/              # Layout components
│   │   └── sidebar/             # Navigation components
│   ├── projects/                # Project management pages
│   │   └── [projectId]/         # Individual project pages
│   │       ├── overview/        # Project overview dashboard
│   │       ├── requests/        # Request logs and analytics
│   │       ├── endpoints/       # Endpoint monitoring
│   │       └── api/             # API information
│   ├── analytics/               # Global analytics
│   ├── settings/                # User settings
│   ├── login/                   # Authentication pages
│   └── signup/
├── lib/                         # Utility libraries
│   ├── apiClient.ts            # Backend API client
│   └── auth.ts                 # NextAuth configuration
├── styles/                      # SCSS stylesheets
│   ├── components/             # Component-specific styles
│   ├── pages/                  # Page-specific styles
│   └── _variables.scss         # SCSS variables
├── types/                       # TypeScript type definitions
└── utils/                       # Utility functions
    └── endpointNormalization.ts # Endpoint path normalization
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API server (Express.js with Prisma)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd treblle-hackathon
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret

   # OAuth Providers
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GITHUB_ID=your-github-client-id
   GITHUB_SECRET=your-github-client-secret

   # Backend API
   NEXT_PUBLIC_API_URL=http://localhost:8080
   NEXT_PUBLIC_INTERNAL_API_KEY=internal-api-key-123
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Backend API Integration

The frontend integrates with a backend API that should provide the following endpoints:

#### **Authentication Endpoints**
- `POST /api/auth/register` - User registration
- `POST /api/auth/session` - User authentication
- `POST /api/auth/oauth-user` - OAuth user creation

#### **Project Management**
- `GET /api/projects` - List user projects
- `POST /api/projects` - Create new project
- `GET /api/projects/{id}/overview` - Project overview data
- `GET /api/projects/{id}/requests` - Project request logs
- `GET /api/projects/{id}/endpoints` - Project endpoints

#### **Analytics Endpoints**
- `GET /api/projects/{id}/kpis` - Key performance indicators
- `GET /api/projects/{id}/charts` - Chart data
- `GET /api/projects/{id}/errors` - Error analytics
- `GET /api/projects/{id}/security-issues` - Security issues

### OAuth Setup

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

#### GitHub OAuth
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

## 📊 Key Features

### **Project Management**
- Create and manage multiple API projects
- Real-time project health monitoring
- Detailed project analytics and insights

### **Request Monitoring**
- Live request logging with detailed information
- Request filtering by method, status, and time range
- Request detail sidebar with headers, body, and timing
- Pagination and sorting capabilities

### **Endpoint Analytics**
- Endpoint path normalization (e.g., `/posts/123` → `/posts/{id}`)
- Endpoint grouping and aggregation
- Performance metrics per endpoint
- Error rate tracking

### **Security Monitoring**
- Security issue detection and alerting
- Risk level classification (low, medium, high, critical)
- Security score calculation
- Vulnerability tracking

### **User Management**
- Profile management and settings
- Password change functionality
- Data export capabilities
- Account deletion

## 🎨 UI Components

### **Reusable Components**
- `Button` - Styled button component with variants
- `CommonState` - Loading, error, and empty state components
- `ApiEndpointCard` - Project overview cards
- `RequestDetailSidebar` - Detailed request information
- `EndpointsMenu` - Filtering and view mode controls

### **Layout Components**
- `DashboardLayout` - Main dashboard layout
- `GlobalSidebar` - Navigation sidebar
- `ProjectSidebar` - Project-specific navigation
- `ConditionalNavbar` - Context-aware navigation

### **Chart Components**
- `TimeSeriesChart` - Time-based data visualization
- `ProjectPerformanceChart` - Performance metrics
- `RequestsTrendChart` - Request trend analysis
- `GeoHeatmap` - Geographic request distribution

## 🔒 Security Features

### **Authentication Security**
- JWT token-based authentication
- Secure session management
- OAuth 2.0 integration
- Password hashing and validation

### **Data Security**
- Input validation and sanitization
- XSS protection
- CSRF protection via NextAuth
- Secure API communication

### **Privacy Features**
- User data export
- Account deletion
- Secure password changes
- Session management

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop** - Full-featured dashboard experience
- **Tablet** - Optimized touch interface
- **Mobile** - Streamlined mobile experience

## 🚀 Deployment

### **Vercel Deployment**
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### **Docker Deployment**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the API integration guide

## 🔮 Roadmap

### **Upcoming Features**
- [ ] Real-time notifications
- [ ] Custom alert rules
- [ ] API documentation generation
- [ ] Team collaboration features
- [ ] Advanced analytics and reporting
- [ ] Mobile app development
- [ ] Webhook integrations
- [ ] Custom dashboard widgets

### **Performance Improvements**
- [ ] Data caching optimization
- [ ] Lazy loading implementation
- [ ] Bundle size optimization
- [ ] Database query optimization

---

**Built with ❤️ for the Treblle Hackathon**

*RunTime - Smarter API Performance. Real-Time Insights.*