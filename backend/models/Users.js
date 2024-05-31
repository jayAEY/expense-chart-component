const mongoose = require("mongoose");

const UsersSchema = new mongoose.Schema({
  email: { type: String, require: true, unique: true },
  password: { type: String, required: true },
  data: { type: { balance: String, expenseData: String } },
});

const UsersModel = mongoose.model("Users", UsersSchema);

module.exports = UsersModel;
