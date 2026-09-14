const Services = require("./seats.service");
const logger = require("../../config/logger");
const getSeatsCapacity_service = require("./seats.service");

async function capacity_controller(req, res, next) {
  try {
    const result = await getSeatsCapacity_service.getSeatsCapacity_service();
    return res.status(200).json({
      status: "success",
      data:result
    });
  } catch (err) {
    next(err);
  }
}

module.exports.capacity_controller = capacity_controller;
