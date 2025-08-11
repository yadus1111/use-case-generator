module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  res.status(200).json({ 
    status: 'API is working!',
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'production'
  });
}; 