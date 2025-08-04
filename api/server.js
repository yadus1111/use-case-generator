const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 5000;

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// API endpoint for file upload and processing
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const results = [];
    const filePath = req.file.path;

    // Parse CSV file
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          // Clean up uploaded file
          fs.unlinkSync(filePath);

          if (results.length === 0) {
            return res.status(400).json({ error: 'No data found in CSV file' });
          }

          // Generate use cases using Gemini AI
          const useCases = await generateUseCases(results);

          res.json({
            success: true,
            useCases: useCases,
            totalUseCases: useCases.length
          });
        } catch (error) {
          console.error('Error processing data:', error);
          res.status(500).json({ error: 'Error processing data' });
        }
      });
  } catch (error) {
    console.error('Error handling upload:', error);
    res.status(500).json({ error: 'Error handling upload' });
  }
});

// Function to generate use cases using Gemini AI
async function generateUseCases(data) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Based on the following CSV data, generate detailed use cases for a business analysis project. 
    For each use case, provide:
    1. A clear title
    2. Description
    3. Actors involved
    4. Preconditions
    5. Main flow
    6. Postconditions
    7. Priority (High/Medium/Low)
    8. A Mermaid use case diagram

    CSV Data:
    ${JSON.stringify(data, null, 2)}

    Please format the response as a JSON array with the following structure:
    [
      {
        "title": "Use Case Title",
        "description": "Detailed description",
        "actors": ["Actor1", "Actor2"],
        "preconditions": ["Precondition1", "Precondition2"],
        "mainFlow": ["Step1", "Step2", "Step3"],
        "postconditions": ["Postcondition1", "Postcondition2"],
        "priority": "High/Medium/Low",
        "mermaidDiagram": "graph TD\n    A[User] --> B[System]\n    B --> C[Result]"
      }
    ]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      // Fallback: try to parse the entire response
      return JSON.parse(text);
    }
  } catch (error) {
    console.error('Error generating use cases:', error);
    throw error;
  }
}

// Serve React app for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Export for Vercel serverless
module.exports = app;