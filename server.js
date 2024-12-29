const express = require('express');
const app = express();
const dotenv = require("dotenv").config();
const port = process.env.PORT;

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

const mongoose = require("mongoose");
mongoose.connect(process.env.DB_CONNECTION);
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to database"));

const postsRoutes = require("./Routes/Posts_routes");
app.use("/posts", postsRoutes);



module.exports = app;