const jwt = require("jsonwebtoken");
require("dotenv").config();

function make_access_token(user) {
  return jwt.sign(
    {
      id:user.id,
      phone:user.phone,
      role:user.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "120m" },
  );
}

module.exports = make_access_token;
