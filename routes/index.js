const router = require("express").Router();

const userRouter = require("./users");
const clothingItemsRouter = require("./clothingItems");
const { NOT_FOUND_ERROR } = require("../utils/errors");

router.use("/items", clothingItemsRouter);

router.use("/users", userRouter);

router.use((req, res) => {
  res.status(NOT_FOUND_ERROR).send({ message: "Requested resource not found" });
});

module.exports = router;
