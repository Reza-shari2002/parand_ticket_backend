const Joi = require("joi");


const verifyTicket_schema = Joi.object({
  query: Joi.string().trim().min(2).required().messages({
    "string.empty": "عبارت جستجو نمی‌تواند خالی باشد.",
    "string.min": "عبارت جستجو باید حداقل ۲ کاراکتر باشد.",
    "any.required": "ارسال عبارت جستجو (query) الزامی است."
  })
});

module.exports.verifyTicket_schema = verifyTicket_schema;