import {Stack,StackProps, RemovalPolicy} from 'aws-cdk-lib';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { SwnDatabase } from './database';
import { SwnMicroservices } from './microservice';

export class AwsMicroServicesStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const database = new SwnDatabase(this, 'Database'); 
   
    const microservices = new SwnMicroservices(this, 'Microservices', {
      productTable: database.productTable
    });

    const productApiGateWay = new LambdaRestApi(this, 'productApi', {
      restApiName: 'Product Service',
      handler: microservices.productMicroservice,
      proxy: false // proxy: true will send all the requests to the lambda
    })

    const productApi = productApiGateWay.root.addResource('product');
    productApi.addMethod('GET'); // GET '/product
    productApi.addMethod('POST'); // POST '/product
    
    const singleProductApi = productApi.addResource('{id}');
    singleProductApi.addMethod('GET'); // GET '/product/{id}
    singleProductApi.addMethod('PUT'); // PUT '/product/{id}
    singleProductApi.addMethod('DELETE'); // DELETE '/product/{id}

    
  }
}
