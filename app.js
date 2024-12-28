const express = require('express');
const app = express();
const dotenv = require("dotenv").config();
const port = process.env.PORT;

const postsRoutes = require("./Routes/Posts_routes");
app.use("/posts", postsRoutes);

app.listen(port, () => {
    console.log(`Example app listening to ${port}`);
});