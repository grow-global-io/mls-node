const router = require("express").Router();
const { CosmosClient } = require("@azure/cosmos");
require("dotenv").config();
const { propertySchema } = require("../constants/Schemas");
const { calculateDistance } = require("../constants/main");
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

    const { error, value: validatedItem } = propertySchema.validate(req.body);
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
    const requirements = database.container("requirements");
    const { resources: items } = await container.items
      .query(`SELECT * FROM c WHERE c.id = "${req.params.id}"`)
      .fetchAll();
    const { resources: reqs } = await requirements.items
      .query(`SELECT * FROM c WHERE c.authId = "${req.authId}"`)
      .fetchAll();

    // Map each itemA to a Promise that resolves when filtering is done
    const matchesPromises = items.map(async (itemA) => {
      const matchesCount = await Promise.all(
        reqs.map(async (itemB) => {
          const distance = await calculateDistance(
            itemA.lat,
            itemA.lng,
            itemB.lat,
            itemB.lng
          );
          const withinRadius = distance <= itemB.radius;
          const matches =
            itemA.size === parseInt(itemB.size) ||
            (itemA.price >= parseInt(itemB.minPriceRange) &&
              itemA.price <= parseInt(itemB.maxPriceRange)) ||
            itemA.propertyType === itemB.propertyType ||
            itemA.propertySubType === itemB.propertySubType;

          return withinRadius && matches;
        })
      );

      // Filter the matches to retain only the valid matches
      const validMatches = matchesCount.filter(Boolean);

      itemA.matches = validMatches;
      itemA.matchesCount = validMatches.length;

      return itemA;
    });

    // Wait for all matchesPromises to resolve
    const matchedItems = await Promise.all(matchesPromises);

    // Sort the items based on matches count
    matchedItems.sort((a, b) => b.matchesCount - a.matchesCount);

    res.json(matchedItems);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/read", async (req, res) => {
  try {
    const database = client.database(databaseId);
    const container = database.container(containerId);
    const requirements = database.container("requirements");
    const { resources: items } = await container.items
    .query(`SELECT * FROM c WHERE c.authId <> "${req.authId}"`)
    .fetchAll();
    const { resources: reqs } = await requirements.items
      .query(`SELECT * FROM c WHERE c.authId = "${req.authId}"`)
      .fetchAll();
    const viewings = database.container("viewings");
    const offers = database.container("offers");
    // Map each itemA to a Promise that resolves when filtering is done
    const matchesPromises = items.map(async (itemA) => {
      const { resources: viewingsItems } = await viewings.items
        .query(`SELECT * FROM c WHERE c.propertyId = "${itemA.id}"`)
        .fetchAll();
      const { resources: offersItems } = await offers.items
        .query(`SELECT * FROM c WHERE c.propertyId = "${itemA.id}"`)
        .fetchAll();
      const matchesDistances = await Promise.all(
        reqs.map(async (itemB) => {
          const distance = await calculateDistance(
            itemA.lat,
            itemA.lng,
            itemB.lat,
            itemB.lng
          );
          const withinRadius = distance <= itemB.Radius;
          const matches =
            itemA.size === parseInt(itemB.size) ||
            (itemA.price >= parseInt(itemB.minPriceRange) &&
              itemA.price <= parseInt(itemB.maxPriceRange)) ||
            itemA.propertyType === itemB.propertyType ||
            itemA.propertySubType === itemB.propertySubType;

          return withinRadius && matches ? itemB : null;
        })
      );

      // Filter the matches to retain only the valid matches
      const validMatches = matchesDistances.filter((item) => item !== null);
      itemA.viewings = viewingsItems;
      itemA.viewingsCount = viewingsItems.length;
      itemA.offers = offersItems;
      itemA.offersCount = offersItems.length;
      itemA.matches = validMatches;
      itemA.matchesCount = validMatches.length;

      return Promise.resolve(itemA);
    });

    // Wait for all matchesPromises to resolve
    const matchedItems = await Promise.all(matchesPromises);

    // Sort the items based on matches count
    matchedItems.sort((a, b) => b.matchesCount - a.matchesCount);

    res.json(matchedItems);
  } catch (error) {
    res.status(500).send(error);
  }
});
// Function to read items by authId from Cosmos DB
router.get("/read/:authId", async (req, res) => {
  try {
    const database = client.database(databaseId);
    const container = database.container(containerId);
    const requirements = database.container("requirements");
    const { resources: items } = await container.items
      .query(`SELECT * FROM c WHERE c.authId = "${req.params.authId}"`)
      .fetchAll();
    const { resources: reqs } = await requirements.items
      .query(`SELECT * FROM c WHERE c.authId = "${req.authId}"`)
      .fetchAll();

    // Map each itemA to a Promise that resolves when filtering is done
    const matchesPromises = items.map(async (itemA) => {
      const matchesCount = await Promise.all(
        reqs.map(async (itemB) => {
          const distance = await calculateDistance(
            itemA.lat,
            itemA.lng,
            itemB.lat,
            itemB.lng
          );
          const withinRadius = distance <= itemB.Radius;
          const matches =
            itemA.size === parseInt(itemB.size) ||
            (itemA.price >= parseInt(itemB.minPriceRange) &&
              itemA.price <= parseInt(itemB.maxPriceRange)) ||
            itemA.propertyType === itemB.propertyType ||
            itemA.propertySubType === itemB.propertySubType;

          return withinRadius && matches;
        })
      );

      // Filter the matches to retain only the valid matches
      const validMatches = matchesCount.filter(Boolean);

      itemA.matches = validMatches;
      itemA.matchesCount = validMatches.length;

      return itemA;
    });

    // Wait for all matchesPromises to resolve
    const matchedItems = await Promise.all(matchesPromises);

    // Sort the items based on matches count
    matchedItems.sort((a, b) => b.matchesCount - a.matchesCount);

    res.json(matchedItems);
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
