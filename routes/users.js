const router = require("express").Router();
const { getCurrentUser, updateUserProfile } = require("../controllers/users");
const auth = require("../middlewares/auth");
const {
  validateUpdateUserBody,
  validateId,
} = require("../middlewares/validation");

// Routes for users
router.get("/me", auth, getCurrentUser);
router.patch("/me", auth, validateUpdateUserBody, updateUserProfile);

module.exports = router;
