const { json } = require("express");
const AppError = require("../config/AppErrore");
const logger = require("../config/logger");

function checkbody_query(item, schema) {
  if (item === "login") {
    return async function (req, res, next) {
      const body = req.body;

      if (!body) {
        return res.status(400).json({ message: " request must have body" });
      }
      const { user_info } = req.body;

      if (!user_info) {
        return res
          .status(400)
          .json({ message: "بدنه درخواست باید شامل user_info باشد." });
      }

      const { error, value } = schema.validate(user_info);
      if (error) {
        console.log(`validation body :  ${error.details[0].message}`);
        return next(new AppError("login data wrong", 400));
      }

      next();
    };
  } else if (item === "create form") {
    return function (req, res, next) {
      const body = req?.body;

      if (!body) {
        return next(new AppError("form data wrong", 400));
      }

      const { error, value } = schema.validate(req.body);
      if (error) {
        logger.error(`validation body :  ${error.details[0].message}`);
        console.log(`validation body :  ${error.details[0].message}`);
        return next(new AppError("form data wrong", 400));
      }

      req.body = value;
      return next();
    };
  } else if (item === "send") {
    return function (req, res, next) {
      const body = req?.body;

      if (!body) {
        console.log("req has not body");
        return next(new AppError("form data wrong", 400));
      }

      const { error, value } = schema.validate(req.body);
      if (error) {
        logger.error(`validation body :  ${error.details[0].message}`);
        console.log(`validation body :  ${error.details[0].message}`);
        return next(new AppError("notification_data_wrong", 400));
      }
      req.body = value;
      return next();
    };
  } else if (item === "query") {
    return function (req, res, next) {
      const { error, value } = schema.validate(req.query, { convert: true });
      if (error) {
        logger.error(`validation query : ${error.details[0].message}`);
        console.log(`validation body :  ${error.details[0].message}`);
        return next(new AppError("query not valid", 400));
      }
      req.validatedQuery = value;

      return next();
    };
  } else if (item === "filter") {
    return function (req, res, next) {
      const filter = req.query;
      const { error, value } = schema.validate(filter);
      if (error) {
        logger.error(`validation error:${error.details[0].message}`);
        console.log(`validation error : ${error.details[0].message}`);
        return next(new AppError("filter  not valid", 400));
      }
      logger.info(JSON.stringify(req.query));
      req.filter = filter;
      return next();
    };
  } else if (item === "sendOtp") {
    return function (req, res, next) {
      const body = req.body;

      if (!body) {
        return res.status(400).json({ message: " request must have body" });
      }
      const { error, value } = schema.validate(req.body, { convert: true });
      if (error) {
        logger.error(`validation query : ${error.details[0].message}`);
        console.log(`validation body :  ${error.details[0].message}`);
        return next(new AppError("phone_number not valid", 400));
      }
      req.phone_number = value.phone_number;

      return next();
    };
  } else if (item === "verify-otp") {
    return function (req, res, next) {
      const body = req.body;

      if (!body) {
        return res.status(400).json({ message: " request must have body" });
      }

      const { error, value } = schema.validate(req.body, { convert: true });
      if (error) {
        logger.error(`validation query : ${error.details[0].message}`);
        console.log(`validation body :  ${error.details[0].message}`);
        return next(new AppError("otp or phone number not valid", 400));
      }
      req.phone_number = value.phone_number;
      req.otp = value.otp;

      return next();
    };
  } else if (item === "reserveTicket") {
    return function (req, res, next) {
      const body = req.body;

      if (!body) {
        return res.status(400).json({ message: " request must have body" });
      }
      const { error, value } = schema.validate(req.body, { convert: true });
      if (error) {
        logger.error(`validation query : ${error.details[0].message}`);
        console.log(`validation body :  ${error.details[0].message}`);
        return next(new AppError(error.details[0].message, 400));
      }
      req.ticketData = value; // شامل type و count
      return next();
    };
  } else if (item === "viewTicket") {
    return function (req, res, next) {
      const params = req.params;

      if (!params) {
        return res.status(400).json({ message: " request must have params" });
      }
      const { error, value } = schema.validate(params, { convert: true });
      if (error) {
        logger.error(`validation query : ${error.details[0].message}`);
        console.log(`validation body :  ${error.details[0].message}`);
        return next(new AppError(error.details[0].message, 400));
      }
      req.id = value.id; // شامل type و count
      return next();
    };
  } else if (item === "paymentRequest") {
    return function (req, res, next) {
      const body = req.body;

      if (!body) {
        return res.status(400).json({ message: " request must have params" });
      }
      const { error, value } = schema.validate(body, { convert: true });
      if (error) {
        logger.error(`validation query : ${error.details[0].message}`);
        console.log(`validation body :  ${error.details[0].message}`);
        return next(new AppError(error.details[0].message, 400));
      }
      req.ticketId = value.ticketId;
      // شامل type و count
      return next();
    };
  } else if (item === "update_user") {
    return function (req, res, next) {
      const body = req.body;

      if (!body) {
        return res.status(400).json({ message: " request must have params" });
      }
      const { error, value } = schema.validate(body, { convert: true });
      if (error) {
        logger.error(`validation query : ${error.details[0].message}`);
        console.log(`validation body :  ${error.details[0].message}`);
        return next(new AppError(error.details[0].message, 400));
      }
      req.body = value;
      // شامل type و count
      return next();
    };
  } else if (item === "Verify-ticket") {
    return function (req, res, next) {
      const query = req.query;

      if (!query) {
        return res.status(400).json({ message: " request must have params" });
      }
      const { error, value } = schema.validate(query, { convert: true });
      if (error) {
        logger.error(`validation query : ${error.details[0].message}`);
        console.log(`validation body :  ${error.details[0].message}`);
        return next(new AppError(error.details[0].message, 400));
      }
      req.query = value;
      // شامل type و count
      return next();
    };
  } else if (item === "useTicket") {
    return function (req, res, next) {
      const params = req.params;

      if (!params) {
        return res.status(400).json({ message: " request must have params" });
      }
      const { error, value } = schema.validate(params, { convert: true });
      if (error) {
        logger.error(`validation query : ${error.details[0].message}`);
        console.log(`validation body :  ${error.details[0].message}`);
        return next(new AppError(error.details[0].message, 400));
      }
      req.id = value.id; // شامل type و count
      return next();
    };
  } else if (item === "allTickets") {
    return function (req, res, next) {
      const params = req.query;
      

      if (!params) {
        return res.status(400).json({ message: " request must have params" });
      }
      const { error, value } = schema.validate(params, { convert: true });
      if (error) {
        logger.error(`validation query : ${error.details[0].message}`);
        console.log(`validation body :  ${error.details[0].message}`);
        return next(new AppError(error.details[0].message, 400));
      }
     
      req.filter = value; // شامل type و count
      return next();
    };
  } else if (item === "allTransaction") {
    return function (req, res, next) {
      const params = req.query;

      if (!params) {
        return res.status(400).json({ message: " request must have params" });
      }
      const { error, value } = schema.validate(params, { convert: true });
      if (error) {
        logger.error(`validation query : ${error.details[0].message}`);
        console.log(`validation body :  ${error.details[0].message}`);
        return next(new AppError(error.details[0].message, 400));
      }
      req.filter = value; // شامل type و count
      return next();
    };
  } else if (item === "allUsers") {
    return function (req, res, next) {
      const params = req.query;

      if (!params) {
        return res.status(400).json({ message: " request must have params" });
      }
      const { error, value } = schema.validate(params, { convert: true });
      if (error) {
        logger.error(`validation query : ${error.details[0].message}`);
        console.log(`validation body :  ${error.details[0].message}`);
        return next(new AppError(error.details[0].message, 400));
      }
      req.filter = value; // شامل type و count
      return next();
    };
  } else if (item === "allOtp") {
    return function (req, res, next) {
      const params = req.query;

      if (!params) {
        return res.status(400).json({ message: " request must have params" });
      }
      const { error, value } = schema.validate(params, { convert: true });
      if (error) {
        logger.error(`validation query : ${error.details[0].message}`);
        console.log(`validation body :  ${error.details[0].message}`);
        return next(new AppError(error.details[0].message, 400));
      }
      req.filter = value; // شامل type و count
      return next();
    };
  } else if (item === "allSeats") {
    return function (req, res, next) {
      const params = req.query;

      if (!params) {
        return res.status(400).json({ message: " request must have params" });
      }
      const { error, value } = schema.validate(params, { convert: true });
      if (error) {
        logger.error(`validation query : ${error.details[0].message}`);
        console.log(`validation body :  ${error.details[0].message}`);
        return next(new AppError(error.details[0].message, 400));
      }
      req.filter = value; // شامل type و count
      return next();
    };
  } else if (item === "generateSeats") {
    return function (req, res, next) {
      const body = req.body;

      if (!body) {
        return res.status(400).json({ message: " request must have body" });
      }
      const { error, value } = schema.validate(body, { convert: true });
      if (error) {
        logger.error(`validation query : ${error.details[0].message}`);
        console.log(`validation body :  ${error.details[0].message}`);
        return next(new AppError(error.details[0].message, 400));
      }
      req.body = value; // شامل type و count
      return next();
    };
  } else if (item === "cancelTicket") {
    return function (req, res, next) {
      const params = req.params;

      if (!params) {
        return res.status(400).json({ message: " request must have body" });
      }
      const { error, value } = schema.validate(params, { convert: true });
      if (error) {
        logger.error(`validation query : ${error.details[0].message}`);
        console.log(`validation body :  ${error.details[0].message}`);
        return next(new AppError(error.details[0].message, 400));
      }
      req.params = value; // شامل type و count
      return next();
    };
  }
  else if (item === "update_setting") {
    return function (req, res, next) {
      const body = req.body;

      if (!body) {
        return res.status(400).json({ message: " request must have body" });
      }
      const { error, value } = schema.validate(body, { convert: true });
      if (error) {
        logger.error(`validation query : ${error.details[0].message}`);
        console.log(`validation body :  ${error.details[0].message}`);
        return next(new AppError(error.details[0].message, 400));
      }
      req.body = value; // شامل type و count
      return next();
    };
  }
}

module.exports = checkbody_query;
