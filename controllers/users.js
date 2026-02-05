const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const { JWT_SECRET } = require("../utils/config");
const {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
} = require("../utils/errors");
const { SUCCESS, CREATED } = require("../utils/successStatus");

// Create new user
const createUser = async (req, res, next) => {
  const { name, avatar, email, password } = req.body;

  if (!email || !password) {
    return next(new BadRequestError("Email and password are required"));
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ConflictError("User already exists"));
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, avatar, email, password: hash });
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    return res.status(CREATED).send(userWithoutPassword);
  } catch (err) {
    if (err.code === 11000) {
      return next(new ConflictError("User with this email already exists"));
    }
    if (err.name === "ValidationError") {
      return next(new BadRequestError(err.message));
    }
    return next(err);
  }
};

// Get Current User
const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail()
    .then((user) => {
      const userWithoutPassword = user.toObject();
      delete userWithoutPassword.password;
      res.status(SUCCESS).send(userWithoutPassword);
    })
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("User not found"));
      }
      if (err.name === "CastError") {
        return next(new BadRequestError("Invalid user id"));
      }
      return next(err);
    });
};

// Login Controller
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    //  Check that both email and password are provided
    if (!email || !password) {
      return next(new BadRequestError("Email and password are required."));
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
      return next(new UnauthorizedError("Invalid email or password."));
    }

    //  Log unexpected errors and respond
    return next(err);
  }
};

// update name and avatar
const updateUserProfile = (req, res, next) => {
  const { name, avatar } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { name, avatar },
    { new: true, runValidators: true }
  )
    .orFail()
    .then((user) => {
      const userWithoutPassword = user.toObject();
      delete userWithoutPassword.password;
      res.status(SUCCESS).send(userWithoutPassword);
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        return next(new BadRequestError(err.message));
      }
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("User not found"));
      }
      if (err.name === "CastError") {
        return next(new BadRequestError("Invalid user id"));
      }
      return next(err);
    });
};

module.exports = {
  createUser,
  getCurrentUser,
  login,
  updateUserProfile,
};
