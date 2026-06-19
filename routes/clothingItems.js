const router = require("express").Router();
const {
  getClothingItems,
  createClothingItem,
  deleteClothingItem,
  likeClothingItem,
  unlikeClothingItem,
} = require("../controllers/clothingItems");
const auth = require("../middlewares/auth");
const {
  validateCardBody,
  validateIdParam,
} = require("../middlewares/validation");

router.get("/", getClothingItems);

router.post("/", auth, validateCardBody, createClothingItem);

router.put("/:itemId/likes", auth, validateIdParam, likeClothingItem);

router.delete("/:itemId/likes", auth, validateIdParam, unlikeClothingItem);

router.delete("/:itemId", auth, validateIdParam, deleteClothingItem);

module.exports = router;
