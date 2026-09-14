const reposetory = require('../third-party.reposetory');

async function checkPermission (req, res, next) {
      const id = Number(req.params.form_id);

      if (Number.isNaN(id)) {
        next(new AppError("id must be number", 400));
        return;
      }
      try {
        const users_form = await reposetory.find_user_data(id);
        req.user = users_form;

        return next();
      } catch (err) {
        next(err);
      }
    };
    module.exports = checkPermission;