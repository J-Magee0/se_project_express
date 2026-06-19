const router = require("express").Router();
const userRouter = require("./users");
const clothingItemsRouter = require("./clothingItems");
const { createUser, login } = require("../controllers/users");
const NotFoundError = require("../utils/errors/NotFoundError");
const {
  validateUserBody,
  validateLoginBody,
} = require("../middlewares/validation");

// Public routes
router.post("/signup", createUser);
router.post("/signin", login);

// Protected routes
router.use("/users", validateUserBody, userRouter);
router.use("/items", validateLoginBody, clothingItemsRouter);

// 404 handler
router.use((req, res, next) => {
  next(new NotFoundError("Requested resource not found"));
});

module.exports = router;
