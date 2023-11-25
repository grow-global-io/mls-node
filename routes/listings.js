const router = require("express").Router();
const { CosmosClient } = require('@azure/cosmos');
require("dotenv").config();

// Cosmos DB setup
const endpoint = process.env.endpoint;
const key = process.env.key;
const client = new CosmosClient({ endpoint, key });

// Cosmos DB configuration
const databaseId = process.env.database_id;
const containerId = 'listings';

router.get("/get-data/:id", async (req, res) => {
    try {
        const database = client.database(databaseId);
        const container = database.container(containerId);
        const propId = req.params.id;

        // Query Cosmos DB to retrieve the specific post by ID
        const querySpec = {
            query: 'SELECT * FROM c WHERE c.id = @propId',
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
        let sortOrder = { Featured: 1, Premium: 2, Standard: 3 };
        items.sort((a, b) => {
            return sortOrder[a.listingType] - sortOrder[b.listingType];
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