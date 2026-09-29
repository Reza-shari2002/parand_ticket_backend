const pool = require("../../config/db");
const AppError = require("../../config/AppErrore");
const userRepo = require("./user.reposetory");

async function completeProfile_service(userId, payload) {
  const connection = await pool.getConnection();
  try {
    const result = await userRepo.updateUserProfile(connection, userId, {
      fullName: payload.full_name,
      nationalCode: payload.national_code, // اگر نفرستاده باشد، undefined خواهد بود
    });

    if (result.affectedRows === 0) {
      throw new AppError("کاربر یافت نشد.", 404);
    }

    const updated = await userRepo.findUserById(connection, userId);
    return updated;
  } finally {
    connection.release();
  }
}

async function getProfile_service(userId) {
  const connection = await pool.getConnection();
  try {
    const user = await userRepo.findUserById(connection, userId);
    
    if (!user) {
      throw new AppError("کاربر یافت نشد.", 404);
    }

    return user;
  } finally {
    connection.release();
  }
}



module.exports = { completeProfile_service , getProfile_service };
