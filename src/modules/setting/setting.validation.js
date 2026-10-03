const Joi = require("joi");

const jalaliDateTimeRegex =
  /^\d{4}\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\s([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/;

const updateSettingsSchema = Joi.object({
  is_vip_active: Joi.number().valid(0, 1).optional().messages({
    "number.base": "وضعیت بلیت VIP باید عدد باشد",
    "any.only": "وضعیت بلیت VIP فقط می‌تواند ۰ (غیرفعال) یا ۱ (فعال) باشد",
  }),

  is_regular_active: Joi.number().valid(0, 1).optional().messages({
    "number.base": "وضعیت بلیت عادی باید عدد باشد",
    "any.only": "وضعیت بلیت عادی فقط می‌تواند ۰ (غیرفعال) یا ۱ (فعال) باشد",
  }),

  is_gamer_active: Joi.number().valid(0, 1).optional().messages({
    "number.base": "وضعیت بلیت گیمر باید عدد باشد",
    "any.only": "وضعیت بلیت گیمر فقط می‌تواند ۰ (غیرفعال) یا ۱ (فعال) باشد",
  }),

  vip_message: Joi.string().trim().max(255).allow(null, "").optional().messages({
    "string.base": "پیام بلیت VIP باید متن باشد",
    "string.max": "پیام بلیت VIP نمی‌تواند بیشتر از ۲۵۵ کاراکتر باشد",
  }),

  regular_message: Joi.string()
    .trim()
    .max(255)
    .allow(null, "")
    .optional()
    .messages({
      "string.base": "پیام بلیت عادی باید متن باشد",
      "string.max": "پیام بلیت عادی نمی‌تواند بیشتر از ۲۵۵ کاراکتر باشد",
    }),

  gamer_message: Joi.string().trim().max(255).allow(null, "").optional().messages({
    "string.base": "پیام بلیت گیمر باید متن باشد",
    "string.max": "پیام بلیت گیمر نمی‌تواند بیشتر از ۲۵۵ کاراکتر باشد",
    }),

  vip_location: Joi.string().trim().max(255).allow(null, "").optional().messages({
    "string.base": "مکان VIP باید متن باشد",
    "string.max": "مکان VIP نمی‌تواند بیشتر از ۲۵۵ کاراکتر باشد",
  }),

  regular_location: Joi.string().trim().max(255).allow(null, "").optional().messages({
    "string.base": "مکان عادی باید متن باشد",
    "string.max": "مکان عادی نمی‌تواند بیشتر از ۲۵۵ کاراکتر باشد",
  }),

  gamer_location: Joi.string().trim().max(255).allow(null, "").optional().messages({
    "string.base": "مکان گیمر باید متن باشد",
    "string.max": "مکان گیمر نمی‌تواند بیشتر از ۲۵۵ کاراکتر باشد",
  }),

  vip_price: Joi.number().integer().min(0).optional().messages({
    "number.base": "قیمت بلیت VIP باید عدد باشد",
    "number.integer": "قیمت بلیت VIP باید عدد صحیح باشد",
    "number.min": "قیمت بلیت VIP نمی‌تواند منفی باشد",
  }),

  regular_price: Joi.number().integer().min(0).optional().messages({
    "number.base": "قیمت بلیت عادی باید عدد باشد",
    "number.integer": "قیمت بلیت عادی باید عدد صحیح باشد",
    "number.min": "قیمت بلیت عادی نمی‌تواند منفی باشد",
  }),

  gamer_price: Joi.number().integer().min(0).optional().messages({
    "number.base": "قیمت بلیت گیمر باید عدد باشد",
    "number.integer": "قیمت بلیت گیمر باید عدد صحیح باشد",
    "number.min": "قیمت بلیت گیمر نمی‌تواند منفی باشد",
  }),

  vip_event_date: Joi.string()
    .trim()
    .pattern(jalaliDateTimeRegex)
    .allow(null, "")
    .optional()
    .messages({
      "string.pattern.base":
        "فرمت تاریخ و ساعت VIP باید به صورت شمسی معتبر باشد (مثال: 1405/07/15 18:30)",
    }),

  regular_event_date: Joi.string()
    .trim()
    .pattern(jalaliDateTimeRegex)
    .allow(null, "")
    .optional()
    .messages({
      "string.pattern.base":
        "فرمت تاریخ و ساعت عادی باید به صورت شمسی معتبر باشد (مثال: 1405/07/15 18:30)",
    }),

  gamer_event_date: Joi.string()
    .trim()
    .pattern(jalaliDateTimeRegex)
    .allow(null, "")
    .optional()
    .messages({
      "string.pattern.base":
        "فرمت تاریخ و ساعت گیمر باید به صورت شمسی معتبر باشد (مثال: 1405/07/15 18:30)",
    }),
})
  .min(1)
  .messages({
    "object.min": "حداقل باید یکی از فیلدها برای به‌روزرسانی ارسال شود",
  });

module.exports = {
  updateSettingsSchema,
};
