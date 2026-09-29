const db = require("../../config/db");
const settingRepo = require("./setting.reposetory");
const AppError = require("../../config/AppErrore");

async function updateSettings_service(data) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const setting = await settingRepo.getSettingsForUpdate(connection);

    if (!setting) {
      throw new AppError("رکورد تنظیمات یافت نشد", 404);
    }

    const updateData = {};

    if (data.is_vip_active !== undefined) {
      updateData.is_vip_active = data.is_vip_active;
    }

    if (data.is_regular_active !== undefined) {
      updateData.is_regular_active = data.is_regular_active;
    }

    if (data.is_gamer_active !== undefined) {
      updateData.is_gamer_active = data.is_gamer_active;
    }

    if (data.vip_message !== undefined) {
      updateData.vip_message = data.vip_message;
    }

    if (data.regular_message !== undefined) {
      updateData.regular_message = data.regular_message;
    }

    if (data.gamer_message !== undefined) {
      updateData.gamer_message = data.gamer_message;
    }

    if (!Object.keys(updateData).length) {
      throw new AppError("حداقل یک فیلد برای بروزرسانی ارسال کنید", 400);
    }

    await settingRepo.updateSettingsById(connection, setting.id, updateData);

    const updatedSetting = await settingRepo.getSettings(connection);

    await connection.commit();

    return updatedSetting;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}



async function getSettingsPublic_service() {
  const connection = await db.getConnection();

  try {
    const settings = await settingRepo.getSettingsPublic(connection);

    if (!settings) {
      throw new AppError("رکورد تنظیمات یافت نشد", 404);
    }

    return settings;
  } finally {
    connection.release();
  }
}

module.exports = {
  updateSettings_service,
  getSettingsPublic_service,
};

