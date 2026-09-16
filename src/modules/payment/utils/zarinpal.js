const axios = require("axios");



const MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID || "40000000-0000-0000-0000-000000000000";
const IS_SANDBOX = process.env.ZARINPAL_SANDBOX === "true";

const BASE_URL = IS_SANDBOX
  ? "https://sandbox.zarinpal.com/pg/v4/payment"
  : "https://api.zarinpal.com/pg/v4/payment";

const GATEWAY_URL = IS_SANDBOX
  ? "https://sandbox.zarinpal.com/pg/StartPay"
  : "https://www.zarinpal.com/pg/StartPay";

async function requestPayment({ amount, description, callbackUrl, mobile, email }) {
  const url = `${BASE_URL}/request.json`;

  const formattedAmount = Math.floor(Number(amount));

  const mobileStr = mobile === undefined || mobile === null ? "" : String(mobile);
  const emailStr = email === undefined || email === null ? "" : String(email);

  const payload = {
    merchant_id: MERCHANT_ID,
    amount: formattedAmount,
    description: description || "خرید بلیط پرند کاپ",
    callback_url: callbackUrl,
    metadata: {
      mobile: mobileStr,
      email: emailStr
    }
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      timeout: 10000
    });

    const data = response.data.data;
    const errors = response.data.errors;

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
  const payload = {
    merchant_id: MERCHANT_ID,
    authority,
    amount: Number(amount)
  };

  const response = await axios.post(url, payload, { timeout: 10000 });
  const data = response.data.data;
  const errors = response.data.errors;

  // کد 100: موفق / کد 101: قبلاً وریفای شده
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
    code: errors?.code || data?.code
  };
}

module.exports = {
  requestPayment,
  verifyPayment
};
