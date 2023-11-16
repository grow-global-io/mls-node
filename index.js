const app = require("express")();
const {getUserInfoMiddleware,verifyToken} = require("./Middleware");
const {successResponse, errorResponse} = require("./responses");

app.get('/callback', (req, res) => {
  res.send("hello")
});

app.get('/verify',verifyToken ,(req, res) => {
  successResponse(res, {authId: req.authId}, "success")
});
app.get('/userDetails',getUserInfoMiddleware ,(req, res) => {
  successResponse(res, req.user, "success")
});

app.listen(8000, () => console.log('Server listening on port 8000!'));