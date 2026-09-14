const axiosInstance = require("./axiosInstanceKavehnegar");
const logger = require("../../../config/logger");

async function SendNotificationApi(messageTexts, mobiles) {
  try {
    const defaultSender = process.env.KAVENEGAR_SENDER_LINE || "10008566";

    const senders = Array(mobiles.length).fill(defaultSender);

    const params = new URLSearchParams();
    params.append("receptor", JSON.stringify(mobiles));
    params.append("sender", JSON.stringify(senders));
    params.append("message", JSON.stringify(messageTexts));

    const response = await axiosInstance.post("/sendarray.json", params);

    return response.data;
  } catch (error) {
    console.error("Kavenegar API Error:", error);

    logger.error(
      error.response?.data?.return?.message ||
        error.message ||
        "خطا در اتصال به کاوه نگار",
    );
    throw error.response?.data || error.message;
  }
}

module.exports = SendNotificationApi;
