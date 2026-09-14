const generateAccesstoken = require("../../services/token/Accesstoken");
const reposetory = require("./login.reposetory");
const AppError = require("../../config/AppErrore");

const login = async (user) => {
  const AccessToken = generateAccesstoken(user);

  try {
    const { id } = user;
    const data = { admin_id: id };

    await reposetory.insert_user_sessions(data);

    return AccessToken;
  } catch (err) {

      throw (new AppError("server error" , 500));
  }
};

module.exports.login = login;
