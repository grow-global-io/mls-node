const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");
const { CosmosClient } = require("@azure/cosmos");
const multer = require("multer");

// Initialize Azure Storage
const AZURE_STORAGE_CONNECTION_STRING = "YOUR_AZURE_STORAGE_CONNECTION_STRING";
const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const containerName = "images";
const containerClient = blobServiceClient.getContainerClient(containerName);

// Initialize Cosmos DB
const COSMOS_DB_ENDPOINT = "YOUR_COSMOS_DB_ENDPOINT";
const COSMOS_DB_KEY = "YOUR_COSMOS_DB_KEY";
const COSMOS_DB_DATABASE_NAME = "imagesDB";
const COSMOS_DB_CONTAINER_NAME = "imageContainer";


const cosmosClient = new CosmosClient({ endpoint: COSMOS_DB_ENDPOINT, key: COSMOS_DB_KEY });
const database = cosmosClient.database(COSMOS_DB_DATABASE_NAME);
const container = database.container(COSMOS_DB_CONTAINER_NAME);

// Multer configuration for handling image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Endpoint to upload image to Azure Storage and store directory in Cosmos DB
app.post("/upload", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const blobName = `image_${Date.now()}.jpg`; // You can use a more sophisticated naming convention
  const blobClient = containerClient.getBlockBlobClient(blobName);
  const fileBuffer = req.file.buffer;
  await blobClient.upload(fileBuffer, fileBuffer.length);

  const item = {
    id: Date.now().toString(),
    imageUrl: blobClient.url,
    fileName: blobName
  };

  const { resource: createdItem } = await container.items.create(item);
  res.status(200).send("Image uploaded successfully!");
});

// Endpoint to retrieve image directory from Cosmos DB
app.get("/image/:id", async (req, res) => {
  const querySpec = {
    query: "SELECT * FROM c WHERE c.id = @id",
    parameters: [{ name: "@id", value: req.params.id }]
  };

  const { resources: results } = await container.items.query(querySpec).fetchAll();
  if (results.length > 0) {
    res.status(200).json(results[0]);
  } else {
    res.status(404).send("Image not found");
  }
});

// Serve the image using its directory
app.get("/showImage/:id", async (req, res) => {
  const querySpec = {
    query: "SELECT * FROM c WHERE c.id = @id",
    parameters: [{ name: "@id", value: req.params.id }]
  };

  const { resources: results } = await container.items.query(querySpec).fetchAll();
  if (results.length > 0) {
    const imageUrl = results[0].imageUrl;
    res.status(200).send(`<img src="${imageUrl}" alt="Uploaded Image"/>`);
  } else {
    res.status(404).send("Image not found");
  }
});

