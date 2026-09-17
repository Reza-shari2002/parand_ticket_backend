const rateLimit = require("express-rate-limit");
const logger = require("../../../config/logger");
const AppError = require("../../../config/AppErrore");

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return next(new AppError("دسترسی غیرمجاز. فقط ادمین به این بخش دسترسی دارد.", 403));
  }
  next();
}

module.exports = requireAdmin;


