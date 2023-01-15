const { GetItemCommand, ScanCommand, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
const { ddbClient } = require('./ddbClient');
const { v4: uuidv4 } = require('uuid');

const createProduct = async (event) => {
    console.log(`createProduct function. event : "${event}"`);
    try {
        const productRequest = JSON.parse(event.body);
        // set productid
        const productId = uuidv4();
        productRequest.id = productId;

        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Item: marshall(productRequest || {})
        };

        const createResult = await ddbClient.send(new PutItemCommand(params));

        console.log(createResult);
        return createResult;

    } catch (e) {
        console.error(e);
        throw e;
    }
}

const getProduct = async (productId) => {
    try {
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            key: marshall({ id: productId })
        }
        const { Item } = await ddbClient.send(new GetItemCommand(params))
        return Item ? unmarshall(Item) : {}
    } catch (e) {
        throw e;
    }
}

const getAllProducts = async () => {
    try {
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
        }
        const { Items } = await ddbClient.send(new ScanCommand(params))
        return Items ? unmarshall(Items) : {}
    } catch (e) {
        throw e;
    }
}
exports.handler = async (event) => {
    console.log(event)
    switch (event.httpMethod) {
        case "GET":
            if (event.pathParameter != null) {
                body = await getProduct(event.pathParameter.id)
            } else {
                body = await getAllProducts()
            }
        case "POST":
            body = await createProduct(event); // POST /product
            break;
        default:
            throw new Error(`Unsupported route: "${event.httpMethod}"`);
    }
    return {
        statusCode: 200,
        body
    }
}