const settingRepo = require("../../setting/setting.reposetory"); 
const AppError = require("../../../config/AppErrore");

const TYPE_CONFIG = {
  vip: {
    activeField: "is_vip_active",
    messageField: "vip_message",
    defaultMessage: "فروش بلیت VIP در حال حاضر غیرفعال است",
  },
  regular: {
    activeField: "is_regular_active",
    messageField: "regular_message",
    defaultMessage: "فروش بلیت عادی در حال حاضر غیرفعال است",
  },
  gamer: {
    activeField: "is_gamer_active",
    messageField: "gamer_message",
    defaultMessage: "فروش بلیت گیمر در حال حاضر غیرفعال است",
  },
};

async function checkTicketAvailability(req, res, next) {
  try {
    const { type } = req.ticketData || {};

    if (!type || !TYPE_CONFIG[type]) {
      return next(new AppError("نوع بلیت نامعتبر است", 400));
    }

    const settings = await settingRepo.getSettingsDirect();

    if (!settings) {
      return next(new AppError("تنظیمات سیستم در دسترس نیست", 500));
    }

    const { activeField, messageField, defaultMessage } = TYPE_CONFIG[type];

    const isActive = Boolean(settings[activeField]);
    const customMessage = settings[messageField];

    if (!isActive) {
      const errorMessage = customMessage && customMessage.trim() !== "" 
        ? customMessage 
        : defaultMessage;

      return next(new AppError(errorMessage, 400));
    }

    return next();
  } catch (error) {
    return next(new AppError(error.message , 500));
  }
}

module.exports = checkTicketAvailability;