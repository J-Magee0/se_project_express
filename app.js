const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { errors } = require("celebrate");
const mainRouter = require("./routes/index");
const errorHandler = require("./middlewares/err-handler");

const app = express();
const { PORT = 3001 } = process.env;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Main router for all routes
app.use(mainRouter);

// celebrate error handler
app.use(errors());

// our centralized handler
app.use(errorHandler);

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
