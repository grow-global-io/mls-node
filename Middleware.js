const jwt = require("jsonwebtoken");
const JwksRsa = require("jwks-rsa");
const axios = require("axios");
require("dotenv").config();
const getUserInfoMiddleware = (req, res, next) => {
  // console.log(req.authId);
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized - Missing token" });
  }

  const accessToken = authHeader.split(" ")[1];

  axios
    .get(`https://dev-ngu25l76.us.auth0.com/api/v2/users/${req.authId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    .then((response) => {
      req.user = response.data; // Attach user info to the request object
      next(); // Continue to the next middleware or route handler
    }).catch((error) => {
      console.error("Error fetching user info:", error);
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    });
  // axios
  //   .get("https://dev-ngu25l76.us.auth0.com/userinfo", {
  //     headers: {
  //       Authorization: `Bearer ${accessToken}`,
  //     },
  //   })
  //   .then((response) => {
  //     req.user = response.data; // Attach user info to the request object
  //     next(); // Continue to the next middleware or route handler
  //   })
  //   .catch((error) => {
  //     console.error("Error fetching user info:", error);
  //     return res.status(401).json({ message: "Unauthorized - Invalid token" });
  //   });
};

const getManagementApiToken = async (req, res, next) => {
  try {
    const response = await axios.post(
      "https://dev-ngu25l76.us.auth0.com/oauth/token",
      {
        client_id: "ccafYc32bPi5cqOkXJwkqzSxmc6fDtKM",
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        audience: "https://dev-ngu25l76.us.auth0.com/api/v2/",
        grant_type: "client_credentials",
      }
    );

    req.managementApiToken = response.data.access_token; // Attach token to the request object
    next();
  } catch (error) {
    console.error("Error fetching Management API token:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Ensure authorization header exists
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const kid = jwt.decode(token, { complete: true })?.header.kid;
    if (!kid) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    const { publicKey } = await JwksRsa({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: "https://dev-ngu25l76.us.auth0.com/.well-known/jwks.json",
    }).getSigningKey(kid);

    const decodedToken = jwt.verify(token, publicKey);
    req.authId = decodedToken.sub; // Set decoded token on the request object for further use
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(403).json({ message: "Token verification failed" });
  }
};
module.exports = { getUserInfoMiddleware, verifyToken, getManagementApiToken };
