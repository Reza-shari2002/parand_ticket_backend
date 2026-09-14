const joi = require("joi");

const Submit_third_party_insurance_schema = joi.object({
  full_name: joi.string().max(80).required(),
  phone_number: joi.string().max(11).required(),
  payment_type: joi.string().valid("0", "1").required(),
  date: joi.string().max(80).required(),
  car_name: joi.string().max(50).required(),
  total_cost: joi.number().required(),

  precome: joi.when("payment_type", {
    is: "1",
    then: joi.number().required(),
    otherwise: joi.forbidden(),
  }),

  cost_of_rate: joi.when("payment_type", {
    is: "1",
    then: joi.number().required(),
    otherwise: joi.forbidden(),
  }),

  count_of_rate: joi.when("payment_type", {
    is: "1",
    then: joi.number().required(),
    otherwise: joi.forbidden(),
  }),
});

module.exports.Submit_third_party_insurance_schema = Submit_third_party_insurance_schema;
