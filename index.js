const app = require("express")();
const {getUserInfoMiddleware,verifyToken} = require("./Middleware");
const {successResponse, errorResponse} = require("./responses");
const authRoute = require("./routes/auth");
const agentRoute = require("./routes/agent");
const developerRoute = require("./routes/developer");
// const imageRoute = require("./routes/image");
const listingRoute = require("./routes/listings");
const propertyRoute = require("./routes/properties");

app.get('/callback', (req, res) => {
  res.send("hello")
});

app.get('/verify',verifyToken ,(req, res) => {
  successResponse(res, {authId: req.authId}, "success")
});
app.get('/userDetails',getUserInfoMiddleware ,(req, res) => {
  successResponse(res, req.user, "success")
});
app.use('/auth',authRoute);
app.use('/agent',agentRoute);
app.use('/developer',developerRoute);
// app.use('/image',imageRoute);
app.use('/listing',listingRoute);
app.use('/property',propertyRoute);

app.listen(8000, () => console.log('Server listening on port 8000!'));