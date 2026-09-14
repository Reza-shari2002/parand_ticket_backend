const AppError = require("../../config/AppErrore");
const db = require("../../config/db");
const logger = require("../../config/logger");

async function getSeatsCapacity() {
  try {
    const sql = `
    SELECT 
      type,
      COUNT(*) AS total,
      SUM(
        CASE 
          WHEN status = 'available' THEN 1
          WHEN status = 'locked' AND locked_at < NOW() - INTERVAL 15 MINUTE THEN 1
          ELSE 0
        END
      ) AS available_count
    FROM seats
    GROUP BY type
  `;

    const [rows] = await db.query(sql);
    return rows;
  } catch (err) {
    logger.error("Database error :", err.message);
    throw new AppError("server error", 500);
  }
}

module.exports.getSeatsCapacity = getSeatsCapacity;
