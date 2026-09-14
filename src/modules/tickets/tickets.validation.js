const Joi = require("joi");

const reserveTicket_schema = Joi.object({
  type: Joi.string().valid("gamer", "vip", "regular").required().messages({
    "any.only":
      "نوع صندلی انتخابی نامعتبر است (باید gamer، vip یا regular باشد)",
    "any.required": "انتخاب نوع صندلی الزامی است",
  }),

  count: Joi.number()
    .integer()
    .min(1)
    .required()
    .when("type", {
      is: "gamer",
      then: Joi.number().max(1).messages({
        "number.max": "برای ثبت‌نام بازیکن فقط امکان رزرو ۱ جایگاه وجود دارد",
      }),
      otherwise: Joi.number().max(5).messages({
        "number.max": "در هر بار خرید حداکثر مجاز به رزرو ۵ صندلی هستید",
      }),
    })
    .messages({
      "number.base": "تعداد صندلی باید یک عدد باشد",
      "number.integer": "تعداد صندلی باید عدد صحیح باشد",
      "number.min": "حداقل باید ۱ صندلی انتخاب کنید",
      "any.required": "مشخص کردن تعداد صندلی الزامی است",
    }),
});

// اسکیما برای استعلام جزئیات یک بلیط: GET /api/tickets/:id
const getTicketById_schema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "number.base": "شناسه بلیط باید عدد باشد",
    "number.positive": "شناسه بلیط نامعتبر است",
    "any.required": "شناسه بلیط الزامی است",
  }),
});

module.exports.reserveTicket_schema = reserveTicket_schema;
module.exports.getTicketById_schema = getTicketById_schema;
