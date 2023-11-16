const router = require("express").Router();
const { CosmosClient } = require('@azure/cosmos');
require("dotenv").config();

// Cosmos DB setup
const endpoint = process.env.endpoint;
const key = process.env.key;
const client = new CosmosClient({ endpoint, key });

// Cosmos DB configuration
const databaseId = process.env.database_id;
const containerId = 'agent';

// Function to create an item in Cosmos DB
router.post('/create', async (req, res) => {
    try {
        const database = client.database(databaseId);
        const container = database.container(containerId);

        const newItem = req.body;
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