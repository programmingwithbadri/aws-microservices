import {Stack,StackProps, RemovalPolicy} from 'aws-cdk-lib';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class AwsMicroServicesStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

 const productTable =new Table(this, 'product', {
  partitionKey: {
    name: 'id',
    type: AttributeType.STRING
  },
  tableName: "product",
  removalPolicy: RemovalPolicy.DESTROY,
  billingMode: BillingMode.PAY_PER_REQUEST
 })
  }
}
