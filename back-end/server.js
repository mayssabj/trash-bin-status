const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path"); 
const nodemailer = require('nodemailer');

// create express app
const app = express();
app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());

// Configuring the database
const dbConfig = require("./config/database.config.js");
const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

// Connecting to the database
mongoose
  .connect(dbConfig.url, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("Successfully connected to the database");
  })
  .catch((err) => {
    console.log("Could not connect to the database. Exiting now...", err);
    process.exit();
  });

app.use(express.static(path.join(__dirname, '../front-end/public')));

// define a simple route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../front-end/public/index.html'));
});

// Include your other route handlers here
require('./routes/trashBin.routes.js')(app);

// listen for requests
app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
