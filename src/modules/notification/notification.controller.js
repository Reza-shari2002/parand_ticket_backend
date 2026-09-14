const Services = require('./notification.service')
const AppError = require("../../config/AppErrore");

async function Submit_third_party_insurance(req, res, next) {
  try {
    const response = await Services.SendNotification_submit_third_party(req.body);
    
    res.status(200).json({ message: "موفقیت آمیز بود" });
    return;
  } catch (err) {
    next(new AppError("خطا در ارتباط با سرویس ارسال پیام", 500));
  }
}

module.exports.Submit_third_party_insurance = Submit_third_party_insurance;
