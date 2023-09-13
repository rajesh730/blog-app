const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Schema = new mongoose.Schema({
  name: {
    required: true,
    type: String,
  },

  email: {
    required: true,
    type: String,
    unique: true,
  },
  password: {
    required: true,
    type: String,
  },
  conformpassword: {
    required: true,
    type: String,
  },
});
// ---------------------generate token------------------
Schema.methods.generateAuthToken = async function () {
  const token = await jwt.sign({ _id: this._id }, "rajeshrajpandey");
  return token;
};
// ------------------hash password-------------

Schema.pre("save", async function (next) {
  if (this.isModified("password")) {
    if (this.password === this.conformpassword) {
      const hashedPasswod = await bcrypt.hash(this.password, 12);
      this.password = hashedPasswod;
      this.conformpassword = undefined;
    } else {
      throw new Error("password and conform password are not matching");
    }
  }
  next();
});

const User = mongoose.model("User", Schema);
module.exports = User;
