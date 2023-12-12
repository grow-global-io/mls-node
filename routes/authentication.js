const route = require("express").Router();
const axios = require("axios");
require("dotenv").config();
route.post("/signup", async (req, res) => {
    const { email, password, name, username } = req.body;
    await axios.post(
        "https://dev-ngu25l76.us.auth0.com/api/v2/users",
        {
            "email": email,
            "given_name": name,
            "family_name": name,
            "name": name,
            "nickname": name,
            "connection": "Username-Password-Authentication",
            "password": password,
            "username": username,
            "verify_email": true
        },
        {
            headers: {
                "Authorization": `Bearer ${req.managementApiToken}`
            },
        }
    ).then((response) => res.status(200).json(response.data)).catch((err) => res.status(err.response.status).send(err.response.data));
});
route.post('/login', async (req, res) => {
    const { username, password } = req.body;
    await axios.post(
        "https://dev-ngu25l76.us.auth0.com/oauth/token",
        {
            "grant_type": "password",
            "username": username,
            "password": password,
            "audience": "https://dev-ngu25l76.us.auth0.com/api/v2/",
            "scope": "openid profile email",
            "client_id": "ccafYc32bPi5cqOkXJwkqzSxmc6fDtKM",
            "client_secret": process.env.AUTH0_CLIENT_SECRET
        }
    ).then((response) => res.status(200).json(response.data)).catch((err) => res.status(err.response.status).send(err.response.data));
});
module.exports = route;