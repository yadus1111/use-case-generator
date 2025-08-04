# Deployment Guide - Vercel

This guide will help you deploy your Use Case Generator application to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Account**: Your code should be in a GitHub repository
3. **Gemini API Key**: You'll need to set this as an environment variable

## Step 1: Prepare Your Repository

1. Make sure your code is committed to a GitHub repository
2. Ensure you have the following files in your repository:
   - `vercel.json` (already created)
   - `server.js` (modified for Vercel)
   - `client/package.json` (with vercel-build script)
   - `.gitignore` (to exclude sensitive files)

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: Leave empty (Vercel will use the config)
   - **Output Directory**: Leave empty (Vercel will use the config)
5. Click "Deploy"

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from your project directory:
   ```bash
   vercel
   ```

## Step 3: Configure Environment Variables

1. In your Vercel dashboard, go to your project
2. Navigate to "Settings" → "Environment Variables"
3. Add the following environment variable:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Your actual Gemini API key
   - **Environment**: Production (and Preview if you want)

## Step 4: Verify Deployment

1. Your app will be available at `https://your-project-name.vercel.app`
2. Test the application:
   - Upload a CSV file
   - Check if use cases are generated
   - Verify Mermaid diagrams render correctly

## Troubleshooting

### Common Issues:

1. **API Key Not Found**: Make sure `GEMINI_API_KEY` is set in Vercel environment variables
2. **Build Failures**: Check the build logs in Vercel dashboard
3. **CORS Issues**: The server is configured with CORS, but if you have issues, check the CORS settings

### Environment Variables Check:

Your application will log environment variable status. Check the Vercel function logs to ensure:
- `GEMINI_API_KEY` is properly set
- `NODE_ENV` is set to "production"

## File Structure for Vercel

```
use_case_agent/
├── vercel.json          # Vercel configuration
├── server.js            # Main server file (modified for Vercel)
├── package.json         # Root package.json
├── client/
│   ├── package.json     # Client package.json (with vercel-build script)
│   ├── src/             # React source files
│   └── public/          # Static files
├── .gitignore           # Git ignore file
└── DEPLOYMENT.md        # This file
```

## Next Steps

After successful deployment:

1. **Custom Domain**: You can add a custom domain in Vercel settings
2. **Environment Variables**: Add any additional environment variables you need
3. **Monitoring**: Use Vercel's built-in analytics and monitoring
4. **CI/CD**: Every push to your main branch will trigger automatic deployments

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables are set correctly
3. Test locally with `npm run dev` to ensure the app works
4. Check the Vercel documentation for more details 