const router = require("express").Router();
const { CosmosClient } = require("@azure/cosmos");
require("dotenv").config();
const { offersSchema } = require("../constants/Schemas");
const moment = require('moment');
const { formatInternationalNumber } = require('../constants/main');
// Cosmos DB setup
const endpoint = process.env.endpoint;
const key = process.env.key;
const client = new CosmosClient({ endpoint, key });

// Cosmos DB configuration
const databaseId = process.env.database_id;
const containerId = "offers";

// Function to create an item in Cosmos DB
router.post("/create", async (req, res) => {
  try {
    const database = client.database(databaseId);
    const container = database.container(containerId);

    const { error, value: newItem } = offersSchema.validate({
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    if (error) {
      return res.status(400).json(error);
    }
    // properties details get 
    const propertiesContainer = database.container("properties");
    const { resources: items } = await propertiesContainer.items
      .query(`SELECT * FROM c WHERE c.id = "${newItem.propertyId}"`)
      .fetchAll();

    const notificationContainer = database.container("notifications");
    await notificationContainer.items.create({
      authId: newItem.authId,
      message: `You have an offer on ${items[0].PropertyName} for ${formatInternationalNumber(newItem.price)} ${items[0].priceType === "gbp" ? "£" : "$"}`,
      type: "offer",
      createdAt: new Date().toISOString(),
      isRead: false,
      propertyId: newItem.propertyId,
      agentAuthId: newItem.agentAuthId,
    });
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
// Function to read items by authId from Cosmos DB
router.get("/receive/read/:authId", async (req, res) => {
  try {
    const database = client.database(databaseId);
    const container = database.container(containerId);
    const properties = database.container("properties");
    const { resources: items } = await container.items
      .query(`SELECT * FROM c WHERE c.agentAuthId = "${req.params.authId}"`)
      .fetchAll();
    const promises = items.map(async (itemA) => {
      const { resources: props } = await properties.items
        .query(`SELECT * FROM c WHERE c.id="${itemA.propertyId}"`)
        .fetchAll();
      return { ...itemA, property: props[0] || null };
    });

    const updatedItems = await Promise.all(promises);
    res.json(updatedItems);
  } catch (error) {
    res.status(500).send(error);
  }
});
router.get("/send/read/:authId", async (req, res) => {
  try {
    const database = client.database(databaseId);
    const container = database.container(containerId);
    const properties = database.container("properties");
    const { resources: items } = await container.items
      .query(`SELECT * FROM c WHERE c.authId = "${req.params.authId}"`)
      .fetchAll();
    const promises = items.map(async (itemA) => {
      const { resources: props } = await properties.items
        .query(`SELECT * FROM c WHERE c.id="${itemA.propertyId}"`)
        .fetchAll();
      return { ...itemA, property: props[0] || null };
    });

    const updatedItems = await Promise.all(promises);
    res.json(updatedItems);
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
router.delete("/delete/:id", async (req, res) => {
  try {
    const database = client.database(databaseId);
    const container = database.container(containerId);

    await container.item(req.params.id, req.params.id).delete();

    res.json({ message: "Item deleted" });
  } catch (error) {
    res.status(500).send(error);
  }
});
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
