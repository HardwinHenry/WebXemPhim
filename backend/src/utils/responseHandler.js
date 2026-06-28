const sendSuccess = (res, data, statusCode = 200) => res.status(statusCode).json(data)

const sendCreated = (res, data) => sendSuccess(res, data, 201)

module.exports = { sendCreated, sendSuccess }
