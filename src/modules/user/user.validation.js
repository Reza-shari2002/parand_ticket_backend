const Joi = require("joi");

const safeText = (value, helpers) => {
  const s = String(value);

  // جلوگیری از کاراکترهای کنترلی (بهداشت ورودی)
  if (/[\u0000-\u001F\u007F]/.test(s)) {
    return helpers.error("string.controlChars");
  }

  return s;
};

const completeProfileSchema = Joi.object({
  full_name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .custom(safeText)
    .required()
    .messages({
      "any.required": "نام و نام خانوادگی الزامی است.",
      "string.empty": "نام و نام خانوادگی الزامی است.",
      "string.min": "نام و نام خانوادگی خیلی کوتاه است.",
      "string.max": "نام و نام خانوادگی خیلی طولانی است.",
      "string.controlChars": "نام و نام خانوادگی شامل کاراکتر غیرمجاز است.",
    }),

  national_code: Joi.string()
    .trim()
    .min(2)
    .max(10)
    .custom(safeText)
    .allow("", null) // این دو مورد برای فیلد اختیاری الزامی است تا خطای empty نخورد
    .optional()
    .messages({
      "string.min": "کد/شناسه واردشده خیلی کوتاه است.",
      "string.max": "کد/شناسه واردشده خیلی طولانی است.",
      "string.controlChars": "کد/شناسه شامل کاراکتر غیرمجاز است.",
    }),
}).options({
  abortEarly: false,
  allowUnknown: false,
  stripUnknown: true,
});

module.exports = { completeProfileSchema };
