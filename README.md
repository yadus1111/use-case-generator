# Use Case Generator

A full-stack web application for generating business use cases from digital wallet transaction data using AI.

## Features

- Upload CSV transaction data
- Generate business use cases using Google Gemini AI
- Interactive use case visualization with Mermaid diagrams
- Export use cases to PDF
- Modern React frontend with responsive design

## Deployment

This application is deployed on Vercel with automatic deployments from GitHub.

### Latest Update
- Fixed Vercel deployment configuration
- Simplified build process for better reliability
- Updated API endpoints for production deployment

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Install client dependencies: `npm run install-client`
4. Set up environment variables (see env.example)
5. Start development server: `npm run dev`

## Environment Variables

Create a `.env` file with:
- `GEMINI_API_KEY`: Your Google Gemini API key
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production) 