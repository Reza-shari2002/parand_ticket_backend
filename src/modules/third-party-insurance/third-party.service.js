const AppError = require("../../config/AppErrore");
const reposetory = require("./third-party.reposetory");
const notificationService = require("../notification/notification.service");
const logger = require("../../config/logger");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const FileType = require("file-type");







async function formDetail(user_data) {
  try {
    const formData =
      typeof user_data?.toJSON === "function"
        ? user_data.toJSON()
        : { ...user_data};

    const fileFields = [
      "national_id_image_url",
      "car_card_image_front_url",
      "car_card_image_back_url",
      "green_paper_image_url",
      "prev_insurance_image_url",
      "plate_history_image_url",
      "endorsement_image_url",
      "relationship_docs1_image_person1_url",
      "relationship_docs2_image_person1_url",
      "relationship_docs1_image_person2_url",
      "relationship_docs2_image_person2_url",
    ];

    for (const field of fileFields) {
      const filePath = formData[field];

      if (filePath) {
        formData[field] = `/third-party-insurance/forms/view?path=${encodeURIComponent(filePath)}`;
      }
    }

    return formData;

  } catch (error) {
    throw(error);
  }
}






async function saveInsuranceFiles(data) {
  try {
    const requiredFiles = data.requiredFiles || [];
    const files = data.files;

    const baseDir = path.join(
      process.cwd(),
      "storage",
      "private",
      "insurance-documents",
    );

    await fs.promises.mkdir(baseDir, { recursive: true });

    const savedFiles = {};

    for (const fieldName of requiredFiles) {
      const file = files?.[fieldName]?.[0];

      if (!file) continue;

      const type = await FileType.fromBuffer(file.buffer);

      if (!type) {
        throw new AppError(`Invalid file type for field ${fieldName}`, 400);
      }

      const randomName = crypto.randomBytes(16).toString("hex");
      const fileName = `${randomName }.${type.ext}`;
      const absolutePath = path.join(baseDir, fileName);

      await fs.promises.writeFile(absolutePath, file.buffer);

      savedFiles[fieldName] = `insurance-documents/${fileName}`;
    }

    return savedFiles;
  } catch (error) {
    console.log(error.message);

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("server error", 500);
  }
}







async function savedocument(req) {
  try {
    const savedFiles = await saveInsuranceFiles(req);
    const result = await reposetory.insertForm(savedFiles, req.body);
    console.log("upload on db done");
    logger.info("upload on db done", {
      ip: req.ip,
      message: "upload on db done",
    });
    const response = await notificationService.SendNotification_first_message_third_party(req.body)
    logger.info("sent sms done", { ip: req.ip, message: "sms done" });
    return;
  } catch (err) {
    logger.error("500", { message: err.message });
    throw new AppError("server error", 500);
  }
}





async function getSafePrivateFilePath(query) {
try {
    const { path: filepath } = query;

    if (!filepath) {
      throw (new AppError("مسیر فایل الزامی است", 400));
    }

    const normalizedPath = filepath.replace(/\\/g, "/");
    const baseDir = path.join(process.cwd(), "storage", "private");
    const mainpath = path.resolve(baseDir, normalizedPath);

    if (!mainpath.startsWith(baseDir + path.sep) && mainpath !== baseDir) {
      throw (new AppError("دسترسی غیرمجاز به فایل", 403));
    }

    if (!fs.existsSync(mainpath)) {
      throw (new AppError("فایل مورد نظر یافت نشد", 404));
    }

    return mainpath;
  } catch (error) {
    throw(error);
  }
}


async function Finde_page_number(per_page) {
    try{
            const total_forms = await reposetory.find_records_number();
            
            const pageCount = Math.max(1,Math.ceil(total_forms/per_page));
            return pageCount;
    }
    catch(err){
 throw(err);
    }
}



async function Car_insurance_query_row (query){
    try{
        const page_count = await Finde_page_number(query.limit);
        const offset = (query.page - 1 ) * query.limit;
        const limit = query.limit;
        const data  = await reposetory.finde_query_record(limit,offset);
        return {data:data , page_count:page_count};

    }
    catch(err){
        throw err;
    }


}



async function filter_forms(filter) {
    try{
        const allData = await reposetory.find_users_data();
        const filteredRows = allData.filter((item)=>{
            const  flag_phone = filter.phone?item.phone_number?.includes(filter.phone):true;
            const flage_fullName = filter.fullName?item.full_name?.includes(filter.fullName):true;

            return flag_phone && flage_fullName;
        })
        const page_count = Math.max(1,Math.ceil(filteredRows.length/7));

        return {data:filteredRows , page_count:page_count};
    }
    catch(err){
        throw err;
    }
}


module.exports.formDetail= formDetail;
module.exports.savedocument = savedocument;
module.exports.getSafePrivateFilePath = getSafePrivateFilePath;
module.exports.Car_insurance_query_row = Car_insurance_query_row;
module.exports.filter_forms = filter_forms;
