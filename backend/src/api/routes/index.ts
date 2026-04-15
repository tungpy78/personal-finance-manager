import { Router } from "express";
import authRouter from "./auth.route.js";
import transactionRouter from "./transaction.route.js";

const rootRouter = Router();

rootRouter.use('/auth', authRouter);

rootRouter.use('/transactions', transactionRouter);


export default rootRouter;