const jwt = require("jsonwebtoken");
const User = require("../model/UserModel");

const auth = async (req, res, next) => {
  try {
    const token = await req.cookies.jwt;
    const verifyUser = await jwt.verify(token, "rajeshrajpandey");
    console.log(verifyUser);
    const user = await User.findOne({ _id: verifyUser._id });
    console.log(user);
    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    console.error(err);
  }
};
module.exports = auth;
