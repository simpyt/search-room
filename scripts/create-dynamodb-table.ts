/**
 * Script to create the DynamoDB table for Search Room
 * 
 * Run with: npm run db:create
 * 
 * Prerequisites:
 * - AWS credentials in .env.local
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
  UpdateTimeToLiveCommand,
  ResourceNotFoundException,
} from '@aws-sdk/client-dynamodb';

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'search-room';
const REGION = process.env.AWS_REGION || 'eu-central-1';

// Use default credential provider chain (supports SSO, env vars, IAM roles, etc.)
const client = new DynamoDBClient({
  region: REGION,
  // Don't explicitly set credentials - let SDK use default chain
  // This picks up AWS SSO, ~/.aws/credentials, env vars, IAM roles automatically
});

async function tableExists(): Promise<boolean> {
  try {
    await client.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
    return true;
  } catch (error) {
    if (error instanceof ResourceNotFoundException) {
      return false;
    }
    throw error;
  }
}

async function createTable(): Promise<void> {
  console.log(`Creating DynamoDB table: ${TABLE_NAME} in region: ${REGION}`);

  const command = new CreateTableCommand({
    TableName: TABLE_NAME,
    KeySchema: [
      { AttributeName: 'PK', KeyType: 'HASH' },  // Partition key
      { AttributeName: 'SK', KeyType: 'RANGE' }, // Sort key
    ],
    AttributeDefinitions: [
      { AttributeName: 'PK', AttributeType: 'S' },
      { AttributeName: 'SK', AttributeType: 'S' },
      { AttributeName: 'GSI1PK', AttributeType: 'S' }, // ExternalIdIndex
      { AttributeName: 'GSI1SK', AttributeType: 'S' },
      { AttributeName: 'GSI2PK', AttributeType: 'S' }, // StatusIndex
      { AttributeName: 'GSI2SK', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
      {
        // GSI1: ExternalIdIndex - for finding listings by source + externalId
        // GSI1PK: SOURCE#<sourceBrand>#<externalId>
        // GSI1SK: ROOM#<roomId>
        IndexName: 'ExternalIdIndex',
        KeySchema: [
          { AttributeName: 'GSI1PK', KeyType: 'HASH' },
          { AttributeName: 'GSI1SK', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
      {
        // GSI2: StatusIndex - for querying listings by status
        // GSI2PK: ROOM#<roomId>
        // GSI2SK: STATUS#<status>#<listingId>
        IndexName: 'StatusIndex',
        KeySchema: [
          { AttributeName: 'GSI2PK', KeyType: 'HASH' },
          { AttributeName: 'GSI2SK', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
    ],
    BillingMode: 'PAY_PER_REQUEST', // On-demand capacity
    Tags: [
      { Key: 'Project', Value: 'SearchRoom' },
      { Key: 'Environment', Value: 'development' },
    ],
  });

  try {
    const response = await client.send(command);
    console.log('Table created successfully!');
    console.log(`Table ARN: ${response.TableDescription?.TableArn}`);
    console.log(`Table Status: ${response.TableDescription?.TableStatus}`);
  } catch (error) {
    console.error('Failed to create table:', error);
    throw error;
  }
}

async function enableTTL(): Promise<void> {
  console.log('Enabling TTL on attribute "ttl"...');

  try {
    await client.send(
      new UpdateTimeToLiveCommand({
        TableName: TABLE_NAME,
        TimeToLiveSpecification: {
          AttributeName: 'ttl',
          Enabled: true,
        },
      })
    );
    console.log('TTL enabled successfully!');
  } catch (error) {
    // TTL might already be enabled
    console.log('TTL configuration:', error instanceof Error ? error.message : error);
  }
}

async function waitForTableActive(): Promise<void> {
  console.log('Waiting for table to become active...');
  
  // Initial delay to let AWS register the table
  await new Promise((resolve) => setTimeout(resolve, 2000));
  
  let attempts = 0;
  const maxAttempts = 30;
  
  while (attempts < maxAttempts) {
    try {
      const response = await client.send(
        new DescribeTableCommand({ TableName: TABLE_NAME })
      );
      
      if (response.Table?.TableStatus === 'ACTIVE') {
        console.log('Table is now ACTIVE!');
        return;
      }
      
      console.log(`  Status: ${response.Table?.TableStatus}...`);
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        console.log('  Waiting for table to be registered...');
      } else {
        throw error;
      }
    }
    
    await new Promise((resolve) => setTimeout(resolve, 2000));
    attempts++;
  }
  
  throw new Error('Table did not become active in time');
}

async function main(): Promise<void> {
  console.log('='.repeat(50));
  console.log('Search Room - DynamoDB Table Setup');
  console.log('='.repeat(50));
  console.log();

  console.log(`Using region: ${REGION}`);
  console.log(`Table name: ${TABLE_NAME}`);
  console.log();

  // Check if table exists
  const exists = await tableExists();
  
  if (exists) {
    console.log(`Table "${TABLE_NAME}" already exists.`);
    
    const response = await client.send(
      new DescribeTableCommand({ TableName: TABLE_NAME })
    );
    console.log(`  Status: ${response.Table?.TableStatus}`);
    console.log(`  Item Count: ${response.Table?.ItemCount}`);
    console.log(`  ARN: ${response.Table?.TableArn}`);
  } else {
    await createTable();
    await waitForTableActive();
    await enableTTL();
  }

  console.log();
  console.log('Done! Your DynamoDB table is ready.');
  console.log();
  console.log('Table features:');
  console.log('  - GSI1 (ExternalIdIndex): For listing deduplication by source+externalId');
  console.log('  - GSI2 (StatusIndex): For querying listings by status');
  console.log('  - TTL: Enabled on "ttl" attribute for automatic cleanup');
  console.log();
  console.log('Add these to your .env.local:');
  console.log(`  DYNAMODB_TABLE_NAME=${TABLE_NAME}`);
  console.log(`  AWS_REGION=${REGION}`);
}

main().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});

