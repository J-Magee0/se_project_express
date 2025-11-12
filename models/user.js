const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  avatar: {
    type: String,
    required: [true, "Avatar URL is required"],
    validate: {
      validator(value) {
        return validator.isURL(value);
      },
      message: "Invalid URL format",
    },
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: "Invalid email format",
    },
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    select: false, // Exclude password field by default
  },
});

// Static method to find user by credentials
userSchema.statics.findByCredentials = function (email, password) {
  if (!email || !password) {
    return Promise.reject(new Error("Email and password are required"));
  }

  return this.findOne({ email })
    .select("+password")
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error("Invalid email or password"));
      }
      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          return Promise.reject(new Error("Invalid email or password"));
        }
        return user;
      });
    });
};

module.exports = mongoose.model("User", userSchema);
