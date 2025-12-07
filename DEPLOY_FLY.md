# Deploy to Fly.io

## Step 1: Install flyctl CLI

```bash
curl -L https://fly.io/install.sh | sh
```

Then reload your shell or run:
```bash
export FLYCTL_INSTALL="$HOME/.fly"
export PATH="$FLYCTL_INSTALL/bin:$PATH"
```

## Step 2: Login to Fly.io

```bash
flyctl auth login
```

This opens a browser to authenticate (no credit card needed for free tier).

## Step 3: Deploy

```bash
cd ~/emoji-city-madness
flyctl launch --copy-config --yes
```

This will:
- Use the existing `fly.toml` config
- Create the app on Fly.io
- Build and deploy the Docker container
- Give you a URL: `https://emoji-city-madness.fly.dev`

## That's It!

Your app will be live at the generated URL.

## Free Tier Details
- 3 shared CPU VMs (256MB RAM each)
- 160GB bandwidth/month
- Auto-sleep when inactive (saves resources)
- No credit card required

## Update Deployment

Push to GitHub, then run:
```bash
flyctl deploy
```
