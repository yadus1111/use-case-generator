# Troubleshooting Guide - Vercel Deployment Issues

## Current Issue: File Upload Error (400)

**Error Message:** `Server error (400): Failed to read uploaded file. Please try again.`

## Root Causes Identified

1. **Formidable Compatibility Issues**: Version 3.5.4 has known issues with Vercel serverless functions
2. **File System Access**: Vercel serverless functions have limited file system access
3. **Multipart Form Parsing**: Current implementation doesn't handle Vercel's specific requirements

## Solutions Implemented

### 1. Updated Original Upload Handler (`api/upload.js`)
- Removed problematic `/tmp` directory usage
- Added better error handling for Vercel environment
- Improved file buffer detection logic

### 2. Created Alternative Upload Handler (`api/upload-v2.js`)
- Uses manual multipart parsing (more Vercel-compatible)
- No dependency on formidable for file handling
- Direct buffer processing

### 3. Added Test Endpoint (`api/test-upload.js`)
- Simple endpoint to verify file upload functionality
- Helps diagnose issues before full processing

## Testing Steps

### Step 1: Test Basic Connectivity
```bash
# Test the test endpoint
curl https://your-vercel-domain.vercel.app/api/test-upload
```

### Step 2: Test File Upload
```bash
# Test file upload with the test endpoint
curl -X POST -F "file=@sample_data.csv" https://your-vercel-domain.vercel.app/api/test-upload
```

### Step 3: Test Main Upload Endpoints
```bash
# Test original upload endpoint
curl -X POST -F "csvFile=@sample_data.csv" -F "businessProblem=test" -F "businessScenario=test" https://your-vercel-domain.vercel.app/api/upload

# Test alternative upload endpoint
curl -X POST -F "csvFile=@sample_data.csv" -F "businessProblem=test" -F "businessScenario=test" https://your-vercel-domain.vercel.app/api/upload-v2
```

## Environment Variables Required

Make sure these are set in your Vercel project:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=production
```

## Vercel Configuration

Your `vercel.json` has been updated with:
- Proper function timeouts (30 seconds for upload handlers)
- Correct API routing
- Build and output directory configuration

## Client-Side Updates Needed

Update your frontend to use the new endpoint:

```javascript
// In your React app, change the upload URL to:
const response = await axios.post('/api/upload-v2', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
  timeout: 60000,
});
```

## Common Issues and Fixes

### Issue: "No file buffer or path found"
**Fix**: The new handlers check multiple buffer properties and provide better error messages

### Issue: "Formidable parse error"
**Fix**: The alternative handler bypasses formidable entirely

### Issue: "Request timeout"
**Fix**: Increased timeout to 60 seconds and added progress tracking

### Issue: "CORS errors"
**Fix**: Proper CORS headers are set in all API endpoints

## Deployment Checklist

- [ ] Commit all changes to your repository
- [ ] Push to your main branch (triggers Vercel deployment)
- [ ] Verify environment variables are set in Vercel dashboard
- [ ] Test the test endpoint first
- [ ] Test file upload with small CSV files
- [ ] Monitor Vercel function logs for errors

## Monitoring and Debugging

### Vercel Function Logs
1. Go to your Vercel dashboard
2. Navigate to Functions tab
3. Check the logs for your upload endpoints
4. Look for specific error messages

### Client-Side Debugging
1. Open browser developer tools
2. Check Network tab for failed requests
3. Look at response status codes and error messages
4. Check console for JavaScript errors

## Fallback Strategy

If the main upload endpoints continue to fail:

1. **Use the test endpoint** to verify basic functionality
2. **Check environment variables** in Vercel dashboard
3. **Monitor function logs** for specific error details
4. **Consider using a different approach** like base64 encoding for small files

## Performance Optimization

- File size limit: 10MB (configurable)
- Timeout: 60 seconds (configurable)
- Memory usage: Optimized for Vercel's limits
- Concurrent requests: Limited by Vercel's function limits

## Support and Next Steps

1. Test the new endpoints
2. Check Vercel function logs
3. Verify environment variables
4. If issues persist, check Vercel's serverless function documentation
5. Consider upgrading to Formidable v4 when it's stable
