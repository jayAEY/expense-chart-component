const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, require: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String },
});

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
