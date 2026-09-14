const jwt = require("jsonwebtoken");
const util = require("util");
const AppError = require("../config/AppErrore");
const verifyAsync = util.promisify(jwt.verify);
require("dotenv").config();

async function access_verify(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new AppError("Unauthorized", 401));
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer" || !parts[1]) {
    return next(new AppError("Invalid authorization header format", 401));
  }

  const token = parts[1];

  try {
    const user = await verifyAsync(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = user;
    return next();
  } catch (err) {
    return next(new AppError("Unauthorized", 401));
  }
}

module.exports = access_verify;
