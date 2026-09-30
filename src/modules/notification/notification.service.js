const AppError = require("../../config/AppErrore");
const SendNotificationApi = require("./integration/SendNotificationApiKavenegar");
const SendotpLookupApi = require("./integration/SendlookupKavehnegar");
const logger = require("../../config/logger");

function MakeMessage_third_party(data) {
  const {
    payment_type,
    date,
    full_name,
    car_name,
    total_cost,
    precome,
    cost_of_rate,
    count_of_rate,
  } = data;

  const normalizedPaymentType = String(payment_type);
  const formattedDate = new Date(date).toLocaleDateString("fa-IR");
  const formattedTotalCost = Number(total_cost).toLocaleString("fa-IR");
  const formattedPrecome = Number(precome).toLocaleString("fa-IR");
  const formattedCostOfRate = Number(cost_of_rate).toLocaleString("fa-IR");

  if (normalizedPaymentType === "1") {
    return `کاربر گرامی
 ${full_name}، بیمه نامه خودرو ${car_name} به مبلغ ${formattedTotalCost} ریال به صورت اقساط با پیش پرداخت ${formattedPrecome} ریال و اقساط ماهانه ${formattedCostOfRate} ریال به تعداد ${count_of_rate} قسط در تاریخ ${formattedDate} برای شما ثبت گردید. جهت پرداخت نهایی به قسمت فروشگاه ،بخش پرداخت حق بیمه مراجعه کنید

با تشکر
 اپلیکیشن پرند`;
  }

  if (normalizedPaymentType === "0") {
    return `کاربر گرامی
 ${full_name}، بیمه نامه خودرو ${car_name} به مبلغ ${formattedTotalCost} ریال به صورت نقد در تاریخ ${formattedDate} برای شما ثبت گردید.
جهت پرداخت نهایی به قسمت فروشگاه ،بخش پرداخت حق بیمه مراجعه کنید.

با تشکر
 اپلیکیشن پرند`;
  }

  return "";
}

async function SendNotification_submit_third_party(data) {
  const message = MakeMessage_third_party(data);

  const response = await SendNotificationApi([message], [data.phone_number]);

  return response;
}

async function SendNotification_first_message_third_party(data) {
  const message1 = `کاربر گرامی 
  درخواست شما ثبت گردید لطفا منتظر تماس از طرف پشتیبان اپلیکیشن پرند باشید`;
  const message2 = `پشتیبان گرامی
شخصی به نام ${data.full_name} جهت بیمه شخص ثالث اطلاعات خود را ثبت کرد ، لطفا پنل را چک کنید`;

  const response = await SendNotificationApi(
    [message1, message2, message2, message2, message2],
    [
      data.phone_number,
      "09166082219",
      "09001052444",
      "09165246694",
      "09029082442",
    ],
  );

  return response;
}

async function sendOtplookup(phone_number, otpcode) {
  try {
    const result = await SendotpLookupApi(phone_number, otpcode);
    return result;
  } catch (err) {
    logger.error("500", { message: err.message });
    throw new AppError("can not send otp notif", 500);
  }
}

async function sendOtpsendarray(phone_number, otpcode) {
  const message = `به اولین مسابقات پلی استیشن پرند کاپ خوش امدید
کد ورود ${otpcode}`;

  const response = await SendNotificationApi([message], [phone_number]);
}

module.exports.SendNotification_submit_third_party =
  SendNotification_submit_third_party;
module.exports.SendNotification_first_message_third_party =
  SendNotification_first_message_third_party;
module.exports.sendOtplookup = sendOtplookup;
