const mongoose = require("mongoose");

const UsersSchema = new mongoose.Schema({
  email: { type: String, require: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String },
  data: {
    type: {
      balance: { type: String, default: "0" },
      expenseData: { type: String, default: "[]" },
    },
  },
});

const UsersModel = mongoose.model("Users", UsersSchema);

module.exports = UsersModel;
