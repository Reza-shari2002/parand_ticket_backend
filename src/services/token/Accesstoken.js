const jwt = require("jsonwebtoken");
require("dotenv").config();

function make_access_token(user) {

  if(user.role === 'admin'){
    return jwt.sign(
    {
      id:user.id,
      phone:user.phone,
      role:user.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "200m" },
  );
  }
  else{
  return jwt.sign(
    {
      id:user.id,
      phone:user.phone,
      role:user.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "120m" },
  );}
}

module.exports = make_access_token;
