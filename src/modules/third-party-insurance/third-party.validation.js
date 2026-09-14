const joi = require('joi');








const create_form_schema = joi.object({
  full_name: joi.string().max(50).required(),
  phone_number: joi
    .string()
    .trim()
    .pattern(/^09\d{9}$/)
    .required(),
  address: joi.string().trim().max(100).required(),
  postal_code: joi
    .string()
    .trim()
    .pattern(/^\d{10}$/)
    .required(),
  national_code: joi
    .string()
    .trim()
    .pattern(/^\d{10}$/)
    .required(),
  birthday_date: joi
    .string()
    .trim()
    .pattern(/^(13|14)\d{2}\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])$/)
    .required(),

  has_prev_insurance :   joi.string().valid("0", "1").required(),
  has_discount_transfer: joi.string().valid("0", "1").required(),
  has_active_insurance_transfer: joi.string().valid("0", "1").required(),
  is_relative_transfer: joi.string().valid("0", "1").required(),
  plate_history_type: joi.string().valid("0", "1", "2").required(),
  document_car_type: joi.string().valid("0", "1").required(),
  payment_type: joi.string().valid("0", "1", "2").required(),
  same_policyholder_owner: joi.string().valid("0", "1").required(),

  plate_history_code: joi
    .string()
    .trim()
    .max(50)
    .when("plate_history_type", {
      is: "0",
      then: joi.required(),
      otherwise: joi.allow("", null).optional(),
    }),

  owner_national_code: joi
    .string()
    .trim()
    .pattern(/^\d{10}$/)
    .when("same_policyholder_owner", {
      is: "0",
      then: joi.required(),
      otherwise: joi.allow("", null),
    }),

  owner_birthday_date: joi
    .string()
    .trim()
    .pattern(/^(13|14)\d{2}\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])$/)
    .when("same_policyholder_owner", {
      is: "0",
      then: joi.required(),
      otherwise: joi.allow("", null),
    }),

  owner_full_name: joi
    .string()
    .trim()
    .max(50)
    .when("same_policyholder_owner", {
      is: "0",
      then: joi.required(),
      otherwise: joi.allow("", null),
    }),
  owner_phone_number: joi
    .string()
    .trim()
    .pattern(/^09\d{9}$/)
    .when("same_policyholder_owner", {
      is: "0",
      then: joi.required(),
      otherwise: joi.allow("", null),
    }),
});


const filter_schema = joi.object({phone:joi.string().max(12).allow("", null)  , fullName:joi.string().max(12).allow("" , null)});


const query_schema = joi.object({  page: joi.number().integer().min(1).default(1),
  limit: joi.number().integer().min(1).max(100).default(7)})


module.exports.query_schema = query_schema;  
module.exports.create_form_schema = create_form_schema;
module.exports.filter_schema = filter_schema;