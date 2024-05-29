const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const routes = require("./routes/api.js");

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://daisy-ui-mern-auth-frontend.vercel.app",
    ],
    credentials: true,
  })
);
app.use(cookieParser());

const dbConnect = async () => {
  try {
    mongoose.connect(process.env.URL);
    console.log("Mongoose connected");
  } catch (err) {
    console.log(err);
  }
};

dbConnect();

app.use("/", routes);

//Handle 404 error
app.use((req, res) => {
  res.status(404);
  res.send("404 NOT FOUND");
});

app.listen(process.env.PORT, () => {
  console.log("Server is running");
});
