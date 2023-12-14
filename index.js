const express = require("express");
const app = express();
const { getUserInfoMiddleware, verifyToken, getManagementApiToken } = require("./Middleware");
const { successResponse, errorResponse } = require("./responses");
const authRoute = require("./routes/auth");
const agentRoute = require("./routes/agent");
const developerRoute = require("./routes/developer");
const imageRoute = require("./routes/image");
const listingRoute = require("./routes/listings");
const propertyRoute = require("./routes/properties");
const matchingRoute = require("./routes/matching");
const requirementRoute = require("./routes/requirements");
const authenticateRoute = require("./routes/authentication");
const profile = require("./routes/profile");
const userRoute = require("./routes/user");
const pdfRoute = require("./routes/pdf");

// dotenv confi
require("dotenv").config();
app.use(express.json());
app.get("/callback", (req, res) => {
  res.send("hello");
});

app.get("/verify", verifyToken, (req, res) => {
  successResponse(res, { authId: req.authId }, "success");
});
app.get("/userDetails", verifyToken, getUserInfoMiddleware, (req, res) => {
  successResponse(res, req.user, "success");
});
app.use("/auth", verifyToken, authRoute);
app.use("/agent", verifyToken, agentRoute);
app.use("/developer", verifyToken, developerRoute);
app.use("/image", verifyToken, imageRoute);
app.use("/pdf", verifyToken, pdfRoute);
app.use("/listing", verifyToken, listingRoute);
app.use("/property", verifyToken, propertyRoute);
app.use("/requirement", verifyToken, requirementRoute);
app.use("/matching", verifyToken, matchingRoute);
app.use('/authenticate', getManagementApiToken, authenticateRoute)
app.use('/profile', verifyToken, profile)
app.use('/user', userRoute)
app.listen(8000, () => console.log("Server listening on port 8000!"));
