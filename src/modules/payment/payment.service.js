const db = require("../../config/db");
const paymentRepo = require("./payment.reposetory");
const ticketsRepo = require("../../modules/tickets/tickets.reposetory");
const { requestPayment, verifyPayment } = require("./utils/zarinpal");
const EXPIRATION_MINUTES = Number(process.env.TICKET_EXPIRATION_MINUTES) || 15;
const AppError = require("../../config/AppErrore");

// ۱. درخواست درگاه پرداخت
async function requestPayment_service(ticketId, userId, userPhone) {
  const ticket = await ticketsRepo.getTicketById(ticketId);

  if (!ticket) {
    throw new AppError("بلیط پیدا نشد.", 404);
  }

  if (ticket.user_id !== userId) {
    throw new AppError("شما دسترسی به این بلیط ندارید.", 403);
  }

  if (ticket.status === "paid") {
    throw new AppError("این بلیط قبلاً پرداخت شده است.", 400);
  }

  if (ticket.status !== "pending") {
    throw new AppError("وضعیت این بلیط معتبر نیست یا منقضی شده است.", 400);
  }

  // بررسی شرط انقضای رزرو بلیط
  const diffMinutes = (Date.now() - new Date(ticket.created_at).getTime()) / (1000 * 60);
  if (diffMinutes > EXPIRATION_MINUTES) {
    throw new AppError(
      `مهلت ${EXPIRATION_MINUTES} دقیقه‌ای پرداخت این رزرو به پایان رسیده است. لطفاً دوباره صندلی رزرو کنید.`,
      400
    );
  }

  // بررسی زنده بودن صندلی‌های رزرو شده
  const activeSeatsCount = await paymentRepo.getActiveSeatsCount(ticketId);
  if (activeSeatsCount === 0) {
    throw new AppError("صندلی‌های رزرو شده شما منقضی یا آزاد شده‌اند.", 400);
  }

  // درخواست اتصال به زرین‌پال
  const { authority, paymentUrl } = await requestPayment({
    amount: ticket.total_amount,
    description: `خرید بلیط مسابقات پرند کاپ - شناسه پیگیری ${ticket.ticket_code}`,
    callbackUrl: process.env.ZARINPAL_CALLBACK_URL,
    mobile: userPhone,
  });

  // ثبت در جدول transactions
  await paymentRepo.createTransactionRecord({
    userId,
    ticketId: ticket.id,
    amount: ticket.total_amount,
    authority,
  });

  // تمدید زمان قفل صندلی‌ها
  await paymentRepo.extendSeatLockTime(ticketId);

  return { paymentUrl };
}

// ۲. پردازش Callback و Verify زرین‌پال
async function handleCallback_service({ authority, status }) {
  if (!authority) {
    return { success: false, message: "شناسه تراکنش (Authority) ارسال نشده است." };
  }

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const transaction = await paymentRepo.getTransactionByAuthority(authority, connection);

    if (!transaction) {
      await connection.rollback();
      return { success: false, message: "تراکنش یافت نشد." };
    }

    // جلوگیری از دوبار پردازش برای تراکنش‌های موفق
    if (transaction.status === "success") {
      await connection.rollback();
      return {
        success: true,
        message: "این تراکنش قبلاً با موفقیت ثبت شده است.",
        ticketId: transaction.ticket_id,
        refId: transaction.ref_id,
      };
    }

    // اگر کاربر در درگاه پرداخت انصراف داد
    if (String(status).toUpperCase() !== "OK") {
      await paymentRepo.markTransactionAsFailed(
        { transactionId: transaction.id, ticketId: transaction.ticket_id },
        connection
      );
      await connection.commit();
      return {
        success: false,
        message: "پرداخت توسط کاربر لغو شد.",
        ticketId: transaction.ticket_id,
      };
    }

    // قفل ردیف بلیط جهت جلوگیری از Race Condition
    const ticket = await paymentRepo.getTicketForPayment(transaction.ticket_id, connection);
    if (!ticket || ticket.status === "paid") {
      await connection.rollback();
      return { success: false, message: "وضعیت بلیط نامعتبر است یا از قبل پرداخت شده." };
    }

    // بررسی وضعیت صندلی‌ها قبل از وریفای نهایی
    const activeSeatsCount = await paymentRepo.getActiveSeatsCount(transaction.ticket_id, connection);

    // اگر صندلی‌ها آزاد شده‌اند، نباید وریفای کنیم (بانک ظرف ۷۲ ساعت پول را برمی‌گرداند)
    if (activeSeatsCount === 0) {
      await paymentRepo.markTransactionAsFailed(
        { transactionId: transaction.id, ticketId: transaction.ticket_id },
        connection
      );
      await connection.commit();

      return {
        success: false,
        message: "مهلت رزرو صندلی‌ها به پایان رسیده است. مبلغ کسر شده توسط بانک به حساب شما عودت داده می‌شود.",
        ticketId: transaction.ticket_id,
      };
    }

    // استعلام و وریفای نهایی از زرین‌پال
    const verifyResult = await verifyPayment({
      authority,
      amount: transaction.amount,
    });

    if (verifyResult.success) {
      // تغییر وضعیت تراکنش به success، بلیط به paid و صندلی‌ها به sold
      await paymentRepo.finalizeSuccessfulTransaction(
        {
          transactionId: transaction.id,
          ticketId: transaction.ticket_id,
          refId: String(verifyResult.refId),
        },
        connection
      );

      await connection.commit();
      return {
        success: true,
        refId: verifyResult.refId,
        ticketId: transaction.ticket_id,
      };
    } else {
      // پاسخ منفی از زرین‌پال
      await paymentRepo.markTransactionAsFailed(
        { transactionId: transaction.id, ticketId: transaction.ticket_id },
        connection
      );
      await connection.commit();
      return {
        success: false,
        message: "تایید پرداخت در شاپرک/زرین‌پال ناموفق بود.",
        ticketId: transaction.ticket_id,
      };
    }
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  requestPayment_service,
  handleCallback_service,
};
