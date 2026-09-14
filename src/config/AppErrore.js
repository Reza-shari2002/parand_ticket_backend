class AppError extends Error {
  constructor(message, statuscode) {
    super(message);

    this.statuscode = statuscode;
    this.status = statuscode >= 400 && statuscode < 500 ? "fail" : "error";
  }
}

module.exports = AppError;
