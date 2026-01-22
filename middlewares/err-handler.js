const { INTERNAL_SERVER_ERROR } = require("../utils/errors");

const errorHandler = (err, req, res, next) => {
  console.error(err);

  // If the error has a statusCode, use it; otherwise, use 500
  const statusCode = err.statusCode || INTERNAL_SERVER_ERROR;

  // Send response with the appropriate status code and message
  res.status(statusCode).send({
    message: err.message || "An error has occurred on the server.",
  });
};

module.exports = errorHandler;
