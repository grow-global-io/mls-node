const router = require("express").Router();
const axios = require("axios");
require("dotenv").config();
const { successResponse, errorResponse } = require("../responses");
const {
    getUserInfoMiddleware,
    verifyToken,
    getManagementApiToken,
} = require("../Middleware");
// auth0 email verification resend
router.get(
    "/resendVerification",
    verifyToken,
    getUserInfoMiddleware,
    getManagementApiToken,
    async (req, res) => {
        const { user_id, identities } = req.user;
        const { provider, user_id: auth0_user_id } = identities[0];
        await axios
            .post(
                "https://dev-ngu25l76.us.auth0.com/api/v2/jobs/verification-email",
                {
                    user_id: user_id,
                    client_id: "ccafYc32bPi5cqOkXJwkqzSxmc6fDtKM",
                    identity: {
                        user_id: auth0_user_id,
                        provider: provider,
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer ${req.managementApiToken}`,
                    },
                }
            )
            .then((response) => successResponse(res, response.data, "success"))
            .catch((err) =>
                errorResponse(res, err.response.data, err.response.status)
            );
    }
);
router.get(
    "/change-password",
    verifyToken,
    getUserInfoMiddleware,
    async (req, res) => {
        // Construct the request to change the password using Auth0 Management API
        try {
            const apiUrl = `https://dev-ngu25l76.us.auth0.com/dbconnections/change_password`;

            const response = await axios.post(
                apiUrl,
                {
                    client_id: "ccafYc32bPi5cqOkXJwkqzSxmc6fDtKM",
                    email: req.user.email,
                    connection: req.user.identities[0].connection,
                },
                {
                    headers: {
                        Authorization: `Bearer ${req.headers.authorization.split(" ")[1]}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            res.status(200).json({
                message: "Password changed successfully",
                data: response.data,
            });
        } catch (error) {
            console.error(
                "Error changing password:",
                error.response?.data || error.message
            );
            res.status(500).json({ message: "Failed to change password" });
        }
    }
);
module.exports = router;
