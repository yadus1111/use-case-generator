# Technical Architecture - Use Case Generator

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER (React)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ File Upload │  │ Data Preview│  │ Use Cases   │  │ PDF Export  │     │
│  │ Component   │  │ Component   │  │ Display     │  │ Component   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    MermaidDiagram Component                        │   │
│  │              (Visual Diagram Rendering)                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP/HTTPS
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        API LAYER (Express.js)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   /api/     │  │   /api/     │  │   /api/     │  │   /api/     │     │
│  │  upload     │  │   status    │  │   ping      │  │   test      │     │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Local Server
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        BACKEND LAYER (Node.js)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    Express.js Server                               │   │
│  │                                                                     │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │ │
│  │  │   Multer    │  │ CSV Parser  │  │ Pattern     │  │ PDF Gen.    │ │ │
│  │  │ (File Upload│  │ (Data Parse)│  │ Analysis    │  │ (Reports)   │ │ │
│  │  │  Handler)   │  │             │  │ Engine      │  │             │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ API Calls
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AI LAYER (Google Gemini)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    Gemini 1.5 Flash Model                          │   │
│  │                                                                     │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │ │
│  │  │   Prompt    │  │   Context   │  │   Pattern   │  │   Response  │ │ │
│  │  │ Engineering │  │ Integration │  │   Analysis  │  │ Processing  │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   CSV File  │───▶│   Data      │───▶│   Pattern   │───▶│   AI        │
│   Upload    │    │   Parser    │    │   Analysis  │    │   Processing│
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                              │
                                                              ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   PDF       │◀───│   Use Cases │◀───│   JSON      │◀───│   Gemini    │
│   Export    │    │   Display   │    │   Response  │    │   Response  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## Component Relationships

### Frontend Components
```
App.js (Main Component)
├── FileUpload Component
│   ├── Drag & Drop Interface
│   ├── File Validation
│   └── Upload Progress
├── DataPreview Component
│   ├── Table Display
│   ├── Row Count
│   └── Column Headers
├── UseCaseDisplay Component
│   ├── UseCaseCard (Multiple)
│   │   ├── Header Section
│   │   ├── Summary Section
│   │   ├── Description Section
│   │   ├── Impact Section
│   │   └── Expanded Details
│   └── MermaidDiagram Component
│       ├── SVG Rendering
│       ├── Error Handling
│       └── Loading States
└── ExportComponents
    ├── PDF Generation
    └── Text Export
```

### Backend Services
```
server.js (Main Server)
├── File Processing Service
│   ├── Multer Configuration
│   ├── CSV Parser
│   └── Buffer Processing
├── Data Analysis Service
│   ├── Pattern Recognition
│   ├── Statistical Analysis
│   └── Insight Generation
├── AI Integration Service
│   ├── Gemini API Client
│   ├── Prompt Engineering
│   └── Response Processing
└── Export Service
    ├── PDF Generation
    └── Report Formatting
```

## API Endpoints

### Main Endpoints
```
POST /api/upload
├── Accepts: multipart/form-data
├── Parameters:
│   ├── csvFile: CSV file
│   ├── businessProblem: string
│   └── businessScenario: string
└── Returns: JSON with use cases

GET /api/status
├── Purpose: Health check
└── Returns: Server status

GET /api/ping
├── Purpose: Connectivity test
└── Returns: Pong response

GET /api/test
├── Purpose: API testing
└── Returns: Test response
```

## Data Processing Pipeline

### 1. File Upload & Validation
```javascript
// Input: CSV File Buffer
const parseCSVBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const readable = Readable.from(buffer);
    readable
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};
```

### 2. Pattern Analysis Engine
```javascript
// Multi-dimensional analysis
const analyzeDataPatterns = (data) => {
  return {
    transactionPatterns: analyzeTransactions(data),
    merchantPatterns: analyzeMerchants(data),
    geographicPatterns: analyzeGeography(data),
    userPatterns: analyzeUsers(data),
    temporalPatterns: analyzeTime(data),
    insights: generateInsights(data)
  };
};
```

