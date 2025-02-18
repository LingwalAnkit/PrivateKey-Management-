const express = require("express");
const app = express();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models"); // Import the User model directly
const { Keypair, Transaction } = require("@solana/web3.js");
const cors = require('cors');

app.use(cors());
app.use(express.json());

const SECRET_KEY = "Ankit";

app.post("/api/v1/signup", async (req, res) => {
  try {
    const { username, password } = req.body;
    const saltRound = 10;
    const hash = await bcrypt.hash(password, saltRound);

    const keypair = new Keypair();

    // Create new user using the User model directly
    await User.create({
      username: username,
      password: hash,
      publickey: keypair.publicKey.toString(),
      privatekey: Buffer.from(keypair.secretKey).toString('base64')
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
    const user = await User.findOne({ username: username });
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

app.post("/api/v1/txn/sign", async (req, res) => {
  try {
    const serializedTx = req.body.message;
    const tx = Transaction.from(serializedTx);

    const user = await User.findOne({ 
      publickey: tx.feePayer.toString() 
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const privateKey = Uint8Array.from(Buffer.from(user.privatekey, 'base64'));
    tx.sign(privateKey);

    res.json({
      message: "Transaction signed successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Transaction signing failed",
    });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});