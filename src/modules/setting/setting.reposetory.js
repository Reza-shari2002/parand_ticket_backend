const db = require("../../config/db");

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
      vip_location,
      regular_location,
      gamer_location,
      vip_price,
      regular_price,
      gamer_price,
      vip_event_date,
      regular_event_date,
      gamer_event_date,
      updated_at
    FROM settings
    ORDER BY id ASC
    LIMIT 1
    FOR UPDATE
  `;

  const [rows] = await connection.query(sql);
  return rows[0] || null;
}

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
      vip_location,
      regular_location,
      gamer_location,
      vip_price,
      regular_price,
      gamer_price,
      vip_event_date,
      regular_event_date,
      gamer_event_date,
      updated_at
    FROM settings
    ORDER BY id ASC
    LIMIT 1
  `;

  const [rows] = await connection.query(sql);
  return rows[0] || null;
}

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

  if (payload.vip_location !== undefined) {
    fields.push("vip_location = ?");
    values.push(payload.vip_location);
  }

  if (payload.regular_location !== undefined) {
    fields.push("regular_location = ?");
    values.push(payload.regular_location);
  }

  if (payload.gamer_location !== undefined) {
    fields.push("gamer_location = ?");
    values.push(payload.gamer_location);
  }

  if (payload.vip_price !== undefined) {
    fields.push("vip_price = ?");
    values.push(payload.vip_price);
  }

  if (payload.regular_price !== undefined) {
    fields.push("regular_price = ?");
    values.push(payload.regular_price);
  }

  if (payload.gamer_price !== undefined) {
    fields.push("gamer_price = ?");
    values.push(payload.gamer_price);
  }

  if (payload.vip_event_date !== undefined) {
    fields.push("vip_event_date = ?");
    values.push(payload.vip_event_date);
  }

  if (payload.regular_event_date !== undefined) {
    fields.push("regular_event_date = ?");
    values.push(payload.regular_event_date);
  }

  if (payload.gamer_event_date !== undefined) {
    fields.push("gamer_event_date = ?");
    values.push(payload.gamer_event_date);
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
      gamer_message,
      vip_location,
      regular_location,
      gamer_location,
      vip_price,
      regular_price,
      gamer_price,
      vip_event_date,
      regular_event_date,
      gamer_event_date
    FROM settings
    ORDER BY id ASC
    LIMIT 1
  `;

  const [rows] = await connection.query(sql);
  return rows[0] || null;
}

async function getSettingsDirect() {
  const sql = `
    SELECT * FROM settings ORDER BY id ASC LIMIT 1
  `;
  // فرض بر این است که db همان pool شماست
  const [rows] = await db.query(sql); 
  return rows[0] || null;
}
module.exports = {
  getSettingsForUpdate,
  getSettings,
  updateSettingsById,
  getSettingsPublic,
  getSettingsDirect  , 
};
