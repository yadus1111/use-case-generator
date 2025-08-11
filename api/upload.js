import formidable from 'formidable';
import csv from 'csv-parser';
import { Readable } from 'stream';
import fs from 'fs';

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

// Advanced pattern analysis for targeted insights
const analyzeDataPatterns = (data) => {
  if (!data || data.length === 0) return {};
  
  const columns = Object.keys(data[0]);
  const patterns = {
    transactionPatterns: {},
    userPatterns: {},
    geographicPatterns: {},
    temporalPatterns: {},
    merchantPatterns: {},
    insights: []
  };
  
  // Find amount column
  const amountColumn = columns.find(col => 
    col.toLowerCase().includes('amount') || 
    col.toLowerCase().includes('value') || 
    col.toLowerCase().includes('transaction_amount')
  );
  
  // Find merchant/category columns
  const merchantColumn = columns.find(col => 
    col.toLowerCase().includes('merchant') || 
    col.toLowerCase().includes('vendor') || 
    col.toLowerCase().includes('store')
  );
  
  const categoryColumn = columns.find(col => 
    col.toLowerCase().includes('category') || 
    col.toLowerCase().includes('type') || 
    col.toLowerCase().includes('transaction_type')
  );
  
  // Find location columns
  const locationColumn = columns.find(col => 
    col.toLowerCase().includes('location') || 
    col.toLowerCase().includes('region') || 
    col.toLowerCase().includes('city') || 
    col.toLowerCase().includes('area')
  );
  
  // Find user columns
  const userColumn = columns.find(col => 
    col.toLowerCase().includes('user') || 
    col.toLowerCase().includes('customer') || 
    col.toLowerCase().includes('user_id')
  );
  
  // Find date/time columns
  const dateColumn = columns.find(col => 
    col.toLowerCase().includes('date') || 
    col.toLowerCase().includes('time') || 
    col.toLowerCase().includes('timestamp')
  );
  
  // Analyze transaction patterns
  if (amountColumn) {
    const amounts = data.map(row => parseFloat(row[amountColumn])).filter(val => !isNaN(val));
    if (amounts.length > 0) {
      patterns.transactionPatterns = {
        totalTransactions: amounts.length,
        totalVolume: amounts.reduce((sum, val) => sum + val, 0),
        averageAmount: amounts.reduce((sum, val) => sum + val, 0) / amounts.length,
        minAmount: Math.min(...amounts),
        maxAmount: Math.max(...amounts),
        medianAmount: amounts.sort((a, b) => a - b)[Math.floor(amounts.length / 2)]
      };
      
      // Identify high-value transactions
      const highValueThreshold = patterns.transactionPatterns.averageAmount * 2;
      const highValueTransactions = amounts.filter(amount => amount > highValueThreshold);
      patterns.transactionPatterns.highValueCount = highValueTransactions.length;
      patterns.transactionPatterns.highValuePercentage = (highValueTransactions.length / amounts.length) * 100;
    }
  }
  
  // Analyze merchant patterns
  if (merchantColumn) {
    const merchants = data.map(row => row[merchantColumn]).filter(val => val);
    const merchantFrequency = {};
    merchants.forEach(merchant => {
      merchantFrequency[merchant] = (merchantFrequency[merchant] || 0) + 1;
    });
    
    const topMerchants = Object.entries(merchantFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    patterns.merchantPatterns = {
      uniqueMerchants: Object.keys(merchantFrequency).length,
      topMerchants: topMerchants,
      merchantConcentration: (topMerchants[0] ? topMerchants[0][1] / merchants.length * 100 : 0)
    };
  }
  
  // Analyze category patterns
  if (categoryColumn) {
    const categories = data.map(row => row[categoryColumn]).filter(val => val);
    const categoryFrequency = {};
    categories.forEach(category => {
      categoryFrequency[category] = (categoryFrequency[category] || 0) + 1;
    });
    
    const topCategories = Object.entries(categoryFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    patterns.categoryPatterns = {
      uniqueCategories: Object.keys(categoryFrequency).length,
      topCategories: topCategories
    };
  }
  
  // Analyze geographic patterns
  if (locationColumn) {
    const locations = data.map(row => row[locationColumn]).filter(val => val);
    const locationFrequency = {};
    locations.forEach(location => {
      locationFrequency[location] = (locationFrequency[location] || 0) + 1;
    });
    
    const topLocations = Object.entries(locationFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    patterns.geographicPatterns = {
      uniqueLocations: Object.keys(locationFrequency).length,
      topLocations: topLocations,
      geographicConcentration: (topLocations[0] ? topLocations[0][1] / locations.length * 100 : 0)
    };
  }
  
  // Analyze user patterns
  if (userColumn) {
    const users = data.map(row => row[userColumn]).filter(val => val);
    const userFrequency = {};
    users.forEach(user => {
      userFrequency[user] = (userFrequency[user] || 0) + 1;
    });
    
    const activeUsers = Object.entries(userFrequency)
      .filter(([user, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    patterns.userPatterns = {
      uniqueUsers: Object.keys(userFrequency).length,
      activeUsers: activeUsers.length,
      averageTransactionsPerUser: users.length / Object.keys(userFrequency).length,
      topUsers: activeUsers.slice(0, 5)
    };
  }
  
  // Generate insights based on patterns
  if (patterns.transactionPatterns.totalTransactions) {
    if (patterns.transactionPatterns.highValuePercentage > 20) {
      patterns.insights.push("High-value transactions represent a significant portion of volume");
    }
    if (patterns.merchantPatterns && patterns.merchantPatterns.merchantConcentration > 30) {
      patterns.insights.push("Merchant concentration is high - opportunity for diversification");
    }
    if (patterns.geographicPatterns && patterns.geographicPatterns.geographicConcentration > 40) {
      patterns.insights.push("Geographic concentration suggests regional expansion opportunities");
    }
    if (patterns.userPatterns && patterns.userPatterns.averageTransactionsPerUser > 3) {
      patterns.insights.push("Users show good engagement with multiple transactions");
    }
  }
  
  return patterns;
};

// Generate comprehensive analysis of CSV data
const generateCSVSummary = (data) => {
  if (!data || data.length === 0) return 'No data available';
  
  const columns = Object.keys(data[0]);
  const totalRows = data.length;
  
  let analysis = `CSV Data Analysis:\n`;
  analysis += `Total rows: ${totalRows}\n`;
  analysis += `Columns: ${columns.join(', ')}\n\n`;
  
  // Analyze each column for patterns
  columns.forEach(column => {
    const values = data.map(row => row[column]).filter(val => val !== null && val !== undefined);
    const uniqueValues = [...new Set(values)];
    
    analysis += `Column: ${column}\n`;
    analysis += `  - Unique values: ${uniqueValues.length}\n`;
    analysis += `  - Sample values: ${uniqueValues.slice(0, 5).join(', ')}${uniqueValues.length > 5 ? '...' : ''}\n`;
    
    // Analyze numeric columns
    if (values.length > 0 && !isNaN(values[0])) {
      const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
      if (numericValues.length > 0) {
        const sum = numericValues.reduce((a, b) => a + b, 0);
        const avg = sum / numericValues.length;
        const min = Math.min(...numericValues);
        const max = Math.max(...numericValues);
        analysis += `  - Numeric analysis: Avg=${avg.toFixed(2)}, Min=${min}, Max=${max}\n`;
      }
    }
    
    // Analyze categorical columns for frequency
    if (uniqueValues.length <= 20 && uniqueValues.length > 0) {
      const frequency = {};
      values.forEach(val => {
        frequency[val] = (frequency[val] || 0) + 1;
      });
      const sortedFreq = Object.entries(frequency).sort((a, b) => b[1] - a[1]);
      analysis += `  - Top values: ${sortedFreq.slice(0, 3).map(([val, count]) => `${val}(${count})`).join(', ')}\n`;
    }
    analysis += '\n';
  });
  
  // Cross-column analysis for common patterns
  analysis += `Pattern Analysis:\n`;
  
  // Look for transaction-related patterns
  const hasAmount = columns.some(col => col.toLowerCase().includes('amount') || col.toLowerCase().includes('value'));
  const hasMerchant = columns.some(col => col.toLowerCase().includes('merchant') || col.toLowerCase().includes('vendor'));
  const hasCategory = columns.some(col => col.toLowerCase().includes('category') || col.toLowerCase().includes('type'));
  const hasLocation = columns.some(col => col.toLowerCase().includes('location') || col.toLowerCase().includes('region') || col.toLowerCase().includes('city'));
  const hasUser = columns.some(col => col.toLowerCase().includes('user') || col.toLowerCase().includes('customer'));
  const hasDate = columns.some(col => col.toLowerCase().includes('date') || col.toLowerCase().includes('time'));
  
  if (hasAmount && hasMerchant) {
    analysis += `- Transaction pattern detected: Amount + Merchant data available\n`;
  }
  if (hasCategory) {
    analysis += `- Categorization pattern detected: Transaction categories available\n`;
  }
  if (hasLocation) {
    analysis += `- Geographic pattern detected: Location data available\n`;
  }
  if (hasUser) {
    analysis += `- User pattern detected: Individual user tracking available\n`;
  }
  if (hasDate) {
    analysis += `- Temporal pattern detected: Time-based analysis possible\n`;
  }
  
  // Sample data for context
  analysis += `\nSample Data (first 3 rows):\n`;
  data.slice(0, 3).forEach((row, index) => {
    analysis += `Row ${index + 1}: ${JSON.stringify(row)}\n`;
  });
  
  return analysis;
};

// Enhanced Gemini API call with pattern analysis
const generateUseCases = async (csvSummary, businessProblem = '', businessScenario = '', dataPatterns = {}) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
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

  const prompt = `You are a business analyst specializing in digital wallet and fintech solutions for Nepal. Analyze the provided transaction data patterns and generate 5-8 highly targeted business use cases that directly address the specific business problem and scenario.

DATA ANALYSIS:
${csvSummary}${contextInfo}

PATTERN ANALYSIS:
${JSON.stringify(dataPatterns, null, 2)}

INSTRUCTIONS:
1. First, analyze the specific data patterns identified above (transaction patterns, merchant patterns, geographic patterns, user patterns, category patterns)
2. Based on the detected patterns and insights, generate use cases that leverage the actual data structure and relationships
3. Focus on solutions that directly address the stated business problem: "${businessProblem}"
4. Consider the business scenario: "${businessScenario}"
5. Prioritize use cases that can be implemented using the available data columns and patterns
6. Use the specific insights from the pattern analysis to create targeted solutions

REQUIREMENTS:
- Each use case must be based on specific patterns found in the data analysis
- Use cases should be practical and implementable in the Nepali market
- Consider the detected patterns (transaction, categorization, geographic, user, temporal) when designing solutions
- Focus on merchant partnership optimization as stated in the business problem
- Leverage the specific insights from the pattern analysis

Respond with ONLY a JSON array containing objects with these fields:
{
  "title": "Use case title (based on data patterns)",
  "description": "Detailed description explaining how this use case leverages the specific data patterns identified",
  "businessImpact": "Specific business benefits addressing the stated problem",
  "priority": "High/Medium/Low (based on data availability and business impact)",
  "dataPatterns": "List the specific data patterns this use case leverages",
  "mermaidDiagram": "Complete Mermaid diagram syntax showing the use case flow with actors, system boundaries, data stores, and relationships. Use graph TD format with proper styling."
}

Focus on use cases that:
- Leverage transaction amount and merchant data for partnership optimization
- Use geographic patterns for regional expansion strategies
- Apply user behavior patterns for targeted merchant acquisition
- Utilize temporal patterns for seasonal partnership strategies
- Combine multiple data patterns for comprehensive solutions
- Address the specific insights identified in the pattern analysis`;

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
      // Try to parse as direct JSON first
      useCases = JSON.parse(responseText);
    } catch (parseError) {
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
            useCases = JSON.parse(arrayMatch[0]);
          } catch {}
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
  console.log('API route called:', req.method, req.url);
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    console.log('Starting file upload processing...');
    
    // Parse multipart form data with Vercel-compatible configuration
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      keepExtensions: true,
      // Vercel-specific configuration
      allowEmptyFiles: false,
      filter: (part) => {
        // Only allow CSV files
        return part.mimetype && part.mimetype.includes('csv');
      }
    });
    
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Formidable parse error:', err);
          reject(err);
        } else {
          console.log('Form data parsed successfully');
          resolve([fields, files]);
        }
      });
    });

    console.log('Fields received:', Object.keys(fields));
    console.log('Files object:', files);

    // Try to find the first file in the files object
    const fileKeys = Object.keys(files);
    if (fileKeys.length === 0) {
      console.log('No files found in request');
      return res.status(400).json({ error: 'No files found in request' });
    }
    
    const csvFile = files[fileKeys[0]]; // get the first file, regardless of key
    console.log('CSV file details:', csvFile);

    // Handle both single file and array of files
    let targetFile = Array.isArray(csvFile) ? csvFile[0] : csvFile;
    
    if (!targetFile) {
      console.log('No valid file found');
      return res.status(400).json({ error: 'No valid file found' });
    }

    console.log('Target file:', targetFile);

    // Read file buffer with proper error handling for Vercel
    let buffer;
    try {
      if (targetFile.buffer) {
        // File is already in memory (common in Vercel)
        buffer = targetFile.buffer;
        console.log('Using file buffer, size:', buffer.length);
      } else if (targetFile.filepath) {
        // File was saved to disk (less common in Vercel)
        buffer = fs.readFileSync(targetFile.filepath);
        console.log('Read file from disk, size:', buffer.length);
        // Clean up temp file
        try {
          fs.unlinkSync(targetFile.filepath);
        } catch (unlinkError) {
          console.log('Could not delete temp file:', unlinkError.message);
        }
      } else if (targetFile.data) {
        // Alternative buffer property
        buffer = targetFile.data;
        console.log('Using file data, size:', buffer.length);
      } else {
        throw new Error('No file buffer, path, or data found');
      }
    } catch (fileError) {
      console.error('File reading error:', fileError);
      return res.status(400).json({ 
        error: 'Failed to read uploaded file. Please try again.' 
      });
    }

    if (!buffer || buffer.length === 0) {
      console.log('Empty file buffer');
      return res.status(400).json({ error: 'File is empty' });
    }

    // Extract business context
    const businessProblem = fields.businessProblem || '';
    const businessScenario = fields.businessScenario || '';

    console.log('Business Problem:', businessProblem);
    console.log('Business Scenario:', businessScenario);

    // Parse CSV data
    console.log('Parsing CSV data...');
    const csvData = await parseCSVBuffer(buffer);
    
    if (csvData.length === 0) {
      console.log('CSV file is empty or invalid');
      return res.status(400).json({ error: 'CSV file is empty or invalid' });
    }

    console.log('CSV parsed successfully, rows:', csvData.length);

    // Generate comprehensive analysis
    console.log('Generating CSV analysis...');
    const csvSummary = generateCSVSummary(csvData);
    const dataPatterns = analyzeDataPatterns(csvData);
    
    console.log('CSV analysis generated, length:', csvSummary.length);
    console.log('Data patterns identified:', Object.keys(dataPatterns).filter(key => key !== 'insights').length);
    console.log('Key insights:', dataPatterns.insights);
    
    // Generate use cases with business context and pattern analysis
    console.log('Starting use case generation...');
    const useCases = await generateUseCases(csvSummary, businessProblem, businessScenario, dataPatterns);

    console.log('Use cases generated successfully, count:', useCases.length);

    res.json({
      success: true,
      data: csvData,
      summary: csvSummary,
      patterns: dataPatterns,
      useCases: useCases
    });

  } catch (error) {
    console.error('Upload error:', error);
    console.error('Error stack:', error.stack);
    
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
}