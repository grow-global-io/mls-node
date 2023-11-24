const express = require('express');
const app = express();
const {getUserInfoMiddleware,verifyToken} = require("./Middleware");
const {successResponse, errorResponse} = require("./responses");
const authRoute = require("./routes/auth");
const agentRoute = require("./routes/agent");
const developerRoute = require("./routes/developer");
const imageRoute = require("./routes/image");
const listingRoute = require("./routes/listings");
const propertyRoute = require("./routes/properties");
const matchingRoute = require("./routes/matching");
const requirementRoute = require("./routes/requirements");
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
app.use(express.json());
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
app.use('/image',imageRoute);
app.use('/listing',listingRoute);
app.use('/property',propertyRoute);
app.use('/requirement',requirementRoute);
app.use('/matching',matchingRoute);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Property API',
      version: '1.0.0',
    },
    servers:[
      {
        url:"http://localhost:8000"
      }
    ]
  },
  apis: ['./routes/*.js'],
}
const swaggerSpec = swaggerJSDoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.listen(8000, () => console.log('Server listening on port 8000!'));