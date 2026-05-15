import { Router } from "express";
import authRouter from "./auth.route.js";
import transactionRouter from "./transaction.route.js";
import categoryRouter from "./category.route.js";

const rootRouter = Router();

rootRouter.use('/auth', authRouter);
rootRouter.use('/transactions', transactionRouter);
rootRouter.use('/categories', categoryRouter);


export default rootRouter;