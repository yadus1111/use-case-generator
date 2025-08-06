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

// Gemini API call
const generateUseCases = async (csvSummary, businessProblem = '', businessScenario = '', dataPatterns = {}) => {
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

    // Generate comprehensive analysis
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