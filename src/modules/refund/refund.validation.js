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



  national_code: Joi.string()
    .trim()
    .pattern(/^\d{10}$/)
    .required()
    .messages({
      "any.required": "کد ملی الزامی است",
      "string.pattern.base": "کد ملی باید ۱۰ رقم باشد",
    }),

  iban: Joi.string()
    .trim()
    .uppercase()
    .pattern(/^IR\d{24}$/)
    .required()
    .messages({
      "any.required": "شماره شبا الزامی است",
      "string.pattern.base": "شماره شبا باید با IR شروع شود و ۲۴ رقم بعد از آن باشد",
    }),

  card_number: Joi.string()
    .trim()
    .pattern(/^[0-9\- ]{16,19}$/)
    .required()
    .messages({
      "any.required": "شماره کارت الزامی است",
      "string.pattern.base": "شماره کارت نامعتبر است",
    }),

  full_name: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required()
    .messages({
      "any.required": "نام و نام خانوادگی الزامی است",
      "string.min": "نام و نام خانوادگی کوتاه است",
      "string.max": "نام و نام خانوادگی طولانی است",
    }),
})
  .required()
  .unknown(false);

  module.exports = {refundRequestSchema};