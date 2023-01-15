const { GetItemCommand, ScanCommand, PutItemCommand, UpdateItemCommand, DeleteItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
const { ddbClient } = require('./ddbClient');
const { v4: uuidv4 } = require('uuid');

const deleteProduct = async (productId) => {
    console.log(`deleteProduct function. productId : "${productId}"`);

    try {
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({ id: productId }),
        };

        const deleteResult = await ddbClient.send(new DeleteItemCommand(params));

        console.log(deleteResult);
        return deleteResult;
    } catch (e) {
        console.error(e);
        throw e;
    }
}

const updateProduct = async (event) => {
    console.log(`updateProduct function. event : "${event}"`);
    try {
        const requestBody = JSON.parse(event.body);
        const objKeys = Object.keys(requestBody);
        console.log(`updateProduct function. requestBody : "${requestBody}", objKeys: "${objKeys}"`);

        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({ id: event.pathParameters.id }),
            UpdateExpression: `SET ${objKeys.map((_, index) => `#key${index} = :value${index}`).join(", ")}`,
            ExpressionAttributeNames: objKeys.reduce((acc, key, index) => ({
                ...acc,
                [`#key${index}`]: key,
            }), {}),
            ExpressionAttributeValues: marshall(objKeys.reduce((acc, key, index) => ({
                ...acc,
                [`:value${index}`]: requestBody[key],
            }), {})),
        };

        const updateResult = await ddbClient.send(new UpdateItemCommand(params));

        console.log(updateResult);
        return updateResult;
    } catch (e) {
        console.error(e);
        throw e;
    }

}
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
        case "DELETE":
            body = await deleteProduct(event.pathParameters.id); // DELETE /product/{id}
            break;
        case "PUT":
            body = await updateProduct(event); // PUT /product/{id}
            break;
        default:
            throw new Error(`Unsupported route: "${event.httpMethod}"`);
    }
    return {
        statusCode: 200,
        body
    }
}