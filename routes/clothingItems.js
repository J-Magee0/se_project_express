const router = require("express").Router();
const {
  getClothingItems,
  createClothingItem,
  deleteClothingItem,
  likeClothingItem,
  unlikeClothingItem,
} = require("../controllers/clothingItems");
const auth = require("../middlewares/auth");

router.get("/", getClothingItems);

router.post("/", auth, createClothingItem);

router.put("/:itemId/likes", auth, likeClothingItem);

router.delete("/:itemId/likes", auth, unlikeClothingItem);

router.delete("/:itemId", auth, deleteClothingItem);

module.exports = router;
