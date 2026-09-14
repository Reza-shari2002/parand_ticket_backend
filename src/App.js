const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const bcrypt = require("bcrypt");
const routes = require('./routes/routes.js');
const err_handler = require("./errorhandler/error_handler.js");
const multer = require("multer");
const logger = require("./config/logger.js");

const app = express();
require("dotenv").config();

logger.info("project started");


const allowedOrigins = [
  'http://localhost:5173','http://localhost:5174' , 
  'https://parand-insurance.ir','https://parandbime.ir'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));


app.set("trust proxy", 1);

app.use(helmet());

app.use('/api' , routes);



app.use(err_handler);

app.listen(3000, "127.0.0.1", () => {
  console.log("server is listening on port 3000");
});
