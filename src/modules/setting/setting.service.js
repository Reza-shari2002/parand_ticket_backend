const db = require("../../config/db");
const settingRepo = require("./setting.reposetory");
const AppError = require("../../config/AppErrore");
const moment = require("jalali-moment");

function convertJalaliToGregorian(jalaliStr) {
  if (!jalaliStr || jalaliStr === "") return null;

  const m = moment.from(jalaliStr, "fa", "YYYY/MM/DD HH:mm:ss");
  if (!m.isValid()) {
    const mWithoutSec = moment.from(jalaliStr, "fa", "YYYY/MM/DD HH:mm");
    if (!mWithoutSec.isValid()) {
      throw new AppError("فرمت تاریخ شمسی ارسالی نامعتبر است", 400);
    }
    return mWithoutSec.format("YYYY-MM-DD HH:mm:ss");
  }

  return m.format("YYYY-MM-DD HH:mm:ss");
}

async function updateSettings_service(data) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const setting = await settingRepo.getSettingsForUpdate(connection);

    if (!setting) {
      throw new AppError("رکورد تنظیمات یافت نشد", 404);
    }

    const updateData = {};

    if (data.is_vip_active !== undefined)
      updateData.is_vip_active = data.is_vip_active;
    if (data.is_regular_active !== undefined)
      updateData.is_regular_active = data.is_regular_active;
    if (data.is_gamer_active !== undefined)
      updateData.is_gamer_active = data.is_gamer_active;

    if (data.vip_message !== undefined)
      updateData.vip_message = data.vip_message || null;
    if (data.regular_message !== undefined)
      updateData.regular_message = data.regular_message || null;
    if (data.gamer_message !== undefined)
      updateData.gamer_message = data.gamer_message || null;

    if (data.vip_location !== undefined)
      updateData.vip_location = data.vip_location || null;
    if (data.regular_location !== undefined)
      updateData.regular_location = data.regular_location || null;
    if (data.gamer_location !== undefined)
      updateData.gamer_location = data.gamer_location || null;

    // قیمت‌ها
    if (data.vip_price !== undefined) updateData.vip_price = data.vip_price;
    if (data.regular_price !== undefined)
      updateData.regular_price = data.regular_price;
    if (data.gamer_price !== undefined)
      updateData.gamer_price = data.gamer_price;

    if (data.vip_event_date !== undefined) {
      updateData.vip_event_date = convertJalaliToGregorian(data.vip_event_date);
    }
    if (data.regular_event_date !== undefined) {
      updateData.regular_event_date = convertJalaliToGregorian(
        data.regular_event_date,
      );
    }
    if (data.gamer_event_date !== undefined) {
      updateData.gamer_event_date = convertJalaliToGregorian(
        data.gamer_event_date,
      );
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
