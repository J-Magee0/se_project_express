const mongoose = require("mongoose");
const ClothingItem = require("../models/clothingItem");
const {
  BAD_REQUEST_ERROR,
  NOT_FOUND_ERROR,
  INTERNAL_SERVER_ERROR,
  AUTHENTICATION_ERROR,
} = require("../utils/errors");
const { SUCCESS, CREATED } = require("../utils/successStatus");

// Get /clothing-items
const getClothingItems = (req, res) =>
  ClothingItem.find({})
    .then((items) => {
      res.status(SUCCESS).send(items);
    })
    .catch((err) => {
      console.error(err);
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error has occurred on the server." });
    });

// Post /clothing-items
const createClothingItem = (req, res) => {
  const { name, weather, imageUrl } = req.body;
  const owner = req.user._id;

  return ClothingItem.create({ name, weather, imageUrl, owner })
    .then((item) => {
      res.status(CREATED).send(item);
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST_ERROR).send({ message: err.message });
      }
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error has occurred on the server." });
    });
};

// DELETE /clothing-items/:itemId
const deleteClothingItem = (req, res) => {
  const { itemId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(BAD_REQUEST_ERROR).send({ message: "Invalid item ID" });
  }

  return ClothingItem.findById(itemId)
    .orFail(() => {
      const error = new Error("Card ID not found");
      error.statusCode = NOT_FOUND_ERROR;
      throw error;
    })
    .then((item) => {
      // Check ownership
      if (!item.owner.equals(req.user._id)) {
        return res.status(AUTHENTICATION_ERROR).send({ message: "Forbidden" });
      }

      // If owner matches, delete
      return item
        .deleteOne({ _id: itemId })
        .then(() =>
          res.status(SUCCESS).send({
            message: `Item '${item.name}' deleted successfully.`,
          })
        )
        .catch((err) => {
          console.error(err);
          res
            .status(INTERNAL_SERVER_ERROR)
            .send({ message: "An error has occurred on the server" });
        });
    })
    .catch((err) => {
      console.error(err);

      if (err.name === "CastError") {
        return res
          .status(BAD_REQUEST_ERROR)
          .send({ message: "Invalid item ID" });
      }

      if (err.statusCode === NOT_FOUND_ERROR) {
        return res.status(NOT_FOUND_ERROR).send({ message: err.message });
      }

      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error has occurred on the server" });
    });
};

// Like a clothing item
const likeClothingItem = (req, res) => {
  const { itemId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(BAD_REQUEST_ERROR).send({ message: "Invalid item ID" });
  }

  return ClothingItem.findByIdAndUpdate(
    itemId,
    { $addToSet: { likes: req.user._id } }, // addToSet prevents duplicates
    { new: true }
  )

    .then((item) => {
      if (!item) {
        return res
          .status(NOT_FOUND_ERROR)
          .send({ message: "Clothing item not found" });
      }
      return res.status(SUCCESS).send(item);
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST_ERROR).send({ message: err.message });
      }
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error has occurred on the server." });
    });
};

// Remove like from a clothing item
const unlikeClothingItem = (req, res) => {
  const { itemId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(BAD_REQUEST_ERROR).send({ message: "Invalid item ID" });
  }

  return ClothingItem.findByIdAndUpdate(
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
      return res.status(SUCCESS).send(item);
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST_ERROR).send({ message: err.message });
      }
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error has occurred on the server." });
    });
};

module.exports = {
  getClothingItems,
  createClothingItem,
  deleteClothingItem,
  likeClothingItem,
  unlikeClothingItem,
};
