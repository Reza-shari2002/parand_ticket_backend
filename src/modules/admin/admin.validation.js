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

const getSeats_schema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(1000).default(20),
  type: Joi.string().valid("gamer", "vip", "regular").optional(),
  status: Joi.string().valid("available", "locked", "sold").optional()
});


const generateSeats_schema = Joi.object({
  gamer: Joi.number().integer().min(0).default(0).messages({
    "number.base": "تعداد صندلی گیمر باید عدد باشد.",
    "number.min": "تعداد صندلی گیمر نمی‌تواند منفی باشد."
  }),
  vip: Joi.number().integer().min(0).default(0).messages({
    "number.base": "تعداد صندلی VIP باید عدد باشد.",
    "number.min": "تعداد صندلی VIP نمی‌تواند منفی باشد."
  }),
  regular: Joi.number().integer().min(0).default(0).messages({
    "number.base": "تعداد صندلی معمولی باید عدد باشد.",
    "number.min": "تعداد صندلی معمولی نمی‌تواند منفی باشد."
  })
}).custom((value, helpers) => {
  // حداقل یکی از دسته‌ها باید بزرگ‌تر از صفر باشد
  if (value.gamer === 0 && value.vip === 0 && value.regular === 0) {
    return helpers.message("حداقل باید تعداد یکی از انواع صندلی‌ها بیشتر از صفر باشد.");
  }
  return value;
});


module.exports.verifyTicket_schema = verifyTicket_schema;
module.exports.getTicketById_schema = getTicketById_schema;
module.exports.getAdminTickets_schema = getAdminTickets_schema;
module.exports.getTransactions_schema = getTransactions_schema;
module.exports.getUsers_schema = getUsers_schema;
module.exports.getOtpLogs_schema = getOtpLogs_schema;
module.exports.getSeats_schema  = getSeats_schema ; 
module.exports.generateSeats_schema = generateSeats_schema;

