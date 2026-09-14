const Services = require("./third-party.service");
const AppError = require("../../config/AppErrore");
const logger = require("../../config/logger");
const reposetory = require('./third-party.reposetory');
async function users_form(req, res, next) {
  try {
    const data = await reposetory.find_users_data();
    res.status(200).json({ data: data });
  } catch (err) {
    next(err);
  }
}

async function user_form(req,res,next) {
  try{
    const data = await Services.formDetail(req.user);
    res.status(200).json({
      status: "success",
      data: data,
    })
  }
  catch(err){
    next(new AppError("server error" , 500));
  }
}


async function save_data(req, res, next) {
  try {
    const result = await Services.savedocument(req);
    logger.info("done upload", {
      ip: req.ip,
      message: "uplodad document",
      phone_number: req?.body?.phone_number,
    });
    res
      .status(200)
      .json({
        message:
          "اطلاعات شما ارسال شد . منتظر تماس پشتیبان  جهت اعلام قیمت باشید...",
      });
  } catch (err) {
    next(new AppError("server error", 500));
  }
}



async function viewInsuranceImage(req, res, next) {
  try {
    const mainpath = await Services.getSafePrivateFilePath(req.query);

    res.sendFile(mainpath);
  } catch (error) {
    next(error);
  }
}

async function  users_form_query(req,res,next) {
    try{
        const {data , page_count} =  await Services.Car_insurance_query_row(req.validatedQuery);
        res.status(200).json({data:data , page_count:page_count});
    }
    catch(err){
        next(err);
    }
}


async function  filter_forms_controller(req,res,next) {
    try{
        const data = await Services.filter_forms(req.filter);
        res.status(200).json({data:data.data , page_count:data.page_count});
        console.log(data);

    }
    catch(err){
        return next(err);
    }
}




module.exports.users_form = users_form;
module.exports.user_form = user_form;
module.exports.save_data = save_data;
module.exports.viewInsuranceImage = viewInsuranceImage;
module.exports.users_form_query = users_form_query;
module.exports.filter_forms_controller = filter_forms_controller;