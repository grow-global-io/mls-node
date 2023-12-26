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
const videoRoute = require("./routes/video");
const viewingsRoute = require("./routes/viewings");

// dotenv confi
require("dotenv").config();
app.use(express.json());
const port = process.env.PORT || 3000;


app.get("/verify", verifyToken, (req, res) => {
  successResponse(res, { authId: req.authId }, "success");
});
app.get("/userDetails", verifyToken, getUserInfoMiddleware, (req, res) => {
  successResponse(res, req.user, "success");
});
app.get("/",(req,res)=>{
  res.send("Hello world!")
})
app.use("/auth", verifyToken, authRoute);
app.use("/agent", verifyToken, agentRoute);
app.use("/developer", verifyToken, developerRoute);
app.use("/image", verifyToken, imageRoute);
app.use("/pdf", verifyToken, pdfRoute);
app.use("/video", verifyToken, videoRoute);
app.use("/listing", verifyToken, listingRoute);
app.use("/property", verifyToken, propertyRoute);
app.use("/requirement", verifyToken, requirementRoute);
app.use("/matching", verifyToken, matchingRoute);
app.use("/viewings", verifyToken, viewingsRoute);
app.use('/authenticate', getManagementApiToken, authenticateRoute)
app.use('/profile', verifyToken, profile)
app.use('/user', userRoute)
app.listen(port, () => console.log("Server listening on port 8000!"));
