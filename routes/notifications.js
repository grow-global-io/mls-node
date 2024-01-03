const router = require("express").Router();
const { CosmosClient } = require("@azure/cosmos");
require("dotenv").config();
const { viewingsSchema } = require("../constants/Schemas");

// Cosmos DB setup
const endpoint = process.env.endpoint;
const key = process.env.key;
const client = new CosmosClient({ endpoint, key });

// Cosmos DB configuration
const databaseId = process.env.database_id;
const containerId = "notifications";

// Function to create an item in Cosmos DB
router.post("/create", async (req, res) => {
  try {
    const database = client.database(databaseId);
    const container = database.container(containerId);

    const { error, value: newItem } = viewingsSchema.validate(req.body);
    if (error) {
      return res.status(400).json(error);
    }
    const { resource: createdItem } = await container.items.create(newItem);

    res.json(createdItem);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Function to read items from Cosmos DB
router.get("/read", async (req, res) => {
  try {
    const database = client.database(databaseId);
    const container = database.container(containerId);

    const { resources: items } = await container.items.readAll().fetchAll();

    res.json(items);
  } catch (error) {
    res.status(500).send(error);
  }
});
// Function to read items from Cosmos DB
router.get("/read/:authId", async (req, res) => {
  try {
    const database = client.database(databaseId);
    const container = database.container(containerId);

    const { resources: items } = await container.items
      .query(`SELECT * FROM c WHERE c.authId = "${req.params.authId}"`)
      .fetchAll();

    res.json(items);
  } catch (error) {
    res.status(500).send(error);
  }
});
// Function to read items from Cosmos DB
router.get("/read/:agentAuthId", async (req, res) => {
    try {
      const database = client.database(databaseId);
      const container = database.container(containerId);
  
      const { resources: items } = await container.items
        .query(`SELECT * FROM c WHERE c.agentAuthId = "${req.params.agentAuthId}"`)
        .fetchAll();
  
      res.json(items);
    } catch (error) {
      res.status(500).send(error);
    }
  });

// Function to update an item in Cosmos DB
router.put("/update/:id", async (req, res) => {
  try {
    const database = client.database(databaseId);
    const container = database.container(containerId);

    const updatedItem = req.body;
    updatedItem.id = req.params.id;

    const { resource: replaced } = await container
      .item(req.params.id)
      .replace(updatedItem);

    res.json(replaced);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Function to delete an item from Cosmos DB
router.delete("/deleteAll", async (req, res) => {
  try {
    const database = client.database(databaseId);
    const container = database.container(containerId);
    const { resources: items } = await container.items.readAll().fetchAll();

    if (items.length === 0) {
      return res.status(404).json({ message: 'No items found in the container' });
    }

    // Delete all items in the container
    for (const item of items) {
      await container.item(item.id, item.id).delete();
    }

    res.json({ message: "All items deleted from the container" });
  } catch (error) {
    res.status(500).send(error);
  }
});
module.exports = router;
