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
| `DYNAMODB_TABLE_NAME` | `search-room` | DynamoDB table name |
| `OPENAI_API_KEY` | `sk-...` | OpenAI API key |
| `NEXT_PUBLIC_AWS_RUM_APP_ID` | `your-app-id` | From RUM setup (optional) |
| `NEXT_PUBLIC_AWS_RUM_REGION` | `eu-central-1` | Your AWS region (optional) |
| `NEXT_PUBLIC_AWS_RUM_IDENTITY_POOL_ID` | `eu-central-1:xxx` | Cognito Identity Pool (optional) |
| `NEXT_PUBLIC_AWS_RUM_GUEST_ROLE_ARN` | `arn:aws:iam::...` | Guest role for RUM (optional) |

> **Note:** `AWS_*` prefixed variables are reserved in Amplify. DynamoDB access uses IAM roles automatically - no credentials needed!

### 3b. Configure IAM Permissions for DynamoDB

The Amplify service role needs DynamoDB permissions. Add this policy to the Amplify service role:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:eu-central-1:*:table/search-room",
        "arn:aws:dynamodb:eu-central-1:*:table/search-room/index/*"
      ]
    }
  ]
}
```

To find/update the service role:
1. Amplify Console → App settings → General settings
2. Click on the "Service role" link
3. Add an inline policy with the above JSON

### Environment Variables: Vercel

For Vercel deployments, use these renamed variables (since Vercel doesn't have IAM roles):

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_PLATFORM` | `vercel` | (or leave unset, defaults to vercel) |
| `DYNAMODB_REGION` | `eu-central-1` | DynamoDB region |
| `DYNAMODB_ACCESS_KEY_ID` | `AKIA...` | AWS access key |
| `DYNAMODB_SECRET_ACCESS_KEY` | `***` | AWS secret key |
| `DYNAMODB_SESSION_TOKEN` | `...` | (optional, for SSO/temp creds) |
| `DYNAMODB_TABLE_NAME` | `search-room` | DynamoDB table name |
| `OPENAI_API_KEY` | `sk-...` | OpenAI API key |

> **Note:** For local development, you can still use `AWS_*` env vars - they work as fallbacks.

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
| DynamoDB Auth | Explicit credentials | IAM role (no creds needed) |
| Edge Functions | Edge Runtime | Lambda@Edge |
| Preview Deploys | ✓ | ✓ |
| Custom Domains | ✓ | ✓ |
| SSL | Automatic | Automatic |
| Env var prefix | Any | `AWS_*` reserved |

## Troubleshooting

### Build Fails

Check Node.js version in Amplify:
- Go to Build settings → Build image settings
- Set Node.js version to 20

### DynamoDB Connection Issues

1. **Check IAM permissions**: Ensure the Amplify service role has the DynamoDB policy (see step 3b)
2. **Check table name**: Verify `DYNAMODB_TABLE_NAME` env var matches your table
3. **Check region**: Table must be in `eu-central-1` (or update `DYNAMODB_REGION`)

### "AccessDeniedException" Errors

The Amplify service role is missing DynamoDB permissions. See step 3b above.

### Images Not Loading

Next.js image optimization works automatically in Amplify. No additional config needed.

### Environment Variable Issues

Remember: `AWS_*` prefixed variables are **reserved** in Amplify and will be ignored. Use `DYNAMODB_*` prefix instead for explicit credentials (though IAM roles are preferred).

## Related Documentation

- [DynamoDB Access Patterns](./DYNAMODB_ACCESS_PATTERNS.md) - Table design, key structure, GSIs, and all access patterns
