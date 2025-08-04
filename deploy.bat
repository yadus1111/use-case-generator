@echo off
echo 🚀 Starting deployment to Vercel...

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Vercel CLI is not installed. Installing now...
    npm install -g vercel
)

REM Check if user is logged in to Vercel
vercel whoami >nul 2>&1
if errorlevel 1 (
    echo 🔐 Please log in to Vercel...
    vercel login
)

REM Build the client
echo 📦 Building React client...
cd client
call npm install
call npm run build
cd ..

REM Deploy to Vercel
echo 🚀 Deploying to Vercel...
vercel --prod

echo ✅ Deployment complete!
echo 📝 Don't forget to set your GEMINI_API_KEY environment variable in the Vercel dashboard!
pause 