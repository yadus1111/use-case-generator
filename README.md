
# Use Case Generator

[🌐 **Live Demo**](https://client-indol-two-74.vercel.app/)



A full-stack web application for generating business use cases from financial transaction data using AI.
## 🛠️ How It Works (Workflow)

1. **User uploads a CSV file** with transaction data through the web interface.
2. **User describes the business problem and scenario** in simple text fields.
3. **Backend (Node.js/Express)** receives the CSV, parses it, and analyzes the data for patterns.
4. **AI (Google Gemini API)** is called to generate business use cases based on the uploaded data and user input.
5. **Frontend (React)** displays the generated use cases and visualizes them with diagrams (using Mermaid.js).
6. **User can export** the results as PDF or text files for sharing.

---

## 📁 Main Files Explained (Simple Overview)

- `server.js` – The main backend server. Handles file uploads, talks to the AI, processes CSV data, and serves the frontend.
- `client/src/App.js` – The main React app. Handles user input, file upload, shows results, and manages the UI flow.
- `client/src/MermaidDiagram.js` – Renders the use case diagrams using Mermaid.js.
- `setup.js` – Script to help set up your `.env` file for API keys and configuration.
- `sample_data.csv` – Example CSV file to test the app.
- `vercel.json` – Configuration for Vercel deployment.
- `deploy-vercel.md` – Step-by-step guide for deploying to Vercel.

---

## Features

- Upload CSV transaction data
- Generate business use cases using Google Gemini AI
- Interactive use case visualization with Mermaid diagrams
- Export use cases to PDF
- Modern React frontend with responsive design
- Local development environment

## Local Development

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Google Gemini API key (get from [Google AI Studio](https://makersuite.google.com/app/apikey))

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd use_case_agent
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   npm run install-client
   ```

3. **Configure environment variables**
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit .env file and add your Gemini API key
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   PORT=5000
   NODE_ENV=development
   ```

4. **Start the application**
   ```bash
   # Start development server (runs both backend and frontend)
   npm run dev
   
   # Or start backend and frontend separately
   npm start          # Backend only (port 5000)
   npm run client     # Frontend only (port 3000)
   ```


The application will be available at `http://localhost:5000` (or use the [Live Demo](https://client-indol-two-74.vercel.app/))

## Usage

### 1. Define Business Context
- **Business Problem**: Describe the main challenge you're trying to solve
- **Business Scenario**: Provide context about your market and operations

### 2. Upload Your Data
- Upload a CSV file with transaction data
- Expected columns: user_id, transaction_id, amount, location, timestamp, merchant_type
- File size limit: 10MB

### 3. Generate Use Cases
- Click "Generate Use Cases" to analyze your data
- Processing typically takes 30-60 seconds
- Review the generated use cases with visual diagrams

### 4. Export Results
- Download individual PDF reports for each use case
- Export all use cases as text file
- Share results with stakeholders

## Technology Stack

### Backend
- Node.js with Express.js
- Multer for file uploads
- csv-parser for data processing
- Google Gemini API for AI analysis
- jsPDF and html2canvas for PDF generation

### Frontend
- React 18 with modern hooks
- Mermaid.js for diagram rendering
- Lucide React for icons
- Axios for HTTP communication
- Custom CSS with responsive design

## Environment Variables

Create a `.env` file with:
- `GEMINI_API_KEY`: Your Google Gemini API key
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)

## Scripts

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

## Troubleshooting

### Common Issues

1. **API Key Error**: Ensure your Gemini API key is correctly set in `.env`
2. **File Upload Error**: Check that your CSV file has the required columns
3. **Server Connection**: Verify the backend server is running on port 5000
4. **Processing Timeout**: Try with a smaller dataset first

### Performance Tips

- Keep CSV files under 10MB for optimal performance
- Use clean, well-structured data for better results
- Ensure stable internet connection for AI API calls
- Use modern browsers for best experience

## Documentation

- [Comprehensive Project Documentation](PROJECT_DOCUMENTATION.md)
- [Technical Architecture](TECHNICAL_ARCHITECTURE.md)
- [Quick Start Guide](QUICK_START_GUIDE.md)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Check the documentation files
- Review existing GitHub issues
- Contact the development team

---
