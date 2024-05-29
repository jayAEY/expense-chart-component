const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const router = express.Router();
const UserModel = require("../models/Users.js");
// const nodemailer = require("nodemailer");

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
        req.avatar = decoded.avatar;
        next();
      }
    });
  }
};

router.get("/", (req, res) => {
  res.json("connected");
});

router.get("/api/test", (req, res) => {
  res.json(new Date());
});

router.post("/api/register", async (req, res) => {
  const { email, password, avatar } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (user) {
      return res.send("User Already exists!");
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new UserModel({
        email,
        password: hashedPassword,
        avatar,
      });
      await newUser.save();
      res.send(`${email} is now registered!`);
    }
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

router.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.send("No user exists");
    } else {
      const validatedPassword = await bcrypt.compare(password, user.password);
      if (validatedPassword) {
        const token = jwt.sign(
          { email, avatar: user.avatar },
          process.env.JWT_KEY
        );
        res.cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          partitioned: true,
        });
        return res.send("You are now logged in");
      } else {
        return res.send("Wrong Password");
      }
    }
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

// router.post("/api/forgot-password", async (req, res) => {
//   const { email } = req.body;
//   try {
//     const user = await UserModel.findOne({ email });
//     if (!user) {
//       return res.send("No user exists");
//     } else {
//       const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, {
//         expiresIn: "1d",
//       });

//       let transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: { user: "joapuya@gmail.com", pass: process.env.APP_PASSWORD },
//       });

//       let mailOptions = {
//         from: "PasswordAdmin",
//         to: email,
//         subject: "Password Reset",
//         text: `${process.env.FRONTEND_URL}/${user._id}/${token}`,
//       };

//       transporter.sendMail(mailOptions, (err, info) => {
//         try {
//           return res.send("Email sent");
//         } catch (err) {
//           console.log(err);
//         }
//       });
//     }
//   } catch (err) {
//     console.log(err);
//     res.send(err);
//   }
// });

// router.post("/api/reset-password/:id/:token", (req, res) => {
//   const { id, token } = req.params;
//   const { password } = req.body;
//   try {
//     jwt.verify(token, process.env.JWT_KEY, async (err, decoded) => {
//       const hashedPassword = await bcrypt.hash(password, 10);
//       await UserModel.findByIdAndUpdate(
//         { _id: id },
//         { password: hashedPassword }
//       );
//       return res.send("Success");
//     });
//   } catch (err) {
//     return res.send(err);
//   }
// });

router.get("/api/verify", verifyUser, (req, res) => {
  return res.json({ login: true, email: req.email, avatar: req.avatar });
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

module.exports = router;
