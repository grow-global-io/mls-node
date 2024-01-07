const { CosmosClient } = require("@azure/cosmos");
require("dotenv").config();
const { calculateDistance } = require("../main");
const endpoint = process.env.endpoint;
const key = process.env.key;
const client = new CosmosClient({ endpoint, key });

// Cosmos DB configuration
const databaseId = process.env.database_id;

const getFilterData = async (items, authId) => {
  const database = client.database(databaseId);
  const requirements = database.container("requirements");
  const { resources: reqs } = await requirements.items
    .query(`SELECT * FROM c WHERE c.authId = "${authId}"`)
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
  return matchedItems;
};
module.exports = {
  getFilterData,
};
