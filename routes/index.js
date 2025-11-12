const router = require("express").Router();
const userRouter = require("./users");
const clothingItemsRouter = require("./clothingItems");
const { createUser, login } = require("../controllers/users");
const { NOT_FOUND_ERROR } = require("../utils/errors");

// Public routes
router.post("/signup", createUser);
router.post("/signin", login);


// Protected routes
router.use("/users", userRouter);
router.use("/items", clothingItemsRouter);

// 404 handler
router.use((req, res) => {
  res.status(NOT_FOUND_ERROR).send({ message: "Requested resource not found" });
});

module.exports = router;
