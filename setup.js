#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Use Case Generator Setup');
console.log('============================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from env.example...');
  
  if (fs.existsSync(envExamplePath)) {
    try {
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ .env file created successfully!');
      console.log('\n📋 Next steps:');
      console.log('1. Edit the .env file and add your Gemini API key');
      console.log('2. Get your API key from: https://makersuite.google.com/app/apikey');
      console.log('3. Replace "your_gemini_api_key_here" with your actual API key');
      console.log('4. Run "npm run dev" to start the application');
    } catch (error) {
      console.error('❌ Error creating .env file:', error.message);
      process.exit(1);
    }
  } else {
    console.error('❌ env.example file not found!');
    process.exit(1);
  }
} else {
  console.log('✅ .env file already exists');
  
  // Check if API key is set
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('your_gemini_api_key_here')) {
    console.log('⚠️  Warning: You still need to add your actual Gemini API key to .env');
    console.log('   Get your API key from: https://makersuite.google.com/app/apikey');
  } else {
    console.log('✅ API key appears to be configured');
  }
}

console.log('\n�� Setup complete!'); 