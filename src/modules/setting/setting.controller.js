const settingService = require("./setting.service");

async function capacity_controller(req, res, next) {
  try {
    const result = await settingService.updateSettings_service(req.body);

    return res.status(200).json({
      message: "تنظیمات با موفقیت بروزرسانی شد",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

async function getSettingsPublic_controller(req, res, next) {
  try {
    const data = await settingService.getSettingsPublic_service();

    return res.status(200).json({
      data,
    });
  } catch (error) {
    return next(error);
  }
}
module.exports = {
  capacity_controller,
  getSettingsPublic_controller,
};
