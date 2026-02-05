const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { errors } = require("celebrate");
const mainRouter = require("./routes/index");
const errorHandler = require("./middlewares/err-handler");
const { requestLogger, errorLogger } = require("./middlewares/logger");

const app = express();
const { PORT = 3001 } = process.env;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(requestLogger);
// Main router for all routes
app.use(mainRouter);

// enabling error Logger
app.use(errorLogger);

// celebrate error handler
app.use(errors()); // celebrate error handler
app.use(errorHandler); // centralied error handlers

// Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch(console.error);

// Start the server
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
