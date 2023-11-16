const successResponse = (res, data, message) => {
    res.status(200).json({
        data,
        message
    });
}
const errorResponse = (res, message) => {
    res.status(500).json({
        message
    });
}
module.exports = {
    successResponse,
    errorResponse
}