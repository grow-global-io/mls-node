const router = require("express").Router();
const { CosmosClient } = require("@azure/cosmos");
require("dotenv").config();
const { propertySchema } = require("../constants/Schemas");
const { getFilterData } = require("../constants/Properties/Constants");
const { calculatePercentageOfNumber } = require("../constants/main");
// Cosmos DB setup
const endpoint = process.env.endpoint;
const key = process.env.key;
const client = new CosmosClient({ endpoint, key });

// Cosmos DB configuration
const databaseId = process.env.database_id;
const containerId = "properties";

// Function to create an item in Cosmos DB
router.post("/create", async (req, res) => {
  try {
    const database = client.database(databaseId);
    const container = database.container(containerId);

    const { error, value: validatedItem } = propertySchema.validate({
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    if (error) {
      return res.status(400).json(error);
    }
    const { resource: createdItem } = await container.items.create(
      validatedItem
    );

    res.json(createdItem);
  } catch (error) {
    res.status(500).send(error);
  }
});
router.get("/read/id/:id", async (req, res) => {
  try {
    const database = client.database(databaseId);
    const container = database.container(containerId);
    const { resources: items } = await container.items
      .query(`SELECT * FROM c WHERE c.id = "${req.params.id}"`)
      .fetchAll();
    const filteredItems = await getFilterData(items, req.authId);
    res.json(filteredItems);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Function to read items from Cosmos DB
router.post("/read", async (req, res) => {
  try {
    const {
      category,
      propertyType,
      propertySubType,
      minRefferalFee,
      maxRefferalFee,
    } = req.body;
    const database = client.database(databaseId);
    const container = database.container(containerId);
    let itemsquery;
    if (
      category ||
      propertyType ||
      propertySubType ||
      minRefferalFee ||
      maxRefferalFee
    ) {
      const { resources: items } = await container.items
        .query(
          `SELECT * FROM c WHERE c.authId <> "${req.authId}" AND c.Category = "${category}" OR c.PropertyType = "${propertyType}" OR c.PropertySubType = "${propertySubType}"`
        )
        .fetchAll();
      itemsquery = items;
    } else {
      const { resources: items } = await container.items
        .query(`SELECT * FROM c WHERE c.authId <> "${req.authId}"`)
        .fetchAll();
      itemsquery = items;
    }
    const filteredItems = await getFilterData(itemsquery, req.authId);
    res.json(filteredItems);
  } catch (error) {
    res.status(500).send(error);
  }
});
router.get("/read/highRefferalFee", async (req, res) => {
  try {
    const database = client.database(databaseId);
    const container = database.container(containerId);
    const { resources: items } = await container.items
      .query(`SELECT * FROM c WHERE c.authId <> "${req.authId}"`)
      .fetchAll();
    const filteredItems = await getFilterData(items, req.authId);
    const sortedItems = filteredItems.sort((a, b) => {
      return b.referalFee - a.referalFee;
    });
    res.json(sortedItems);
  } catch (error) {
    res.status(500).send(error);
  }
});
// Function to read items by authId from Cosmos DB
router.get("/read/:authId", async (req, res) => {
  try {
    const database = client.database(databaseId);
    const container = database.container(containerId);
    const { resources: items } = await container.items
      .query(`SELECT * FROM c WHERE c.authId = "${req.params.authId}"`)
      .fetchAll();
    const filteredItems = await getFilterData(items, req.authId);
    res.json(filteredItems);
  } catch (error) {
    res.status(500).send(error);
  }
});
router.post("/read/search", async (req, res) => {
  try {
    const {
      beds,
      baths,
      reception,
      Category,
      location,
      Radius,
      PropertyType,
      PropertySubType,
      size,
      priceRange,
      keyFeature,
      tags,
      lat,
      lng,
    } = req.body;
    const database = client.database(databaseId);
    const container = database.container(containerId);
    const { resources: items } = await container.items
      .query(`SELECT * FROM c WHERE c.authId <> "${req.authId}"`)
      .fetchAll();
    const filteredProperties = items.filter((item) => {
      return (
        (beds ? item.beds === beds : true) &&
        (baths ? item.baths === baths : true) &&
        (reception ? item.reception === reception : true) &&
        (Category ? item.Category === Category : true) &&
        (location ? item.location === location : true) &&
        (Radius ? item.Radius === Radius : true) &&
        (PropertyType ? item.PropertyType === PropertyType : true) &&
        (PropertySubType ? item.PropertySubType === PropertySubType : true) &&
        (size ? item.size === size : true) &&
        (priceRange
          ? item.price >= priceRange[0] && item.price <= priceRange[1]
          : true) &&
        (keyFeature ? item.keyFeature === keyFeature : true) &&
        (tags ? item.tags === tags : true) &&
        (lat && lng
          ? calculateDistance(lat, lng, item.lat, item.lng) <= Radius
          : true)
      );
    });
    console.log(filteredProperties);

    const filteredItems = await getFilterData(filteredProperties, req.authId);
    res.json(filteredItems);
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
    const querySpec = {
      query: "SELECT * FROM c WHERE c.id = @itemId",
      parameters: [
        {
          name: "@itemId",
          value: req.params.id,
        },
      ],
    };
    const { resources: items } = await container.items
      .query(querySpec)
      .fetchAll();
    if (items.length === 0) {
      return res.status(404).json({ message: "Item not found" });
    }
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
      return res
        .status(404)
        .json({ message: "No items found in the container" });
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
