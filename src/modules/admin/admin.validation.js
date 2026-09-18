const Joi = require("joi");

const verifyTicket_schema = Joi.object({
  query: Joi.string().trim().min(2).required().messages({
    "string.empty": "عبارت جستجو نمی‌تواند خالی باشد.",
    "string.min": "عبارت جستجو باید حداقل ۲ کاراکتر باشد.",
    "any.required": "ارسال عبارت جستجو (query) الزامی است.",
  }),
});

const getTicketById_schema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "number.base": "شناسه بلیط باید عدد باشد",
    "number.positive": "شناسه بلیط نامعتبر است",
    "any.required": "شناسه بلیط الزامی است",
  }),
});

const getAdminTickets_schema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    "number.base": "شماره صفحه باید یک عدد باشد.",
    "number.min": "شماره صفحه حداقل باید ۱ باشد.",
  }),
  limit: Joi.number().integer().min(1).max(100).default(20).messages({
    "number.base": "تعداد در هر صفحه (limit) باید یک عدد باشد.",
    "number.min": "حداقل مقدار limit برابر با ۱ است.",
    "number.max": "حداکثر مقدار limit برابر با ۱۰۰ است.",
  }),
  type: Joi.string().valid("gamer", "vip", "regular").optional().messages({
    "any.only": "نوع بلیت باید یکی از مقادیر gamer، vip یا regular باشد.",
  }),
});

const getTransactions_schema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

const getUsers_schema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().optional().allow("").messages({
    "string.base": "عبارت جستجو باید متن باشد.",
  }),
});

const getOtpLogs_schema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  phone: Joi.string().optional().allow("").messages({
    "string.base": "شماره تلفن باید متن باشد.",
  }),
  is_used: Joi.boolean().optional().messages({
    "boolean.base": "وضعیت استفاده باید true یا false باشد.",
  }),
});



module.exports.verifyTicket_schema = verifyTicket_schema;
module.exports.getTicketById_schema = getTicketById_schema;
module.exports.getAdminTickets_schema = getAdminTickets_schema;
module.exports.getTransactions_schema = getTransactions_schema;
module.exports.getUsers_schema = getUsers_schema;
module.exports.getOtpLogs_schema = getOtpLogs_schema;