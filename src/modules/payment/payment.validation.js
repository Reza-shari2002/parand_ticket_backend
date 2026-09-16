const Joi = require("joi");

const paymentRequest_schema = Joi.object({
  ticketId: Joi.number().integer().positive().required().messages({
    "number.base": "شناسه بلیط باید عدد باشد",
    "number.positive": "شناسه بلیط نامعتبر است",
    "any.required": "شناسه بلیط الزامی است",
  }),
});

module.exports.paymentRequest_schema = paymentRequest_schema;

