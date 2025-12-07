# Deploy to Railway

## Quick Start (Manual - Free Tier)

1. **Go to Railway**: https://railway.app
2. **Sign in** with GitHub
3. **New Project** → **Deploy from GitHub repo**
4. **Select**: `whoshotu/emoji-city-madness`
5. **Railway will auto-detect** the Dockerfile and deploy
6. **Wait 2-3 minutes** for build to complete
7. **Get URL**: Click "Settings" → "Generate Domain"

## Railway Free Tier
- **$5/month credit** (no credit card required)
- ~500 hours/month runtime
- Auto-sleep after inactivity (like Render)
- **Better**: More reliable builds, clearer error logs

## No Configuration Needed
Railway auto-detects:
- ✅ Dockerfile
- ✅ PORT environment variable
- ✅ GitHub repository
- ✅ Node.js version (from Dockerfile)

## Done!
Your app will be at: `https://[random-name].up.railway.app`

You can customize the domain in Settings → Networking.
