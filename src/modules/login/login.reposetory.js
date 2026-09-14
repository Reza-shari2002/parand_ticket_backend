const db = require("../../config/db");
const AppError = require("../../config/AppErrore");

async function find_admin(user_name) {
  try {
    const query = "select * from admins where user_name = ? ";
    const [data] = await db.query(query, [user_name]);
    return data;
  } catch (err) {
    console.log(err.message);
    throw new AppError("server Error", 500);
  }
}


async function insert_user_sessions(data) {
  try {
    const query = "insert into user_sessions (admin_id) values (?)";
    const [result] = await db.query(query, [data.admin_id]);
    return result;
  } catch (err) {
    console.log(err.message);

    if (err instanceof AppError) {
      throw err;
    }

    throw new AppError("server error", 500);
  }
}
module.exports.find_admin = find_admin;
module.exports.insert_user_sessions = insert_user_sessions;