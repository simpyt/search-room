/**
 * Script to create the DynamoDB table for Search Room
 * 
 * Run with: npx ts-node scripts/create-dynamodb-table.ts
 * 
 * Prerequisites:
 * - AWS credentials configured (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
 * - AWS_REGION set (defaults to eu-central-1)
 */

import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
  ResourceNotFoundException,
} from '@aws-sdk/client-dynamodb';

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'search-room';
const REGION = process.env.AWS_REGION || 'eu-central-1';

const client = new DynamoDBClient({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
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

async function waitForTableActive(): Promise<void> {
  console.log('Waiting for table to become active...');
  
  let attempts = 0;
  const maxAttempts = 30;
  
  while (attempts < maxAttempts) {
    const response = await client.send(
      new DescribeTableCommand({ TableName: TABLE_NAME })
    );
    
    if (response.Table?.TableStatus === 'ACTIVE') {
      console.log('Table is now ACTIVE!');
      return;
    }
    
    console.log(`  Status: ${response.Table?.TableStatus}...`);
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

  // Check credentials
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error('Error: AWS credentials not found!');
    console.error('Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY');
    process.exit(1);
  }

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
  }

  console.log();
  console.log('Done! Your DynamoDB table is ready.');
  console.log();
  console.log('Add these to your .env.local:');
  console.log(`  DYNAMODB_TABLE_NAME=${TABLE_NAME}`);
  console.log(`  AWS_REGION=${REGION}`);
}

main().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});

