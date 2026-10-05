const Joi = require("joi");

const refundRequestSchema = Joi.object({
  ticket_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "any.required": "شناسه بلیت (ticket_id) الزامی است",
      "number.base": "شناسه بلیت نامعتبر است",
      "number.integer": "شناسه بلیت نامعتبر است",
      "number.positive": "شناسه بلیت نامعتبر است",
    }),

  full_name: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required()
    .messages({
      "any.required": "نام و نام خانوادگی الزامی است",
      "string.min": "نام و نام خانوادگی باید حداقل ۳ حرف باشد",
      "string.max": "نام و نام خانوادگی طولانی است",
    }),

  national_code: Joi.string()
    .trim()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "any.required": "کد ملی الزامی است",
      "string.pattern.base": "کد ملی باید دقیقاً ۱۰ رقم انگلیسی باشد",
    }),

  card_number: Joi.string()
    .trim()
    .pattern(/^[0-9]{16}$/)
    .required()
    .messages({
      "any.required": "شماره کارت الزامی است",
      "string.pattern.base": "شماره کارت باید دقیقاً ۱۶ رقم انگلیسی بدون خط تیره باشد",
    }),
})
  .required()
  .unknown(false);

module.exports = { refundRequestSchema };
