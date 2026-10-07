const AppError = require("../../config/AppErrore");
const SendNotificationApi = require("./integration/SendNotificationApiKavenegar");
const SendotpLookupApi = require("./integration/SendlookupKavehnegar");
const SendOtpBaleApi = require("./integration/SendOtpBaleApi");
const ticketsRepo = require("../tickets/tickets.reposetory");
const settingRepo = require("../setting/setting.reposetory");
const logger = require("../../config/logger");
const moment = require("jalali-moment");

/**
 * تبدیل تاریخ میلادی دیتابیس به تاریخ شمسی فارسی (مثال: ۲۷ مهر ۱۴۰۵)
 */
function formatJalaliDate(dateTimeStr) {
  if (!dateTimeStr) return "-";
  try {
    return moment(dateTimeStr).locale("fa").format("D MMMM YYYY");
  } catch {
    return "-";
  }
}

/**
 * محاسبه زمان حضور اختصاصی گیمر بر اساس شماره صندلی
 */
function calculateGamerSeatTime(seatNumber) {
  const seat = Number(seatNumber);
  if (!seat || isNaN(seat)) return "۱۹:۱۵";
  if (seat > 64) return "در حال رزرو";

  const groupIndex = Math.floor((seat - 1) / 14);
  const totalMinutes = 19 * 60 + 15 + groupIndex * 30;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");

  return `${formattedHours}:${formattedMinutes}`;
}

/**
 * استخراج صندلی‌ها و اتصال آنها با خط تیره (مثال: 1 - 2 - 3)
 */
function formatSeatsText(seats) {
  if (!seats || !seats.length) return "-";

  const seatNumbers = seats
    .map((s) => (typeof s === "object" ? s?.seat_number : s))
    .filter(Boolean);

  if (!seatNumbers.length) return "-";

  return seatNumbers.join(" - ");
}

/**
 * ساخت متن پیامک بر اساس تیپ بلیت
 */
function makeMessage(ticketData, settings = {}) {
  const type = ticketData.type;
  const greeting = "کاربر گرامی";

  const location = settings[`${type}_location`] || "-";
  const rawDate = settings[`${type}_event_date`];
  const dateText = formatJalaliDate(rawDate);

  // ۱. پیام اختصاصی گیمر
  if (type === "gamer") {
    const rawSeat = ticketData.seats?.[0];
    const seatNumber = typeof rawSeat === "object" ? rawSeat?.seat_number : rawSeat || "-";
    const gamerTurnTime = calculateGamerSeatTime(seatNumber);

    return `${greeting}

به اولین دوره مسابقات پرند کاپ خوش آمدید.

${dateText}
ساعت: ${gamerTurnTime}
مکان: ${location}
شماره صندلی: ${seatNumber}

لطفاً ۱۵ دقیقه پیش از شروع مسابقه در محل حضور داشته باشید.

برای شما آرزوی موفقیت و لحظاتی هیجان‌انگیز داریم.

اپلیکیشن پرند
پلتفرم حرفه‌ای جوانان`;
  }

  // ۲. صندلی‌ها برای VIP و Regular
  const seatsText = formatSeatsText(ticketData.seats);

  // ۳. پیام اختصاصی VIP
  if (type === "vip") {
    return `${greeting}

بلیط VIP شما برای تماشای اولین تورنمنت پلی‌استیشن خوزستان (پرند کاپ) صادر شد.

📅 تاریخ: ${dateText}
🕖 ساعت: ۱۹:۰۰ الی ۲۲:۰۰
📍 مکان: ${location}
🎫 شماره صندلی: ${seatsText}

حضور شما موجب افتخار ماست.
منتظر دیدار شما در این رویداد ویژه و هیجان‌انگیز هستیم.

اپلیکیشن پرند
پلتفرم حرفه‌ای جوانان`;
  }

  // ۴. پیام اختصاصی تماشاچی عادی (Regular)
  return `${greeting}

بلیط شما برای تماشای اولین تورنمنت پلی‌استیشن خوزستان (پرند کاپ) صادر شد.

📅 تاریخ: ${dateText}
🕖 ساعت: ۱۹:۰۰ الی ۲۲:۰۰
📍 مکان: ${location}
🎫 شماره صندلی: ${seatsText}

منتظر حضور شما در این رویداد هیجان‌انگیز هستیم.

اپلیکیشن پرند
پلتفرم حرفه‌ای جوانان`;
}

/**
 * دریافت اطلاعات بلیت و ساخت پیامک نهایی برای ارسال بعد از تایید پرداخت
 */
async function Makemessage_submitPayment(ticketId) {
  const ticket = await ticketsRepo.getTicketById(ticketId);

  if (!ticket) {
    throw new AppError("بلیط مورد نظر یافت نشد.", 404);
  }

  const seats = await ticketsRepo.getSeatsByTicketId(ticketId);

  const ticketData = {
    id: ticket.id,
    ticketCode: ticket.ticket_code,
    type: ticket.type,
    quantity: ticket.quantity,
    totalAmount: ticket.total_amount,
    status: ticket.status,
    seats: (seats || []).map((s) => s.seat_number),
    createdAt: ticket.created_at,
    user: {
      id: ticket.user_id,
      phone: ticket.phone,
      fullName: ticket.full_name,
      nationalCode: ticket.national_code,
    },
  };

  const settings = await settingRepo.getSettingsDirect();

  if (!settings) {
    throw new AppError("تنظیمات سیستم در دسترس نیست.", 500);
  }

  // ساخت متن نهایی پیام
  const message = makeMessage(ticketData, settings);

  return {
    phone: ticketData.user.phone,
    message,
    ticketData,
  };
}

async function Submit_payment(ticketId) {
  const {message,phone} = await Makemessage_submitPayment(ticketId);
  console.log(message);
  const response = await SendNotificationApi([message], [phone]);

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


async function sendOtpBale(phone_number, otpcode) {
  try {
    const result = await SendOtpBaleApi(phone_number, otpcode);
    return result;
  } catch (err) {
    logger.error("خطا در سرویس ارسال OTP بله", { message: err.message });
    throw new AppError("ارسال رمز یکبار مصرف از طریق بله ناموفق بود.", 500);
  }
}


module.exports.sendOtplookup = sendOtplookup;
module.exports.Submit_payment = Submit_payment;
module.exports.sendOtpBale= sendOtpBale;
