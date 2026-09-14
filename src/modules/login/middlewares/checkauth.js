const bcrypt = require("bcrypt");
const appError = require("../../../config/AppErrore");
const admins_db = require("../login.reposetory");

const check = async (req, res, next) => {
  const { user_name, password } = req.body?.user_info;
  try {
    const data = await admins_db.find_admin(user_name);
    if (data.length === 0) {
      return next(new appError("نام کاربری یا رمز عبور اشتباه است.", 401));
    }

    const user = data[0];
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return next(new appError("نام کاربری یا رمز عبور اشتباه است.", 401));
    }

    delete user.password;
    req.user = user;
    next();
  } catch (err) {
    next(new appError(err.message, 500));
  }
};

module.exports = check;
