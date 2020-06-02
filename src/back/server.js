
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

// Initializing the router (middleware)
app.use("/", require("./router"));

app.get("/", (req, res) =>{
    res.json({msg: "Index"});
})

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>{
    console.log("Listening...");
})