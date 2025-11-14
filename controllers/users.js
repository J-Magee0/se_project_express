const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const { JWT_SECRET } = require("../utils/config");
const {
  BAD_REQUEST_ERROR,
  NOT_FOUND_ERROR,
  INTERNAL_SERVER_ERROR,
  CONFLICT_ERROR,
  AUTHORIZATION_ERROR,
} = require("../utils/errors");
const { SUCCESS, CREATED } = require("../utils/successStatus");

// Create new user
const createUser = async (req, res) => {
  const { name, avatar, email, password } = req.body;

  if (!email || !password) {
    return res
      .status(BAD_REQUEST_ERROR)
      .send({ message: "Email and password are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(CONFLICT_ERROR)
        .send({ message: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, avatar, email, password: hash });
    const { password: hashedPassword, ...userWithoutPassword } =
      user.toObject();

    return res.status(CREATED).send(userWithoutPassword);
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(CONFLICT_ERROR)
        .send({ message: "User with this email already exists" });
    }
    console.error(err);
    if (err.name === "ValidationError") {
      return res.status(BAD_REQUEST_ERROR).send({ message: err.message });
    }
    return res
      .status(INTERNAL_SERVER_ERROR)
      .send({ message: "An error occurred on the server" });
  }
};

// Get user by ID
const getCurrentUser = (req, res) => {
  User.findById(req.user._id)
    .orFail()
    .then((user) => {
      const { password, ...userWithoutPassword } = user.toObject();
      res.status(SUCCESS).send(userWithoutPassword);
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND_ERROR).send({ message: "User not found" });
      }
      if (err.name === "CastError") {
        return res
          .status(BAD_REQUEST_ERROR)
          .send({ message: "Invalid user id" });
      }
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error occurred on the server" });
    });
};

// Login Controller
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    //  Check that both email and password are provided
    if (!email || !password) {
      return res
        .status(BAD_REQUEST_ERROR)
        .send({ message: "Email and password are required." });
    }

    //  Find user and validate credentials
    const user = await User.findByCredentials(email, password);

    //  Generate JWT token
    const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    //  Send token to client
    return res.send({ token });
  } catch (err) {
    //  Handle known authentication errors
    if (err.message === "Invalid email or password") {
      return res
        .status(AUTHORIZATION_ERROR)
        .send({ message: "Invalid email or password." });
    }

    //  Log unexpected errors and respond
    console.error("Login error:", err);
    return res
      .status(INTERNAL_SERVER_ERROR)
      .send({ message: "An unexpected server error occurred." });
  }
};

// update name and avatar
const updateUserProfile = (req, res) => {
  const { name, avatar } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { name, avatar },
    { new: true, runValidators: true }
  )
    .orFail()
    .then((user) => {
      const { password, ...userWithoutPassword } = user.toObject();
      res.status(SUCCESS).send(userWithoutPassword);
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST_ERROR).send({ message: err.message });
      }
      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND_ERROR).send({ message: "User not found" });
      }
      if (err.name === "CastError") {
        return res
          .status(BAD_REQUEST_ERROR)
          .send({ message: "Invalid user id" });
      }
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "Something went wrong" });
    });
};

module.exports = {
  createUser,
  getCurrentUser,
  login,
  updateUserProfile,
};
