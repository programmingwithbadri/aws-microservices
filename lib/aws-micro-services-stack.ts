import {Stack,StackProps, RemovalPolicy} from 'aws-cdk-lib';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Code, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';
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
    });

    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules:[
          'aws-sdk'
        ]
      },
      environment: {
        PRIMARY_KEY: 'id',
        DYNAMODB_TABLE_NAME: productTable.tableName,
      },
      runtime: Runtime.NODEJS_18_X
    }

    // Product micro services lambda function
    // NodeJs Function requires docker for bundling
    const productLambdaFunction = new NodejsFunction(this, 'productLambdaFunction', {
      entry: join(__dirname,'./../src/product/index.js'),
      ...nodeJsFunctionProps
    })

    // grant read write access for the lambda
    productTable.grantReadWriteData(productLambdaFunction)

    const productApiGateWay = new LambdaRestApi(this, 'productApi', {
      restApiName: 'Product Service',
      handler: productLambdaFunction,
      proxy: false // proxy: true will send all the requests to the lambda
    })

    const productApi = productApiGateWay.root.addResource('product');
    productApi.addMethod('GET'); // GET '/product
    productApi.addMethod('POST'); // POST '/product

    
    const singleProductApi = productApi.addResource('{id');
    singleProductApi.addMethod('GET'); // GET '/product/{id}
    singleProductApi.addMethod('PUT'); // PUT '/product/{id}
    singleProductApi.addMethod('DELETE'); // DELETE '/product/{id}

    
  }
}
