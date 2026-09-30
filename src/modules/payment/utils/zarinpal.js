const axios = require("axios");

const MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID || "40000000-0000-0000-0000-000000000000";
const IS_SANDBOX = process.env.ZARINPAL_SANDBOX === "true";

const BASE_URL = IS_SANDBOX
  ? "https://sandbox.zarinpal.com/pg/v4/payment"
  : "https://api.zarinpal.com/pg/v4/payment";

const GATEWAY_URL = IS_SANDBOX
  ? "https://sandbox.zarinpal.com/pg/StartPay"
  : "https://www.zarinpal.com/pg/StartPay";

// درخواست ایجاد تراکنش
async function requestPayment({ amount, description, callbackUrl, mobile, email }) {
  const url = `${BASE_URL}/request.json`;
  const formattedAmount = Math.floor(Number(amount));

  // آماده‌سازی metadata: فیلدهای خالی را نباید بفرستیم
  const metadata = {};
  if (mobile && String(mobile).trim()) {
    metadata.mobile = String(mobile).trim();
  }
  if (email && String(email).trim()) {
    metadata.email = String(email).trim();
  }

  const payload = {
    merchant_id: MERCHANT_ID,
    amount: formattedAmount,
    description: description || "خرید بلیط پرند کاپ",
    callback_url: callbackUrl,
    ...(Object.keys(metadata).length > 0 && { metadata }) // فقط در صورت وجود مقادیر ارسال می‌شود
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      timeout: 10000
    });

    const data = response.data?.data;
    const errors = response.data?.errors;

    if (errors && Object.keys(errors).length > 0) {
      console.error("Zarinpal API Errors Payload:", errors);
      throw new Error(`Zarinpal Error: ${JSON.stringify(errors)}`);
    }

    if (data && (data.code === 100 || data.code === 101)) {
      return {
        authority: data.authority,
        paymentUrl: `${GATEWAY_URL}/${data.authority}`
      };
    }

    throw new Error(`Zarinpal returned code: ${data?.code}`);
  } catch (error) {
    if (error.response) {
      console.error("Zarinpal 422 Details:", JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

// تایید تراکنش پس از بازگشت کاربر
async function verifyPayment({ authority, amount }) {
  const url = `${BASE_URL}/verify.json`;
  const formattedAmount = Math.floor(Number(amount));

  const payload = {
    merchant_id: MERCHANT_ID,
    authority,
    amount: formattedAmount
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      timeout: 10000
    });

    const data = response.data?.data;
    const errors = response.data?.errors;

    if (data && (data.code === 100 || data.code === 101)) {
      return {
        success: true,
        refId: data.ref_id,
        cardPan: data.card_pan,
        alreadyVerified: data.code === 101
      };
    }

    return {
      success: false,
      code: errors?.code || data?.code || -1
    };
  } catch (error) {
    return {
      success: false,
      code: error.response?.data?.errors?.code || 500
    };
  }
}

module.exports = {
  requestPayment,
  verifyPayment
};
