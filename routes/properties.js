const router = require("express").Router();
const { CosmosClient } = require('@azure/cosmos');
require("dotenv").config();
const { propertySchema } = require("../constants/Schemas");

// Cosmos DB setup
const endpoint = process.env.endpoint;
const key = process.env.key;
const client = new CosmosClient({ endpoint, key });

// Cosmos DB configuration
const databaseId = process.env.database_id;
const containerId = 'properties';

// Function to create an item in Cosmos DB
router.post('/create', async (req, res) => {
    try {
        const database = client.database(databaseId);
        const container = database.container(containerId);

        const { error, value: validatedItem } = propertySchema.validate(req.body);
        if (error) {
            return res.status(400).json(error);
        }
        const { resource: createdItem } = await container.items.create(validatedItem);

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
        const requirements = database.container('requirements');
        const { resources: items } = await container.items.readAll().fetchAll();
        const { resources: reqs } = await requirements.items.query(`SELECT * FROM c WHERE c.authId = "${req.authId}"`).fetchAll();
        items.forEach(itemA => {
            let matchesCount = reqs.filter(itemB =>
                itemA.size === parseInt(itemB.size) ||
                itemA.price >= parseInt(itemB.minPriceRange) &&
                itemA.price <= parseInt(itemB.maxPriceRange) ||
                itemA.propertyType === itemB.propertyType ||
                itemA.propertySubType === itemB.propertySubType
            );
            itemA.matches = matchesCount;
            itemA.matchesCount = matchesCount.length;
        });
        items.sort((a, b) => b.matchesCount - a.matchesCount);
        res.json(items);
    } catch (error) {
        res.status(500).send(error);
    }
});
// Function to read items by authId from Cosmos DB
router.get('/read/:authId', async (req, res) => {
    try {
        const database = client.database(databaseId);
        const container = database.container(containerId);
        const requirements = database.container('requirements');
        const { resources: items } = await container.items.query(`SELECT * FROM c WHERE c.authId = "${req.params.authId}"`).fetchAll();
        const { resources: reqs } = await requirements.items.query(`SELECT * FROM c WHERE c.authId = "${req.params.authId}"`).fetchAll();
        items.forEach(itemA => {
            let matchesCount = reqs.filter(itemB =>
                itemA.size === parseInt(itemB.size) ||
                itemA.price >= parseInt(itemB.minPriceRange) &&
                itemA.price <= parseInt(itemB.maxPriceRange) ||
                itemA.propertyType === itemB.propertyType ||
                itemA.propertySubType === itemB.propertySubType
            );
            itemA.matches = matchesCount;
            itemA.matchesCount = matchesCount.length;
        });
        items.sort((a, b) => b.matchesCount - a.matchesCount);
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