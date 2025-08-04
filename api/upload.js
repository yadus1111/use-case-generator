const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Configure multer for file uploads
const upload = multer({ dest: '/tmp/' });

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
        "mermaidDiagram": "graph TD\\n    A[User] --> B[System]\\n    B --> C[Result]"
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

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Use multer to handle file upload
    upload.single('file')(req, res, async (err) => {
      if (err) {
        console.error('Multer error:', err);
        return res.status(400).json({ error: 'File upload error' });
      }

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
        })
        .on('error', (error) => {
          console.error('CSV parsing error:', error);
          res.status(500).json({ error: 'Error parsing CSV file' });
        });
    });
  } catch (error) {
    console.error('Error handling upload:', error);
    res.status(500).json({ error: 'Error handling upload' });
  }
}; 