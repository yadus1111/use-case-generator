const formidable = require('formidable');
const csv = require('csv-parser');
const { Readable } = require('stream');

// Helper: Parse CSV from buffer
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

// Helper: Generate CSV summary
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

// Helper: Gemini API call
const generateUseCases = async (csvSummary, businessProblem = '', businessScenario = '') => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }
  let contextInfo = '';
  if (businessProblem || businessScenario) {
    contextInfo = '\n\nBusiness Context:\n';
    if (businessProblem) contextInfo += `Problem: ${businessProblem}\n`;
    if (businessScenario) contextInfo += `Scenario: ${businessScenario}\n`;
  }
  const prompt = `Based on this Nepali digital wallet transaction data${businessProblem || businessScenario ? ' and the provided business context' : ''}, generate 5-8 highly targeted business use cases. Focus on practical fintech solutions for Nepal that address the specific business needs.\n\nTransaction Data:\n${csvSummary}${contextInfo}\n\n${businessProblem ? 'IMPORTANT: Prioritize use cases that directly address the stated business problem.' : ''}\n${businessScenario ? 'IMPORTANT: Consider the business scenario context when generating location and market-specific solutions.' : ''}\n\nRespond with ONLY a JSON array containing objects with these fields:\n{\n  "title": "Use case title",\n  "description": "Brief description of the use case",\n  "businessImpact": "How this benefits the business",\n  "priority": "High/Medium/Low",\n  "mermaidDiagram": "Complete Mermaid diagram syntax for use case diagram. Use graph TD format with proper Mermaid syntax including actors as rectangles, use cases as ellipses, system boundary as a rectangle with dashed border, and relationships as arrows. Include detailed styling and labels. Example format: graph TD classDef actor fill:#3498db,stroke:#2980b9,stroke-width:2px,color:#fff classDef usecase fill:#2ecc71,stroke:#27ae60,stroke-width:2px,color:#fff classDef system fill:#f8f9fa,stroke:#667eea,stroke-width:3px,stroke-dasharray: 5 5 classDef datastore fill:#9b59b6,stroke:#8e44ad,stroke-width:2px,color:#fff User[User]:::actor System[Digital Wallet System]:::system UC1[Process Payment]:::usecase UC2[Check Balance]:::usecase DB[Transaction DB]:::datastore User --> UC1 User --> UC2 UC1 --> DB UC2 --> DB"\n}\n\nKeep responses concise and practical for the Nepali market. Generate diverse use cases covering different aspects like fraud detection, user engagement, merchant services, analytics, and compliance. For each use case, create a detailed Mermaid diagram that shows actors, use cases, system boundaries, data stores, and relationships with proper styling and labels.`;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
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
    throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }
  const data = await response.json();
  let useCases = [];
  if (data.candidates && data.candidates[0] && data.candidates[0].content) {
    const responseText = data.candidates[0].content.parts[0].text;
    try {
      useCases = JSON.parse(responseText);
    } catch {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        try { useCases = JSON.parse(jsonMatch[1]); } catch {}
      } else {
        // Try to find JSON array in the response
        const arrayMatch = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (arrayMatch) {
          try { useCases = JSON.parse(arrayMatch[0]); } catch {}
        }
      }
    }
  }
  if (!Array.isArray(useCases) || useCases.length === 0) {
    throw new Error('Failed to generate valid use cases from API response');
  }
  return useCases;
};

// Vercel serverless function handler
export const config = {
  api: {
    bodyParser: false, // Disables default body parser to handle multipart/form-data
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    try {
      if (err) throw err;
      if (!files.csvFile) {
        res.status(400).json({ error: 'Please upload a CSV file' });
        return;
      }
      const businessProblem = fields.businessProblem || '';
      const businessScenario = fields.businessScenario || '';
      const file = files.csvFile;
      const buffer = await fs.promises.readFile(file.filepath);
      const csvData = await parseCSVBuffer(buffer);
      if (csvData.length === 0) {
        res.status(400).json({ error: 'CSV file is empty or invalid' });
        return;
      }
      const csvSummary = generateCSVSummary(csvData);
      const useCases = await generateUseCases(csvSummary, businessProblem, businessScenario);
      res.json({
        success: true,
        data: csvData,
        summary: csvSummary,
        useCases: useCases
      });
    } catch (error) {
      res.status(500).json({ error: error.message || 'An error occurred while processing the file' });
    }
  });
}