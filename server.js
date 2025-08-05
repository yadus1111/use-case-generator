const express = require('express');
const cors = require('cors');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Check if API key is properly configured
if (!process.env.GEMINI_API_KEY) {
  console.error('ERROR: GEMINI_API_KEY is not set in environment variables');
  console.error('Please create a .env file with your Gemini API key');
  console.error('Copy env.example to .env and add your actual API key');
  process.exit(1);
}

console.log('Dotenv loaded. Environment check:');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'SET' : 'NOT SET');
console.log('PORT:', process.env.PORT || 'DEFAULT 5000');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from client/build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
} else {
  // In development, serve from client/public
  app.use(express.static(path.join(__dirname, 'client/public')));
}

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

// Parse CSV data from buffer
const parseCSVBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = require('stream');
    const readable = stream.Readable.from(buffer);
    
    readable
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

// Generate summary of CSV data
const generateCSVSummary = (data) => {
  if (!data || data.length === 0) return 'No data available';
  
  const columns = Object.keys(data[0]);
  const totalRows = data.length;
  const sampleData = data.slice(0, 5);
  
  let summary = `CSV Data Summary:\n`;
  summary += `Total rows: ${totalRows}\n`;
  summary += `Columns: ${columns.join(', ')}\n\n`;
  summary += `Sample data (first 5 rows):\n`;
  
  sampleData.forEach((row, index) => {
    summary += `Row ${index + 1}: ${JSON.stringify(row)}\n`;
  });
  
  return summary;
};

// Gemini API call
const generateUseCases = async (csvSummary, businessProblem = '', businessScenario = '') => {
  try {
    console.log('Starting use case generation...');
    
    // Environment variables check
    console.log('Environment variables check:');
    console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
    console.log('GEMINI_API_KEY value:', process.env.GEMINI_API_KEY ? 'SET' : 'NOT SET');
    
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    let contextInfo = '';
    if (businessProblem || businessScenario) {
      contextInfo = '\n\nBusiness Context:\n';
      if (businessProblem) {
        contextInfo += `Problem: ${businessProblem}\n`;
      }
      if (businessScenario) {
        contextInfo += `Scenario: ${businessScenario}\n`;
      }
    }

    const prompt = `Based on this Nepali digital wallet transaction data${businessProblem || businessScenario ? ' and the provided business context' : ''}, generate 5-8 highly targeted business use cases. Focus on practical fintech solutions for Nepal that address the specific business needs.

Transaction Data:
${csvSummary}${contextInfo}

${businessProblem ? 'IMPORTANT: Prioritize use cases that directly address the stated business problem.' : ''}
${businessScenario ? 'IMPORTANT: Consider the business scenario context when generating location and market-specific solutions.' : ''}

Respond with ONLY a JSON array containing objects with these fields:
{
  "title": "Use case title",
  "description": "Brief description of the use case",
  "businessImpact": "How this benefits the business",
  "priority": "High/Medium/Low",
  "mermaidDiagram": "Complete Mermaid diagram syntax for use case diagram. Use graph TD format with proper Mermaid syntax including actors as rectangles, use cases as ellipses, system boundary as a rectangle with dashed border, and relationships as arrows. Include detailed styling and labels. Example format: graph TD classDef actor fill:#3498db,stroke:#2980b9,stroke-width:2px,color:#fff classDef usecase fill:#2ecc71,stroke:#27ae60,stroke-width:2px,color:#fff classDef system fill:#f8f9fa,stroke:#667eea,stroke-width:3px,stroke-dasharray: 5 5 classDef datastore fill:#9b59b6,stroke:#8e44ad,stroke-width:2px,color:#fff User[User]:::actor System[Digital Wallet System]:::system UC1[Process Payment]:::usecase UC2[Check Balance]:::usecase DB[Transaction DB]:::datastore User --> UC1 User --> UC2 UC1 --> DB UC2 --> DB"
}

Keep responses concise and practical for the Nepali market. Generate diverse use cases covering different aspects like fraud detection, user engagement, merchant services, analytics, and compliance. For each use case, create a detailed Mermaid diagram that shows actors, use cases, system boundaries, data stores, and relationships with proper styling and labels.`;

    console.log('Calling Gemini API with prompt length:', prompt.length);
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error Response:', errorText);
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Raw API response length:', JSON.stringify(data).length);
    console.log('Raw API response preview:', JSON.stringify(data).substring(0, 200) + '...');

    let useCases = [];
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const responseText = data.candidates[0].content.parts[0].text;
      
      try {
        // Try to parse as direct JSON first
        useCases = JSON.parse(responseText);
      } catch (parseError) {
        console.log('Failed to parse JSON, trying to extract JSON from response');
        console.log('Parse error:', parseError.message, 'Response preview:', responseText.substring(0, 100));
        
        // Try to extract JSON from markdown code blocks
        const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          try {
            useCases = JSON.parse(jsonMatch[1]);
          } catch (extractError) {
            console.log('Failed to parse extracted JSON:', extractError.message);
          }
        } else {
          // Try to find JSON array in the response
          const arrayMatch = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/);
          if (arrayMatch) {
            try {
              console.log('Found JSON array in response, attempting to parse');
              useCases = JSON.parse(arrayMatch[0]);
            } catch (arrayError) {
              console.log('Failed to parse array match:', arrayError.message);
            }
          }
        }
      }
    }

    if (!Array.isArray(useCases) || useCases.length === 0) {
      throw new Error('Failed to generate valid use cases from API response');
    }

    console.log('Successfully extracted and parsed JSON');
    console.log('Use cases generated successfully, count:', useCases.length);
    
    return useCases;
  } catch (error) {
    console.error('Error generating use cases:', error);
    throw error;
  }
};

// Routes
app.post('/api/upload', upload.single('csvFile'), async (req, res) => {
  try {
    console.log('Upload request received');
    
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ error: 'Please upload a CSV file' });
    }

    console.log('File received:', req.file.originalname, 'Size:', req.file.size);

    // Extract business context
    const businessProblem = req.body.businessProblem || '';
    const businessScenario = req.body.businessScenario || '';
    
    console.log('Business Problem:', businessProblem);
    console.log('Business Scenario:', businessScenario);

    // Parse CSV data
    const csvData = await parseCSVBuffer(req.file.buffer);
    
    if (csvData.length === 0) {
      console.log('CSV file is empty or invalid');
      return res.status(400).json({ error: 'CSV file is empty or invalid' });
    }

    console.log('CSV parsed successfully, rows:', csvData.length);

    // Generate summary
    const csvSummary = generateCSVSummary(csvData);
    console.log('CSV summary generated, length:', csvSummary.length);
    
    // Generate use cases with business context
    console.log('Starting use case generation...');
    const useCases = await generateUseCases(csvSummary, businessProblem, businessScenario);
    console.log('Use cases generated successfully, count:', useCases.length);

    res.json({
      success: true,
      data: csvData,
      summary: csvSummary,
      useCases: useCases
    });

  } catch (error) {
    console.error('Upload error:', error);
    console.error('Error stack:', error.stack);
    
    // Send appropriate error response
    if (error.message.includes('API key')) {
      res.status(401).json({ 
        error: 'API key error: ' + error.message 
      });
    } else if (error.message.includes('Failed to generate use cases')) {
      res.status(500).json({ 
        error: 'Use case generation failed: ' + error.message 
      });
    } else {
      res.status(500).json({ 
        error: error.message || 'An error occurred while processing the file' 
      });
    }
  }
});

// Serve React app for all other routes (only in production)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// For Vercel serverless deployment
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app; 