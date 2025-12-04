/**
 * Quick test to verify app can connect to DynamoDB
 * Run with: npm run db:test
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { DynamoDBClient, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'search-room';
const REGION = process.env.AWS_REGION || 'eu-central-1';

const client = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(client);

async function main() {
  console.log('='.repeat(50));
  console.log('Search Room - Database Connection Test');
  console.log('='.repeat(50));
  console.log();

  // 1. Check table exists
  console.log('1. Checking table exists...');
  const tableInfo = await client.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
  console.log(`   ✓ Table "${TABLE_NAME}" is ${tableInfo.Table?.TableStatus}`);
  console.log();

  // 2. Test write
  console.log('2. Testing write operation...');
  const testItem = {
    PK: 'TEST#connection',
    SK: 'TEST',
    message: 'Hello from Search Room!',
    timestamp: new Date().toISOString(),
  };
  
  await docClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: testItem,
  }));
  console.log('   ✓ Write successful');
  console.log();

  // 3. Test read
  console.log('3. Testing read operation...');
  const result = await docClient.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: { PK: 'TEST#connection', SK: 'TEST' },
  }));
  console.log('   ✓ Read successful');
  console.log(`   Data: ${JSON.stringify(result.Item)}`);
  console.log();

  // 4. Cleanup
  console.log('4. Cleaning up test data...');
  await docClient.send(new DeleteCommand({
    TableName: TABLE_NAME,
    Key: { PK: 'TEST#connection', SK: 'TEST' },
  }));
  console.log('   ✓ Cleanup successful');
  console.log();

  console.log('='.repeat(50));
  console.log('✓ All tests passed! Database is ready.');
  console.log('='.repeat(50));
}

main().catch((error) => {
  console.error('✗ Test failed:', error.message);
  process.exit(1);
});

