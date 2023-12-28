const router = require("express").Router();
const { CosmosClient } = require('@azure/cosmos');
require("dotenv").config();
const { offersSchema } = require("../constants/Schemas");
// Cosmos DB setup
const endpoint = process.env.endpoint;
const key = process.env.key;
const client = new CosmosClient({ endpoint, key });

// Cosmos DB configuration
const databaseId = process.env.database_id;
const containerId = 'offers';

// Function to create an item in Cosmos DB
router.post('/create', async (req, res) => {
    try {
        const database = client.database(databaseId);
        const container = database.container(containerId);

        const {error,value:newItem} = offersSchema.validate(req.body);
        if(error){
            return res.status(400).json(error);
        }
        const { resource: createdItem } = await container.items.create(newItem);

        res.json(createdItem);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Function to read items from Cosmos DB
router.get('/read', async (req, res) => {
    try {
        const database = client.database(databaseId);
        const container = database.container(containerId);

        const { resources: items } = await container.items.readAll().fetchAll();

        res.json(items);
    } catch (error) {
        res.status(500).send(error);
    }
});
// Function to read items by authId from Cosmos DB
router.get('/receive/read/:authId', async (req, res) => {
    try {
        const database = client.database(databaseId);
        const container = database.container(containerId);
        const properties = database.container('properties');
        const { resources: items } = await container.items.query(`SELECT * FROM c WHERE c.agentAuthId = "${req.params.authId}"`).fetchAll();
        await items.forEach(async(itemA) => {
            const { resources: props } = await properties.items.query(`SELECT * FROM c WHERE c.authId = "${req.params.authId}" AND c.id="${itemA.propertyId}"`).fetchAll();
            itemA.property = props;
        });
        res.json(items);
    } catch (error) {
        res.status(500).send(error);
    }
});
router.get('/send/read/:authId', async (req, res) => {
    try {
        const database = client.database(databaseId);
        const container = database.container(containerId);
        const properties = database.container('properties');
        const { resources: items } = await container.items.query(`SELECT * FROM c WHERE c.authId = "${req.params.authId}"`).fetchAll();
        await items.forEach(async(itemA) => {
            const { resources: props } = await properties.items.query(`SELECT * FROM c WHERE c.authId = "${req.params.authId}" AND c.id="${itemA.propertyId}"`).fetchAll();
            itemA.property = props;
        });
        res.json(items);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Function to update an item in Cosmos DB
router.put('/update/:id', async (req, res) => {
    try {
        const database = client.database(databaseId);
        const container = database.container(containerId);

        const updatedItem = req.body;
        updatedItem.id = req.params.id;

        const { resource: replaced } = await container.item(req.params.id).replace(updatedItem);

        res.json(replaced);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Function to delete an item from Cosmos DB
router.delete('/delete/:id', async (req, res) => {
    try {
        const database = client.database(databaseId);
        const container = database.container(containerId);

        await container.item(req.params.id).delete();

        res.json({ message: 'Item deleted' });
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router