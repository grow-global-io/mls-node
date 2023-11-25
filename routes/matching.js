const express = require('express');
const Router = express.Router();
const { successResponse, errorResponse } = require("../responses");
const { verifyToken } = require("../Middleware");
const { CosmosClient } = require('@azure/cosmos');
require("dotenv").config();
const { calculateDistance, calculateSimilarityScore } = require('../constants/main');

// Cosmos DB setup
const endpoint = process.env.endpoint;
const key = process.env.key;
const client = new CosmosClient({ endpoint, key });

// Cosmos DB configuration
const databaseId = process.env.database_id;

// Router.post('/listing', async (req, res) => {
//     try {
//         const containerId = 'listings';
//         const database = client.database(databaseId);
//         const container = database.container(containerId);


//         // Read the item using its ID
//         const { resources: item } = await container.items.query({
//             query: "SELECT * from c WHERE c.id = @id or c.propertyName = @propertyName or c.userType = @userType",
//             parameters: [
//                 {
//                     name: "@id",
//                     value: req.body.id
//                 },{
//                     name: "@propertyName",
//                     value: req.body.propertyName
//                 },{
//                     name: "@userType",
//                     value: req.body.userType
//                 }
//             ]
//         }).fetchAll();


//         // Return the retrieved item
//         res.json(item);
//     } catch (error) {
//         // Handle other errors, like connection issues or malformed requests
//         res.status(500).send(error);
//     }
// });

Router.post('/filterData', async (req, res) => {
    try {
        const containerId = 'listings';
        const database = client.database(databaseId);
        const container = database.container(containerId);
        const { lat, long, id, propertyName, userType, beds, baths, reception, size, askingPrice, referralFeeType, referralFee } = req.body;

        // Fetch all data from the Cosmos DB container
        const { resources: allData } = await container.items.readAll().fetchAll();
        // Filter data based on proximity to user location and provided id & propertyName
        const filteredData = allData.filter(data => {
            const dataLat = data.lat ?? 0; // Replace with your data's latitude field
            const dataLong = data.long ?? 0; // Replace with your data's longitude field
            const dataBeds = data.beds; // Replace with your data's propertyName field
            const dataBaths = data.baths; // Replace with your data's propertyName field



            // Calculate distance using the Haversine formula
            const distance = calculateDistance(lat, long, dataLat, dataLong);
            // Filter data within a certain radius (example: 100 kilometers)
            // Check id and propertyName along with proximity
            // return distance <= 100 || dataId === id || dataPropertyName === propertyName || dataUserType === userType || dataBeds === beds || dataBaths === baths || dataReception === reception || dataSize === size || dataAskingPrice === askingPrice || dataReferralFeeType === referralFeeType || dataReferralFee === referralFee;
            ;
            console.log(beds && dataBeds && dataBeds === beds)
            return (
                distance <= 100 &&
                (beds && dataBeds && dataBeds === beds) &&
                (baths && dataBaths && dataBaths === baths)
            );
            // Adjust conditions as needed for your scenario
        });
        filteredData.filter((data) => {
            const dataId = data.id; // Replace with your data's id field
            const dataPropertyName = data.propertyName; // Replace with your data's propertyName field
            const dataUserType = data.userType; // Replace with your data's propertyName field
            const dataReception = data.reception; // Replace with your data's propertyName field
            const dataSize = data.size; // Replace with your data's propertyName field
            const dataAskingPrice = data.askingPrice; // Replace with your data's propertyName field
            const dataReferralFeeType = data.referralFeeType; // Replace with your data's propertyName field
            const dataReferralFee = data.referralFee; // Replace with your data's propertyName field
            return (
                dataId === id ||
                dataPropertyName === propertyName ||
                dataUserType === userType ||
                dataReception === reception ||
                dataSize === size ||
                dataAskingPrice === askingPrice ||
                dataReferralFeeType === referralFeeType ||
                dataReferralFee === referralFee ||
                (propertyName && dataPropertyName && dataPropertyName.includes(propertyName)) ||
                (userType && dataUserType && dataUserType.includes(userType)) ||
                (reception && dataReception && dataReception === reception) ||
                (size && dataSize && dataSize.includes(size)) ||
                (askingPrice && dataAskingPrice && dataAskingPrice.includes(askingPrice)) ||
                (referralFeeType && dataReferralFeeType && dataReferralFeeType.includes(referralFeeType)) ||
                (referralFee && dataReferralFee && dataReferralFee.includes(referralFee))
            );
        })
        filteredData.sort((a, b) => {
            const scoreA = calculateSimilarityScore(a, req.body);
            const scoreB = calculateSimilarityScore(b, req.body);
            return scoreB - scoreA; // Sort in descending order of similarity score
        })
        res.json(filteredData);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
module.exports = Router;
