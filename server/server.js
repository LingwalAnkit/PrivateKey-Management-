const express = require("express");
const app = express();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { models } = require("./models");
const { Keypair } = require("@solana/web3.js");

app.use(express.json());

const SECRET_KEY = "Ankit";

app.post("/api/v1/signup", async (req, res) => {
  try {
    const { username, password } = req.body;
    const saltRound = 10;
    const hash = await bcrypt.hash(password, saltRound);

    const keypair = new Keypair();

    await models.create({
      username: username,
      password: hash,
      publickey: keypair.publicKey.toString(),
      privatekey: keypair.secretKey.toString(),
    });

    const token = jwt.sign({ username: username }, SECRET_KEY);

    res.json({
      message: "user created successfully",
      token: token,
      publicKey: keypair.publicKey.toString(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

app.post("/api/v1/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await models.findOne({ username: username });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    const ismatch = await bcrypt.compare(password, user.password);
    if (!ismatch) {
      return res.status(401).json({
        message: "Invalid Credentials",
      });
    }

    const token = jwt.sign({ username: username }, SECRET_KEY);
    res.json({
      message: "Login successful",
      token: token,
      publicKey: user.publickey,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

app.post("/api/v1/txn/sign", (req, res) => {
  res.json({
    message: "Transaction signed successfully",
  });
});

app.get("/api/v1/txn", (req, res) => {
  res.json({
    message: "Transaction retrieved successfully",
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
