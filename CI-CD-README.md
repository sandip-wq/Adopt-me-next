# CI/CD Pipeline Documentation

This document describes the Continuous Integration and Continuous Deployment (CI/CD) pipeline implemented for the Adopt Me Next.js application using GitHub Actions.

# CI/CD Pipeline Documentation

This document describes the Continuous Integration and Continuous Deployment (CI/CD) pipeline implemented for the Adopt Me Next.js application using GitHub Actions, plus Docker containerization setup.

## Pipeline Overview

The CI/CD pipeline consists of multiple jobs that run automated tests, linting, security audits, and builds to ensure code quality and reliability. The application is also fully containerized using Docker for consistent deployment environments.

## 🐳 Docker Containerization

### Docker Setup Status: ✅ **FULLY WORKING**

#### **Multi-Service Architecture**
- **Web Application**: Next.js app in production mode
- **Database**: MongoDB 7 with persistent data storage  
- **Networking**: Internal Docker network communication
- **Volumes**: Persistent MongoDB data storage

#### **Docker Configuration Files**

##### `Dockerfile` - Multi-stage build optimization
- **Stage 1 (deps)**: Install dependencies only
- **Stage 2 (builder)**: Build Next.js application  
- **Stage 3 (runner)**: Production runtime image
- **Optimizations**: Alpine Linux base, layer caching, minimal runtime footprint

##### `docker-compose.yml` - Service orchestration
- **Web Service**: Next.js application on port 3000
- **Mongo Service**: MongoDB database on port 27017
- **Environment Variables**: Proper MongoDB connection string
- **Dependencies**: Ensures MongoDB starts before web application
- **Volumes**: Persistent data storage for MongoDB

##### `.dockerignore` - Build optimization
- **Excludes**: Test files, dev dependencies, documentation
- **Includes**: Only production-necessary files
- **Benefits**: Faster builds, smaller images, security

#### **Verified Working Features** ✅
1. **✅ Docker Build**: Multi-stage build completes successfully
2. **✅ Container Startup**: Both services start and run properly  
3. **✅ Database Connection**: Next.js connects to MongoDB container
4. **✅ API Endpoints**: All REST API routes working
5. **✅ Web Interface**: Browse and interests pages functional
6. **✅ Data Persistence**: MongoDB data survives container restarts
7. **✅ Network Communication**: Internal container networking working
8. **✅ Port Mapping**: External access on localhost:3000

#### **Docker Commands**
```bash
# Build and start all services
docker-compose up -d

# Check service status  
docker-compose ps

# View application logs
docker-compose logs web

# Access MongoDB shell
docker-compose exec mongo mongosh adoptme

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up --build -d
```

### Production Deployment Ready 🚀
- **Environment Variables**: Properly configured for container networking
- **Data Persistence**: MongoDB data survives container lifecycle
- **Security**: No sensitive data in images, proper network isolation
- **Scalability**: Ready for orchestration with Kubernetes/Docker Swarm
- **CI/CD Integration**: Docker builds can be integrated into GitHub Actions

### Pipeline Jobs

#### 1. Unit Tests (`unit-tests`)
- **Purpose**: Run fast, isolated unit tests
- **Matrix Strategy**: Tests on Node.js versions 18.x and 20.x
- **Tests Included**: 
  - Pet Model tests with Mongoose spies
  - Pet Service tests with dependency mocking
  - API Routes direct testing
- **Command**: `npm run test:unit`
- **Artifacts**: Test results and coverage reports

#### 2. System Tests (`system-tests`)
- **Purpose**: Test the complete application stack with real database
- **Dependencies**: Requires `unit-tests` to pass first
- **Features**:
  - Uses MongoDB Memory Server for isolated testing
  - Tests full CRUD operations through HTTP API
  - Validates database persistence and integrity
  - Tests concurrent operations and error handling
- **Command**: `npm run test:system`
- **Timeout**: Extended to 60 seconds for database operations

#### 3. Lint and Type Check (`lint-and-typecheck`)
- **Purpose**: Ensure code quality and type safety
- **Runs in Parallel**: Independent of test jobs
- **Checks**:
  - ESLint for code style and potential issues
  - TypeScript type checking
