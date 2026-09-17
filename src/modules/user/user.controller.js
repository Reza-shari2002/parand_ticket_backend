const userService = require("./user.service");

async function completeProfile_controller(req, res, next) {
  try {
    const userId = req.user.id; // از JWT
    const user = await userService.completeProfile_service(userId, req.body);

    return res.status(200).json({
      success: true,
      message: "اطلاعات با موفقیت ثبت شد.",
      data: { user },
    });
  } catch (err) {
    next(err);
  }
}


async function getProfile_controller(req, res, next) {
  try {
    const userId = req.user.id; // برگرفته از توکن لاگین

    const user = await userService.getProfile_service(userId);

    return res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { completeProfile_controller , getProfile_controller };

