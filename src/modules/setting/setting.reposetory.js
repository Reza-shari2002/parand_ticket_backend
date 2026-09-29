const db = require("../../config/db");

// گرفتن رکورد تنظیمات با قفل برای آپدیت
async function getSettingsForUpdate(connection) {
  const sql = `
    SELECT 
      id,
      is_vip_active,
      is_regular_active,
      is_gamer_active,
      vip_message,
      regular_message,
      gamer_message,
      updated_at
    FROM settings
    ORDER BY id ASC
    LIMIT 1
    FOR UPDATE
  `;

  const [rows] = await connection.query(sql);
  return rows[0] || null;
}

// گرفتن رکورد تنظیمات بدون قفل
async function getSettings(connection) {
  const sql = `
    SELECT 
      id,
      is_vip_active,
      is_regular_active,
      is_gamer_active,
      vip_message,
      regular_message,
      gamer_message,
      updated_at
    FROM settings
    ORDER BY id ASC
    LIMIT 1
  `;

  const [rows] = await connection.query(sql);
  return rows[0] || null;
}

// آپدیت رکورد تنظیمات
async function updateSettingsById(connection, settingId, payload) {
  const fields = [];
  const values = [];

  if (payload.is_vip_active !== undefined) {
    fields.push("is_vip_active = ?");
    values.push(payload.is_vip_active);
  }

  if (payload.is_regular_active !== undefined) {
    fields.push("is_regular_active = ?");
    values.push(payload.is_regular_active);
  }

  if (payload.is_gamer_active !== undefined) {
    fields.push("is_gamer_active = ?");
    values.push(payload.is_gamer_active);
  }

  if (payload.vip_message !== undefined) {
    fields.push("vip_message = ?");
    values.push(payload.vip_message);
  }

  if (payload.regular_message !== undefined) {
    fields.push("regular_message = ?");
    values.push(payload.regular_message);
  }

  if (payload.gamer_message !== undefined) {
    fields.push("gamer_message = ?");
    values.push(payload.gamer_message);
  }

  if (!fields.length) {
    return { affectedRows: 0 };
  }

  const sql = `
    UPDATE settings
    SET ${fields.join(", ")}
    WHERE id = ?
  `;

  values.push(settingId);

  const [result] = await connection.query(sql, values);
  return result;
}

async function getSettingsPublic(connection) {
  const sql = `
    SELECT
      is_vip_active,
      is_regular_active,
      is_gamer_active,
      vip_message,
      regular_message,
      gamer_message
    FROM settings
    ORDER BY id ASC
    LIMIT 1
  `;

  const [rows] = await connection.query(sql);
  return rows[0] || null;
}

async function getSettingsDirect() {
  const sql = `
    SELECT 
      is_vip_active,
      is_regular_active,
      is_gamer_active,
      vip_message,
      regular_message,
      gamer_message
    FROM settings
    ORDER BY id ASC
    LIMIT 1
  `;
  const [rows] = await db.query(sql);
  return rows[0] || null;
}

module.exports = {
  getSettingsForUpdate,
  getSettings,
  updateSettingsById,
  getSettingsPublic,
  getSettingsDirect,
};
