const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");
const multer = require("multer");
const express = require("express");
const app = express.Router();
// require("dotenv").config();
require("dotenv").config();
// Initialize Azure Storage
const blobServiceClient = BlobServiceClient.fromConnectionString("DefaultEndpointsProtocol=https;AccountName=ahmls2;AccountKey=vPJBBIeTtGhVAasQ/3+YE6asl/aS9RDVn9mRbLIqTKZb80mbwJo4ed0lXrqsfS+UP9BUhmWfPYBZ+ASt3Bi1lQ==;EndpointSuffix=core.windows.net");
const containerName = "image";
const containerClient = blobServiceClient.getContainerClient(containerName);



// Multer configuration for handling image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Endpoint to upload image to Azure Storage and store directory in Cosmos DB
app.post("/upload", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  } 
  

  const blobName = `image_${Date.now()}${req.file.originalname}`; // You can use a more sophisticated naming convention
  const blobClient = containerClient.getBlockBlobClient(blobName);
  const fileBuffer = req.file.buffer;
  await blobClient.upload(fileBuffer, fileBuffer.length);

  const item = {
    id: Date.now().toString(),
    imageUrl: blobClient.url,
    fileName: blobName
  };

  res.status(200).json(item);
});

// Endpoint to retrieve image directory from Cosmos DB
// app.get("/image/:id", async (req, res) => {
//   const querySpec = {
//     query: "SELECT * FROM c WHERE c.id = @id",
//     parameters: [{ name: "@id", value: req.params.id }]
//   };

//   const { resources: results } = await container.items.query(querySpec).fetchAll();
//   if (results.length > 0) {
//     res.status(200).json(results[0]);
//   } else {
//     res.status(404).send("Image not found");
//   }
// });

// Serve the image using its directory
// app.get("/showImage/:id", async (req, res) => {
//   const querySpec = {
//     query: "SELECT * FROM c WHERE c.id = @id",
//     parameters: [{ name: "@id", value: req.params.id }]
//   };

//   const { resources: results } = await container.items.query(querySpec).fetchAll();
//   if (results.length > 0) {
//     const imageUrl = results[0].imageUrl;
//     res.status(200).send(`<img src="${imageUrl}" alt="Uploaded Image"/>`);
//   } else {
//     res.status(404).send("Image not found");
//   }
// });


module.exports = app;