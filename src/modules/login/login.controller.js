const Services = require('./login.service'); 

const login = async (req, res, next) => {
    const AccessToken = await Services.login(req.user);
  
  try {
    res.status(200).json({ access_token: AccessToken });
  } catch (err) {
    next(err);
  }
};

module.exports.login = login;