- **Commands**: `npm run lint` and `npx tsc --noEmit`

#### 4. Build (`build`)
- **Purpose**: Verify the application can be built for production
- **Dependencies**: Requires all previous jobs to pass
- **Output**: Next.js production build
- **Artifacts**: Build files stored for 7 days

#### 5. Security Audit (`security-audit`)
- **Purpose**: Check for known security vulnerabilities
- **Runs in Parallel**: Independent security validation
- **Checks**:
  - `npm audit` for dependency vulnerabilities
  - Dry-run of `npm audit fix`

## Trigger Conditions

The pipeline runs on:
- **Push** to `main` or `develop` branches
- **Pull Requests** targeting `main` branch

## System Test Architecture

### Database Setup
- **MongoDB Memory Server**: Provides isolated, in-memory MongoDB instance
- **Fresh State**: Database is cleared before each test
- **Real Integration**: Tests actual Mongoose models and database operations

### Test Coverage
System tests cover:
1. **Full CRUD Operations**: Create, Read, Update, Delete through API
2. **Database Persistence**: Verifies data is actually stored and retrieved
3. **Multiple Entity Handling**: Tests with multiple pets simultaneously
4. **Error Scenarios**: 404 responses, invalid IDs, validation errors
5. **Concurrent Operations**: Tests race conditions and data integrity
6. **Direct Database Operations**: Tests Mongoose model behavior

### Test Structure
```typescript
describe('Pet API System Tests', () => {
  beforeAll(async () => {
    // Start MongoDB Memory Server
    // Setup Next.js application
    // Start HTTP server
  });

  afterAll(async () => {
    // Cleanup server and database
  });

  beforeEach(async () => {
    // Clear database for each test
  });

  // Test cases...
});
```

## Running Tests Locally

### Individual Test Suites
```bash
# Unit tests only
npm run test:unit

# System tests only
npm run test:system

# All tests with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### CI-like Environment
```bash
# Run tests as they would run in CI
npm run test:ci
```

## Artifacts and Reports

### Test Artifacts
- **Test Results**: JUnit XML format for CI integration
- **Coverage Reports**: HTML and JSON coverage reports
- **Build Artifacts**: Production build files
- **Retention**: Test results kept for 30 days, builds for 7 days

### GitHub Actions Features Used
- **Matrix Builds**: Test on multiple Node.js versions
- **Job Dependencies**: Ensure tests pass before building
- **Artifact Upload**: Store test results and build outputs
- **Parallel Execution**: Run independent jobs simultaneously
- **Conditional Steps**: Upload artifacts even on test failures

## Pipeline Benefits

### Quality Assurance
- **Automated Testing**: No manual test execution required
- **Multiple Test Types**: Unit, integration, and system tests
- **Code Quality**: Linting and type checking enforced
- **Security**: Vulnerability scanning on every change

### Development Workflow
- **Fast Feedback**: Quick identification of issues
- **Branch Protection**: Prevent merging broken code
- **Cross-Platform**: Test on multiple Node.js versions
- **Documentation**: Clear test results and coverage metrics

### Deployment Readiness
- **Build Verification**: Ensure deployable artifacts
- **Dependency Management**: Automated security audits
- **Version Matrix**: Compatibility across Node.js versions
- **Artifact Storage**: Ready-to-deploy build files

## Troubleshooting

### Common Issues
1. **MongoDB Connection**: System tests may timeout if MongoDB Memory Server fails to start
2. **Port Conflicts**: Tests use random ports to avoid conflicts
3. **Memory Usage**: System tests require more memory due to full application startup
4. **Test Isolation**: Each test runs with a clean database state

### Performance Optimization
- **Parallel Execution**: Unit tests run in parallel, system tests run sequentially (`--runInBand`)
- **Caching**: npm dependencies cached between runs
- **Selective Testing**: Different test suites for different purposes
- **Timeout Management**: Extended timeouts for database operations

This CI/CD pipeline ensures high code quality, comprehensive testing, and reliable deployments for the Adopt Me application.
