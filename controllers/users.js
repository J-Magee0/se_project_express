const User = require("../models/user");
const  { BAD_REQUEST_ERROR,
  NOT_FOUND_ERROR,
  SUCCESS,
  CREATED,
  INTERNAL_SERVER_ERROR} = require("../utils/errors");


// Get /users
const getUsers = (req, res) => {
  console.log("Fetching all users");
  User.find({})
    .then((users) => {
      res.status(SUCCESS).send(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(INTERNAL_SERVER_ERROR).send({ message: "Internal Server Error" });
    });
};

const createUser = (req, res) => {
  const { name, avatar } = req.body;
  console.log(name, avatar);
  User.create({ name, avatar })
    .then((user) => {
      res.status(CREATED).send(user);
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

const getUserById = (req, res) => {
  const { userId } = req.params;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(NOT_FOUND_ERROR).send({ message: "User not found" });
      }
      res.status(SUCCESS).send(user);
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

module.exports = { getUsers, createUser, getUserById };
