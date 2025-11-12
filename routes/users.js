const router = require("express").Router();
const {
  getUsers,
  getCurrentUser,
  updateUserProfile,
} = require("../controllers/users");
const auth = require("../middlewares/auth");

// Routes for users

router.get("/", auth, getUsers);
router.get("/me", auth, getCurrentUser);
router.patch("/me", auth, updateUserProfile);

module.exports = router;
