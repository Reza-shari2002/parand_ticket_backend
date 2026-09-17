const express = require('express');
const third_party_insurance_router = require('../modules/third-party-insurance/third-party.routes');
const notification_router = require('../modules/notification/notification.routes');
const login_router = require('../modules/login/login.routes');
const authRouter = require('../modules/auth/auth.routes');
const seatsRouter = require("../modules/seats/seats.routes")
const ticketRouter = require("../modules/tickets/tickets.routes")
const paymentRouter = require("../modules/payment/payment.routes");
const userRouter = require("../modules/user/user.routes");
const AdminRouter = require("../modules/admin/admin.routes");
const router  = express.Router()


//router.use("/login", login_router);

//router.use("/third-party-insurance/forms", third_party_insurance_router);

//router.use("/notification", notification_router);

router.use("/auth"  , authRouter);

router.use("/seats" ,seatsRouter );

router.use("/tickets" , ticketRouter );

router.use("/payment" ,  paymentRouter);

router.use("/user" , userRouter);

router.use("/admin" , AdminRouter);

module.exports = router;
