'use client';

import { useEffect } from 'react';

// Vercel components - only imported when needed
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics as VercelAnalytics } from '@vercel/analytics/next';

// AWS RUM - lazy loaded
import { AwsRum, AwsRumConfig } from 'aws-rum-web';

const PLATFORM = process.env.NEXT_PUBLIC_PLATFORM || 'vercel';

function AwsRumAnalytics() {
  useEffect(() => {
    const applicationId = process.env.NEXT_PUBLIC_AWS_RUM_APP_ID;
    const applicationVersion = '1.0.0';
    const applicationRegion = process.env.NEXT_PUBLIC_AWS_RUM_REGION || 'eu-central-1';
    const identityPoolId = process.env.NEXT_PUBLIC_AWS_RUM_IDENTITY_POOL_ID;
    const guestRoleArn = process.env.NEXT_PUBLIC_AWS_RUM_GUEST_ROLE_ARN;

    if (!applicationId || !identityPoolId) {
      console.warn('AWS RUM: Missing configuration. Analytics disabled.');
      return;
    }

    try {
      const config: AwsRumConfig = {
        sessionSampleRate: 1,
        identityPoolId,
        endpoint: `https://dataplane.rum.${applicationRegion}.amazonaws.com`,
        telemetries: ['performance', 'errors', 'http'],
        allowCookies: true,
        enableXRay: false,
        guestRoleArn,
      };

      new AwsRum(applicationId, applicationVersion, applicationRegion, config);
    } catch (error) {
      console.error('AWS RUM initialization error:', error);
    }
  }, []);

  return null;
}

export function Analytics() {
  if (PLATFORM === 'aws') {
    return <AwsRumAnalytics />;
  }

  // Default to Vercel
  return (
    <>
      <SpeedInsights />
      <VercelAnalytics />
    </>
  );
}
