# AWS Amplify Deployment Guide

## Prerequisites

- AWS Account
- GitHub repository connected

## Quick Deploy

### 1. Create Amplify App

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click **"Create new app"**
3. Select **"Host web app"**
4. Connect your GitHub repository
5. Select the branch to deploy (e.g., `main`)

### 2. Configure Build Settings

Amplify will auto-detect `amplify.yml`. If not, use:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

### 3. Set Environment Variables

In Amplify Console → App settings → Environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_PLATFORM` | `aws` | Switches to AWS RUM analytics |
| `NEXT_PUBLIC_AWS_RUM_APP_ID` | `your-app-id` | From RUM setup |
| `NEXT_PUBLIC_AWS_RUM_REGION` | `eu-central-1` | Your AWS region |
| `NEXT_PUBLIC_AWS_RUM_IDENTITY_POOL_ID` | `eu-central-1:xxx` | Cognito Identity Pool |
| `NEXT_PUBLIC_AWS_RUM_GUEST_ROLE_ARN` | `arn:aws:iam::...` | Guest role for RUM |
| `AWS_ACCESS_KEY_ID` | `AKIA...` | For DynamoDB access |
| `AWS_SECRET_ACCESS_KEY` | `***` | For DynamoDB access |
| `AWS_REGION` | `eu-central-1` | DynamoDB region |
| `OPENAI_API_KEY` | `sk-...` | OpenAI API key |

> **Note:** For Vercel, set `NEXT_PUBLIC_PLATFORM=vercel` (or leave unset, it defaults to vercel).

### 4. Deploy

Click **"Save and deploy"**. Amplify will:
- Pull your code
- Install dependencies
- Build the Next.js app
- Deploy to CloudFront

## Setting Up AWS RUM (Optional)

### Create CloudWatch RUM App Monitor

1. Go to [CloudWatch Console](https://console.aws.amazon.com/cloudwatch/) → Application Signals → RUM
2. Click **"Add app monitor"**
3. Configure:
   - App monitor name: `search-room`
   - Application domain: your Amplify domain
4. Under **Authorization**:
   - Select "Create new identity pool"
   - This creates the Cognito Identity Pool ID and Guest Role ARN
5. Copy the configuration values to Amplify environment variables

## Custom Domain

1. Amplify Console → Domain management
2. Add your custom domain
3. Amplify handles SSL certificate via ACM automatically

## Comparison: Vercel vs Amplify

| Feature | Vercel | Amplify |
|---------|--------|---------|
| Analytics | Vercel Analytics | AWS RUM |
| Database | DynamoDB ✓ | DynamoDB ✓ |
| Edge Functions | Edge Runtime | Lambda@Edge |
| Preview Deploys | ✓ | ✓ |
| Custom Domains | ✓ | ✓ |
| SSL | Automatic | Automatic |

## Troubleshooting

### Build Fails

Check Node.js version in Amplify:
- Go to Build settings → Build image settings
- Set Node.js version to 20

### DynamoDB Connection Issues

Ensure IAM role has DynamoDB permissions, or use access keys in environment variables.

### Images Not Loading

Next.js image optimization works automatically in Amplify. No additional config needed.
