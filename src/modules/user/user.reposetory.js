const AppError = require("../../config/AppErrore");
const db = require("../../config/db");
const logger = require("../../config/logger");

async function findUserByPhone(phone) {
  try {
    const sql = `SELECT * FROM users WHERE phone = ? LIMIT 1`;
    const [rows] = await db.query(sql, [phone]);
    return rows[0];
  } catch (err) {
    logger.error("Database error in finde:", err.message);
    throw new AppError("server error", 500);
  }
}

async function createUser(phone) {
  try {
    const sql = `INSERT INTO users (phone, role) VALUES (?, ?)`;
    const [result] = await db.query(sql, [phone, "user"]);
    return { id: result.insertId, phone, role: "user" };
  } catch (err) {
    logger.error("Database error in create:", err.message);
    throw new AppError("server error", 500);
  }
}


async function updateUserProfile(connection, userId, fullName, nationalCode) {
  const [result] = await connection.query(
    `
    UPDATE users
    SET full_name = ?, national_code = ?
    WHERE id = ?
    `,
    [fullName, nationalCode ?? null, userId]
  );

  return result;
}

async function findUserById(connection, userId) {
  const [rows] = await connection.query(
    `SELECT  phone, role, full_name, national_code, created_at FROM users WHERE id = ? LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
}




module.exports.findUserByPhone = findUserByPhone;
module.exports.createUser = createUser;
module.exports.findUserById = findUserById;
module.exports.updateUserProfile = updateUserProfile;


