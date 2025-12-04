/**
 * Script to delete the DynamoDB table for Search Room
 * 
 * Run with: npm run db:delete
 * 
 * WARNING: This will permanently delete all data!
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import {
  DynamoDBClient,
  DeleteTableCommand,
  DescribeTableCommand,
  ResourceNotFoundException,
} from '@aws-sdk/client-dynamodb';
import * as readline from 'readline';

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'search-room';
const REGION = process.env.AWS_REGION || 'eu-central-1';

// Use default credential provider chain (supports SSO, env vars, IAM roles, etc.)
const client = new DynamoDBClient({
  region: REGION,
});

async function confirm(message: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

async function main(): Promise<void> {
  console.log('='.repeat(50));
  console.log('Search Room - DynamoDB Table Deletion');
  console.log('='.repeat(50));
  console.log();

  // Check if table exists
  try {
    const response = await client.send(
      new DescribeTableCommand({ TableName: TABLE_NAME })
    );
    console.log(`Table "${TABLE_NAME}" found:`);
    console.log(`  Status: ${response.Table?.TableStatus}`);
    console.log(`  Item Count: ${response.Table?.ItemCount}`);
  } catch (error) {
    if (error instanceof ResourceNotFoundException) {
      console.log(`Table "${TABLE_NAME}" does not exist.`);
      return;
    }
    throw error;
  }

  console.log();
  console.log('WARNING: This will permanently delete all data!');
  
  const confirmed = await confirm('Are you sure you want to delete this table?');
  
  if (!confirmed) {
    console.log('Cancelled.');
    return;
  }

  console.log('Deleting table...');
  await client.send(new DeleteTableCommand({ TableName: TABLE_NAME }));
  console.log('Table deletion initiated.');
}

main().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});

