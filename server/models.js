import mongoose from "mongoose";
mongoose.connect("mongodb://localhost:27017/Wallet", {   useNewUrlParser: true,   useUnifiedTopology: true });

const Schema = mongoose.Schema({
    username: String,
    password: String,
    publickey: String,
    privatekey: String,
})

const models = mongoose.model("User", Schema); // name , schema
module.exports = models; // export model