### 3. AI Processing Pipeline
```javascript
// AI integration flow
const generateUseCases = async (csvSummary, businessProblem, businessScenario, dataPatterns) => {
  // 1. Prepare context
  const contextInfo = buildContext(businessProblem, businessScenario);
  
  // 2. Create AI prompt
  const prompt = buildPrompt(csvSummary, contextInfo, dataPatterns);
  
  // 3. Call Gemini API
  const response = await callGeminiAPI(prompt);
  
  // 4. Process response
  const useCases = parseAIResponse(response);
  
  return useCases;
};
```

## Security Architecture

### File Security
- **File Type Validation**: Only CSV files accepted
- **Size Limits**: Maximum 10MB file size
- **Content Validation**: CSV structure verification
- **No Persistent Storage**: Files processed in memory only

### API Security
- **Environment Variables**: API keys stored securely
- **Error Handling**: No sensitive data in error messages
- **CORS Configuration**: Proper cross-origin handling
- **Input Validation**: All inputs validated and sanitized

### Data Privacy
- **No Data Persistence**: Files not stored on server
- **Memory Processing**: All processing done in memory
- **Secure Transmission**: HTTPS for all communications
- **API Key Protection**: Keys not exposed in client code

## Performance Characteristics

### Local Development
- **Express Server**: Single-threaded Node.js server
- **Memory Processing**: All data processed in memory
- **File Handling**: Local file system operations
- **Concurrent Users**: Limited by local server capacity

### Performance Metrics
- **File Processing**: 30-60 seconds for typical datasets
- **AI Response Time**: 10-20 seconds for use case generation
- **PDF Generation**: 5-10 seconds per report
- **Memory Usage**: Efficient in-memory processing

### Optimization Strategies
- **Streaming Processing**: Large files processed in streams
- **Parallel Processing**: Multiple analysis tasks run concurrently
- **Caching**: Mermaid diagram rendering cached
- **Compression**: Response data compressed

## Error Handling Strategy

### Client-Side Errors
```javascript
// File validation errors
if (!file || file.type !== 'text/csv') {
  setError('Please select a valid CSV file');
  return;
}

// Network errors
if (error.code === 'ECONNABORTED') {
  setError('Request timed out. Please try again.');
}
```

### Server-Side Errors
```javascript
// API key errors
if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set');
}

// AI response errors
if (!Array.isArray(useCases) || useCases.length === 0) {
  throw new Error('Failed to generate valid use cases');
}
```

### Recovery Mechanisms
- **Retry Logic**: Automatic retry for transient failures
- **Fallback Parsing**: Multiple JSON parsing strategies
- **Graceful Degradation**: Partial functionality when AI fails
- **User Feedback**: Clear error messages and recovery steps

## Local Development Architecture

### Development Environment
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Local Development Environment                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   React     │  │   Express   │  │   File      │  │   AI        │     │
│  │   Dev       │  │   Server    │  │   System    │  │   API       │     │
│  │   Server    │  │   (Port     │  │   Access    │  │   Calls     │     │
│  │   (Port     │  │   5000)     │  │             │  │             │     │
│  │   3000)     │  │             │  │             │  │             │     │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Environment Configuration
```bash
# Development Environment
NODE_ENV=development
GEMINI_API_KEY=your_development_key
PORT=5000

# Production Environment (if needed)
NODE_ENV=production
GEMINI_API_KEY=your_production_key
PORT=3000
```

### Build Process
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "client": "cd client && npm start",
    "build": "cd client && npm run build",
    "install-client": "cd client && npm install"
  }
}
```

## Monitoring & Observability

### Logging Strategy
- **Request Logging**: All API requests logged
- **Error Logging**: Detailed error information captured
- **Performance Logging**: Processing times tracked
- **AI Response Logging**: API calls and responses logged

### Health Checks
- **API Endpoints**: `/api/status`, `/api/ping` for monitoring
- **Dependency Checks**: Database and external service health
- **Performance Metrics**: Response times and throughput
- **Error Rates**: Success/failure ratios tracked

### Development Tools
- **Nodemon**: Automatic server restart on file changes
- **React DevTools**: Frontend debugging and inspection
- **Console Logging**: Detailed logging for debugging
- **Error Tracking**: Comprehensive error handling and reporting

This technical architecture ensures the system is reliable, secure, and maintainable while providing excellent user experience and performance in a local development environment.
