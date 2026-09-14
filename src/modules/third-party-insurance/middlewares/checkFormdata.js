const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 6 * 1024 * 1024, 
    files: 10, 
    fields: 30, 
  },
});

const uploadInsuranceDocuments = upload.fields([
  { name: "national_id_image_url", maxCount: 1 },
  { name: "car_card_image_front_url", maxCount: 1 },
  { name: "car_card_image_back_url", maxCount: 1 },
  { name: "green_paper_image_url", maxCount: 1 },
  { name: "prev_insurance_image_url", maxCount: 1 },
  { name: "plate_history_image_url", maxCount: 1 },
  { name: "endorsement_image_url", maxCount: 1 },
  { name: "relationship_docs1_image_person1_url", maxCount: 1 },
  { name: "relationship_docs2_image_person1_url", maxCount: 1 },
  { name: "relationship_docs1_image_person2_url", maxCount: 1 },
  { name: "relationship_docs2_image_person2_url", maxCount: 1 },
]);

module.exports = uploadInsuranceDocuments;
