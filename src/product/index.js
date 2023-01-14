const { GetItemCommand, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
const { ddbClient } = require('./ddbClient');

const getProduct = async (productId) => {
    try {
        const parmas = {
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
        const parmas = {
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
    }
    return {
        statusCode: 200,
        body
    }
}