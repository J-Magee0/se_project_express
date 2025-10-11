const mongoose = require("mongoose");
const ClothingItem = require("../models/clothingItem");
const {
  BAD_REQUEST_ERROR,
  NOT_FOUND_ERROR,
  SUCCESS,
  INTERNAL_SERVER_ERROR,
  CREATED,
} = require("../utils/errors");

// Get /clothing-items
const getClothingItems = (req, res) => {
  console.log("Fetching all clothing items");
  ClothingItem.find({})
    .then((items) => {
      res.status(SUCCESS).send(items);
    })
    .catch((err) => {
      console.error(err);
      res.status(INTERNAL_SERVER_ERROR).send({ message: err.message });
    });
};

// Post /clothing-items
const createClothingItem = (req, res) => {
  const { name, weather, imageUrl, owner } = req.body;
  console.log(name, weather, imageUrl, owner, req.user._id);
  ClothingItem.create({ name, weather, imageUrl, owner: req.user._id })
    .then((item) => {
      res.status(CREATED).send(item);
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST_ERROR).send({ message: err.message });
      } else {
        res.status(INTERNAL_SERVER_ERROR).send({ message: err.message });
      }
    });
};

//delete /clothing-items/:itemId
const deleteClothingItem = (req, res) => {
  const { itemId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(BAD_REQUEST_ERROR).send({ message: "Invalid item ID" });
  }

  ClothingItem.findByIdAndDelete(itemId)
    .then((item) => {
      if (!item) {
        return res
          .status(NOT_FOUND_ERROR)
          .send({ message: `Clothing item with id ${itemId} not found.` });
      }
      res.status(SUCCESS).send({
        message: `Clothing item '${item.name}' deleted successfully.`,
      });
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST_ERROR).send({ message: err.message });
      } else {
        res.status(INTERNAL_SERVER_ERROR).send({ message: err.message });
      }
    });
};

// Like a clothing item
const likeClothingItem = (req, res) => {
  const { itemId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(BAD_REQUEST_ERROR).send({ message: "Invalid item ID" });
  }

  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $addToSet: { likes: req.user._id } }, // addToSet prevents duplicates
    { new: true }
  )

    .then((item) => {
      if (!item) {
        return res
          .status(NOT_FOUND_ERROR)
          .send({ message: "Clothing item not found" });
      }
      res.status(SUCCESS).send(item);
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError") {
        return res.status(NOT_FOUND_ERROR).send({ message: err.message });
      } else {
        res.status(INTERNAL_SERVER_ERROR).send({ message: err.message });
      }
    });
};

// Remove like from a clothing item
const unlikeClothingItem = (req, res) => {
  const { itemId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(BAD_REQUEST_ERROR).send({ message: "Invalid item ID" });
  }

  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )

    .then((item) => {
      if (!item) {
        return res
          .status(NOT_FOUND_ERROR)
          .send({ message: "Clothing item not found" });
      }
      res.status(SUCCESS).send(item);
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError") {
        return res.status(NOT_FOUND_ERROR).send({ message: err.message });
      } else {
        res.status(INTERNAL_SERVER_ERROR).send({ message: err.message });
      }
    });
};

module.exports = {
  getClothingItems,
  createClothingItem,
  deleteClothingItem,
  likeClothingItem,
  unlikeClothingItem,
};
