const FileType = require("file-type");
const AppError = require("../../../config/AppErrore");
const logger = require("../../../config/AppErrore");

function getRequiredFiles(body) {
  const required = ["national_id_image_url"];



  if (body.document_car_type === "0") {
    required.push("car_card_image_front_url", "car_card_image_back_url");
  }
  if (body.document_car_type === "1") {
    required.push("green_paper_image_url");
  }
  if (body.has_discount_transfer === "1") {
    required.push("prev_insurance_image_url");
    if (body.plate_history_type === "1") {
      required.push("plate_history_image_url");
    }
  }
  if (body.has_active_insurance_transfer === "1") {
    required.push("endorsement_image_url");
  }
  if (body.is_relative_transfer === "1") {
    required.push(
      "relationship_docs1_image_person1_url",
      "relationship_docs2_image_person1_url",
      "relationship_docs1_image_person2_url",
      "relationship_docs2_image_person2_url"
    );
  }
  return required;
}

async function validateUploadedFiles(req, res, next) {
  try {
    const requiredFiles = getRequiredFiles(req.body);
    req.requiredFiles = requiredFiles;
    const uploaded = req.files || {};

    const allowedExtensions = ["pdf", "jpg", "jpeg", "png", "webp"];
    const allowedMimes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

    // ۱. بررسی اینکه تمام فایل‌های الزامی حتماً آپلود شده باشند
    for (const field of requiredFiles) {
      const file = uploaded?.[field]?.[0];
      if (!file) {
        logger.warn(`Validation failed: Missing required file field [${field}]`, { ip: req.ip });
        return next(new AppError(`${field} is required`, 400));
      }
    }

    // ۲. بررسی تک‌تک فایل‌های آپلود شده (حتی فایل‌های غیرالزامی فرستاده شده) جهت جلوگیری از فایل‌های مخرب نظیر exe.
    const allUploadedFields = Object.keys(uploaded);
    for (const field of allUploadedFields) {
      const file = uploaded[field]?.[0];
      if (!file) continue;

      // بررسی بافر خالی
      if (!file.buffer || file.buffer.length === 0) {
        return next(new AppError(`Invalid file buffer for field ${field}`, 400));
      }

      // تشخیص نوع واقعی فایل از روی بافر (Magic Number)
      let detectedType;
      try {
        detectedType = await FileType.fromBuffer(file.buffer);
      } catch (err) {
        logger.error(`Error inspecting file buffer: ${err.message}`, { ip: req.ip });
        return next(new AppError(`Unable to process file for field ${field}`, 400));
      }

      // اگر فرمت تشخیص داده نشد یا غیرمجاز بود
      if (
        !detectedType || 
        !allowedExtensions.includes(detectedType.ext.toLowerCase()) ||
        !allowedMimes.includes(detectedType.mime.toLowerCase())
      ) {
        logger.warn(`Security alert: Blocked invalid/malicious file on field [${field}]`, { 
          ip: req.ip,
          detectedExt: detectedType?.ext,
          detectedMime: detectedType?.mime
        });
        return next(new AppError(`فرمت فایل ارسالی در فیلد ${field} غیرمجاز است. تنها فایل‌های تصویر و PDF مجاز هستند.`, 400));
      }
    }

    next();
  } catch (error) {
    logger.error(`Unexpected error in file validation middleware: ${error.message}`, { ip: req.ip });
    next(new AppError("server error", 500));
  }
}

module.exports = validateUploadedFiles;
