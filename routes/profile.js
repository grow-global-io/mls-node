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

// read item by id from Cosmos DB
router.get('/read/:id', async (req, res) => {
    try {
        const database = client.database(databaseId);
        const container = database.container(containerId);
        const propId = req.params.id;

        // Query Cosmos DB to retrieve the specific post by ID
        const querySpec = {
            query: 'SELECT * FROM c WHERE c.authId = @propId',
            parameters: [{ name: '@propId', value: propId }]
        };

        const { resources: data } = await container.items.query(querySpec).fetchAll();

        if (data.length === 1) {
            return res.status(200).json(data[0]);
        } else {
            return res.status(404).json({ message: 'Post not found' });
        }
    } catch (error) {
        console.error('Error retrieving post:', error);
        return res.status(500).send('An error occurred while retrieving the post.');
    }
})

// Function to update an item in Cosmos DB
router.put('/update/:id', async (req, res) => {
    try {
        const database = client.database(databaseId);
        const container = database.container(containerId);

        
        const querySpec = {
            query: 'SELECT * FROM c WHERE c.authId = @propId',
            parameters: [{ name: '@propId', value: req.params.id }]
        };
        const { resources: data } = await container.items.query(querySpec).fetchAll();
        const updatedItem = {
            ...data[0],
            ...req.body
        }

        const { resource: replaced } = await container.item(updatedItem.id).replace(updatedItem);

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

        const querySpec = {
            query: 'SELECT * FROM c WHERE c.authId = @value', // Define your condition
            parameters: [{ name: '@value', value: req.params.id }] // Replace with your condition's value
        };

        const { resources: itemsToDelete } = await container.items.query(querySpec).fetchAll();
        
        // Iterate through the items that match the query and delete them
        for (const item of itemsToDelete) {
            await container.item(item.id).delete();
        }

        res.json({ message: 'Items deleted' });
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router