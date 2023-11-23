const express = require('express');
const Router = express.Router();
const { successResponse, errorResponse } = require("../responses");
const { verifyToken } = require("../Middleware");
const { CosmosClient } = require('@azure/cosmos');
require("dotenv").config();

// Cosmos DB setup
const endpoint = process.env.endpoint;
const key = process.env.key;
const client = new CosmosClient({ endpoint, key });

// Cosmos DB configuration
const databaseId = process.env.database_id;

const containerId = 'listings';
Router.post('/listing', async (req, res) => {
    try {
        const database = client.database(databaseId);
        const container = database.container(containerId);


        // Read the item using its ID
        const { resources: item } = await container.items.query({
            query: "SELECT * from c WHERE c.id = @id or c.propertyName = @propertyName or c.userType = @userType",
            parameters: [
                {
                    name: "@id",
                    value: req.body.id
                },{
                    name: "@propertyName",
                    value: req.body.propertyName
                },{
                    name: "@userType",
                    value: req.body.userType
                }
            ]
        }).fetchAll();

       
        // Return the retrieved item
        res.json(item);
    } catch (error) {
        // Handle other errors, like connection issues or malformed requests
        res.status(500).send(error);
    }
});
module.exports = Router;
