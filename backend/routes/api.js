const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const router = express.Router();
const nodemailer = require("nodemailer");
const UsersModel = require("../models/Users.js");

dotenv.config();

const verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    res.json({ login: false });
  } else {
    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
      if (err) {
        return res.json({ message: "Invalid Token" });
      } else {
        req.email = decoded.email;
        next();
      }
    });
  }
};

router.get("/", (req, res) => {
  res.json("connected");
});

router.post("/api/test", (req, res) => {
  const { loginEmail, loginPassword } = req.body;
  res.json({ loginEmail, loginPassword });
});

router.post("/api/register", async (req, res) => {
  const { registerEmail, registerPassword } = req.body;
  try {
    const user = await UsersModel.findOne({ email: registerEmail });
    if (user) {
      return res.send("User Already exists!");
    } else {
      const hashedPassword = await bcrypt.hash(registerPassword, 10);
      const newUser = new UsersModel({
        email: registerEmail,
        password: hashedPassword,
      });
      await newUser.save();
      res.send(`${registerEmail} is now registered!`);
    }
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

router.post("/api/login", async (req, res) => {
  const { loginEmail, loginPassword } = req.body;
  try {
    const user = await UsersModel.findOne({ email: loginEmail });
    if (!user) {
      return res.send("No user exists");
    } else {
      const validatedPassword = await bcrypt.compare(
        loginPassword,
        user.password
      );
      if (validatedPassword) {
        const token = jwt.sign({ email: loginEmail }, process.env.JWT_KEY);
        res.cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          partitioned: true,
        });
        return res.send(["You are now logged in", user.data]);
      } else {
        return res.send("Wrong Password");
      }
    }
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

router.post("/api/save", async (req, res) => {
  const { currentEmail, data } = req.body;
  try {
    await UsersModel.findOneAndUpdate({ email: currentEmail }, { data });
    res.send("mongoose updated");
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

router.get("/api/verify", verifyUser, async (req, res) => {
  let user = UsersModel.findOne({ email: req.email });
  return res.send({
    login: true,
    email: req.email,
    data: req.data,
  });
});

router.get("/api/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    partitioned: true,
  });
  return res.send("You are now logged out");
});

router.post("/api/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await UsersModel.findOne({ email });
    if (!user) {
      return res.send("No user exists");
    } else {
      const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, {
        expiresIn: "180s",
      });
      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: "joapuya@gmail.com", pass: process.env.APP_PASSWORD },
      });
      let mailOptions = {
        from: "PasswordAdmin",
        to: email,
        subject: "Password Reset",
        text: `Copy and paste this link onto the reset password page (expires in 3 minutes) ${user._id}/${token}`,
      };
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(err);
        } else {
          console.log(info);
          return res.send("Email sent");
        }
      });
    }
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

router.post("/api/reset-password/:id/:token", (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;
  try {
    jwt.verify(token, process.env.JWT_KEY, async (err, decoded) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      await UsersModel.findByIdAndUpdate(
        { _id: id },
        { password: hashedPassword }
      );
      return res.send("Password updated");
    });
  } catch (err) {
    return res.send(err);
  }
});

module.exports = router;
