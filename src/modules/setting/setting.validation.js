const Joi = require("joi");

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

  regular_message: Joi.string().trim().max(255).allow(null, "").optional().messages({
    "string.base": "پیام بلیت عادی باید متن باشد",
    "string.max": "پیام بلیت عادی نمی‌تواند بیشتر از ۲۵۵ کاراکتر باشد",
  }),

  gamer_message: Joi.string().trim().max(255).allow(null, "").optional().messages({
    "string.base": "پیام بلیت گیمر باید متن باشد",
    "string.max": "پیام بلیت گیمر نمی‌تواند بیشتر از ۲۵۵ کاراکتر باشد",
  }),
})
  .min(1)
  .messages({
    "object.min": "حداقل باید یکی از فیلدها برای به‌روزرسانی ارسال شود",
  });

module.exports = {
  updateSettingsSchema,
};
