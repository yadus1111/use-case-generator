# Use Case Generator

A full-stack web application that analyzes digital wallet transaction data from Nepal and generates valuable business insights using Google's Gemini API.

## Features

- **File Upload**: Drag-and-drop or click to upload CSV files
- **Data Preview**: View the first 5 rows of uploaded data
- **AI-Powered Analysis**: Generate business use cases using Google Gemini
- **Responsive Design**: Mobile-friendly interface
- **Export Functionality**: Download generated use cases as text file
- **Error Handling**: Comprehensive error messages and validation

## Tech Stack

- **Frontend**: React.js with modern CSS
- **Backend**: Node.js with Express
- **File Processing**: Multer for file uploads, csv-parser for CSV processing
- **AI Integration**: Google Gemini API
- **Styling**: Custom CSS with responsive design
- **Icons**: Lucide React icons

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Gemini API key

## Installation

1. **Clone or download the project files**

2. **Install backend dependencies**:
   ```bash
   npm install
   ```

3. **Install frontend dependencies**:
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Set up environment variables** (choose one method):
   
   **Option A: Use the setup script (recommended)**:
   ```bash
   npm run setup
   ```
   Then edit the created `.env` file with your API key.
   
   **Option B: Manual setup**:
   - Copy `env.example` to `.env`:
     ```bash
     cp env.example .env
     ```
   - Edit `.env` and add your Google Gemini API key:
     ```
     GEMINI_API_KEY=your_actual_gemini_api_key_here
     ```
      - Get your API key from: https://makersuite.google.com/app/apikey

## Running the Application

1. **Start the backend server**:
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:5000`

2. **Start the frontend** (in a new terminal):
   ```bash
   npm run client
   ```
   The React app will run on `http://localhost:3000`

3. **Access the application**:
   Open your browser and go to `http://localhost:3000`

## Usage

1. **Upload CSV File**:
   - Click the upload area or drag and drop a CSV file
   - Expected columns: `user_id`, `transaction_id`, `amount`, `location`, `timestamp`, `merchant_type`
   - Use the provided `sample_data.csv` for testing

2. **Generate Use Cases**:
   - Click "Generate Use Cases" button
   - The app will send your data to Google Gemini with a predefined prompt
   - Wait for the AI to generate business insights

3. **View Results**:
   - Review the generated use cases
   - Each use case includes title, description, and business impact
   - Download results as a text file if needed

4. **Reset and Re-upload**:
   - Use the "Reset" button to upload a new file
   - Generate new use cases with different data

## Sample Data Format

The application expects CSV files with the following structure:

```csv
user_id,transaction_id,amount,location,timestamp,merchant_type
U001,TXN001,1500.00,Kathmandu,2024-01-15 10:30:00,Restaurant
U002,TXN002,2500.00,Pokhara,2024-01-15 11:15:00,Transport
```

## API Endpoints

- `POST /api/upload`: Upload and process CSV files
  - Accepts multipart/form-data with 'csvFile' field
  - Returns processed data and generated use cases

## Error Handling

The application includes comprehensive error handling for:
- Invalid file types (non-CSV files)
- Empty or malformed CSV files
- Gemini API errors
- Network connectivity issues

## Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## Security Features

- File type validation
- File size limits
- Secure API key handling
- CORS configuration

## Development

To run in development mode with auto-reload:
```bash
npm run dev
```

To build for production:
```bash
npm run build
```

## Troubleshooting

1. **API Key Issues**: 
   - Ensure you've created a `.env` file with your Gemini API key
   - Verify your API key is valid and has sufficient credits
   - Get a new API key from: https://makersuite.google.com/app/apikey
2. **Gemini API Errors**: Check your API key and ensure you have sufficient credits
3. **File Upload Issues**: Check that your CSV file has the correct format
4. **Server Connection**: Verify the backend is running on port 5000
5. **CORS Issues**: The backend includes CORS configuration for local development

## License

MIT License - feel free to use and modify as needed.

## Deployment

### Deploy to Vercel (Recommended)

This application is configured for easy deployment to Vercel. Follow these steps:

1. **Prepare your repository**:
   - Ensure all files are committed to a Git repository
   - Make sure you have the required configuration files (`vercel.json`, etc.)

2. **Deploy using Vercel CLI**:
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Login to Vercel
   vercel login
   
   # Deploy
   vercel --prod
   ```

3. **Or use the provided deployment scripts**:
   ```bash
   # For Unix/Linux/Mac
   chmod +x deploy.sh
   ./deploy.sh
   
   # For Windows
   deploy.bat
   ```

4. **Set environment variables**:
   - In your Vercel dashboard, go to Settings → Environment Variables
   - Add `GEMINI_API_KEY` with your actual API key
   - Set environment to "Production"

5. **Access your deployed app**:
   - Your app will be available at `https://your-project-name.vercel.app`

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Alternative Deployment Options

- **Heroku**: Use the existing `heroku-postbuild` script in package.json
- **Railway**: Similar to Heroku deployment
- **DigitalOcean App Platform**: Configure as a Node.js app

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues or questions, please check the troubleshooting section or create an issue in the repository. 