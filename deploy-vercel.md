# Vercel Deployment Guide - File Upload Fix

## Quick Fix Summary

Your Vercel deployment is experiencing file upload issues due to compatibility problems between Formidable and Vercel's serverless environment. Here's what we've implemented:

## Changes Made

1. **Updated `api/upload.js`** - Improved Vercel compatibility
2. **Created `api/upload-v2.js`** - Alternative upload handler without Formidable
3. **Added `api/test-upload.js`** - Test endpoint for debugging
4. **Updated `vercel.json`** - Proper function configuration
5. **Modified client code** - Fallback upload strategy
6. **Created troubleshooting guide** - Comprehensive debugging steps

## Deployment Steps

### 1. Commit and Push Changes
```bash
git add .
git commit -m "Fix Vercel file upload compatibility issues"
git push origin main
```

### 2. Verify Vercel Deployment
- Go to your [Vercel Dashboard](https://vercel.com/yadu-sharmas-projects/agentic_ba_dashboard)
- Check that the deployment completes successfully
- Monitor for any build errors

### 3. Test the Fixes

#### Test Basic Connectivity
```bash
curl https://your-vercel-domain.vercel.app/api/test-upload
```

#### Test File Upload
```bash
curl -X POST -F "csvFile=@sample_data.csv" -F "businessProblem=test" -F "businessScenario=test" https://your-vercel-domain.vercel.app/api/upload-v2
```

### 4. Check Environment Variables
In your Vercel dashboard, ensure these are set:
- `GEMINI_API_KEY` - Your Gemini API key
- `NODE_ENV` - Set to `production`

## What to Expect

## Testing Your Frontend

1. **Open your deployed app** at your Vercel URL
2. **Try uploading a CSV file** - it should now work
3. **Check browser console** for any remaining errors
4. **Monitor Vercel function logs** for backend issues

## If Issues Persist

1. **Check Vercel function logs** for specific error messages
2. **Verify environment variables** are correctly set
3. **Test with smaller CSV files** first
4. **Use the test endpoint** to isolate issues

## Monitoring

- **Vercel Dashboard** → Functions → Check logs
- **Browser Developer Tools** → Network tab → Monitor requests
- **Console logs** → Look for error messages

## Rollback Plan

If the new approach causes issues:
1. Revert to the original `api/upload.js`
2. Remove the new endpoints
3. Update `vercel.json` to remove new function configs
4. Redeploy

## Support Resources

- [Vercel Serverless Functions Documentation](https://vercel.com/docs/concepts/functions/serverless-functions)
- [Formidable Documentation](https://github.com/node-formidable/formidable)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

## Next Steps

1. **Deploy the changes** following the steps above
2. **Test thoroughly** with your CSV files
3. **Monitor performance** and error rates
4. **Consider upgrading** to Formidable v4 when stable
5. **Optimize further** based on usage patterns
