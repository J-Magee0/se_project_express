const mongoose = require("mongoose");
const ClothingItem = require("../models/clothingItem");
const {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} = require("../utils/errors");
const { SUCCESS, CREATED } = require("../utils/successStatus");

// Get /clothing-items
const getClothingItems = (req, res, next) =>
  ClothingItem.find({})
    .then((items) => {
      res.status(SUCCESS).send(items);
    })
    .catch(next);

// Post /clothing-items
const createClothingItem = (req, res, next) => {
  const { name, weather, imageUrl } = req.body;
  const owner = req.user._id;

  return ClothingItem.create({ name, weather, imageUrl, owner })
    .then((item) => {
      res.status(CREATED).send(item);
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        return next(new BadRequestError(err.message));
      }
      return next(err);
    });
};

// DELETE /clothing-items/:itemId
const deleteClothingItem = (req, res, next) => {
  const { itemId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return next(new BadRequestError("Invalid item ID"));
  }

  return ClothingItem.findById(itemId)
    .orFail(() => {
      const error = new NotFoundError("Card ID not found");
      throw error;
    })
    .then((item) => {
      // Check ownership
      if (!item.owner.equals(req.user._id)) {
        return next(new ForbiddenError("Forbidden"));
      }

      // If owner matches, delete
      return item
        .deleteOne({ _id: itemId })
        .then(() =>
          res.status(SUCCESS).send({
            message: `Item '${item.name}' deleted successfully.`,
          })
        )
        .catch(next);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        return next(new BadRequestError("Invalid item ID"));
      }

      if (err.statusCode === 404) {
        return next(err);
      }

      return next(err);
    });
};

// Like a clothing item
const likeClothingItem = (req, res, next) => {
  const { itemId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return next(new BadRequestError("Invalid item ID"));
  }

  return ClothingItem.findByIdAndUpdate(
    itemId,
    { $addToSet: { likes: req.user._id } }, // addToSet prevents duplicates
    { new: true }
  )
    .then((item) => {
      if (!item) {
        return next(new NotFoundError("Clothing item not found"));
      }
      return res.status(SUCCESS).send(item);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        return next(new BadRequestError(err.message));
      }
      return next(err);
    });
};

// Remove like from a clothing item
const unlikeClothingItem = (req, res, next) => {
  const { itemId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return next(new BadRequestError("Invalid item ID"));
  }

  return ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .then((item) => {
      if (!item) {
        return next(new NotFoundError("Clothing item not found"));
      }
      return res.status(SUCCESS).send(item);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        return next(new BadRequestError(err.message));
      }
      return next(err);
    });
};

module.exports = {
  getClothingItems,
  createClothingItem,
  deleteClothingItem,
  likeClothingItem,
  unlikeClothingItem,
};
