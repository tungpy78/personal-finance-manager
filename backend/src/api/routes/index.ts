import { Router } from "express";
import authRouter from "./auth.route.js";
import transactionRouter from "./transaction.route.js";
import budgetRouter from "./budget.route.js";

const rootRouter = Router();

rootRouter.use('/auth', authRouter);

rootRouter.use('/transactions', transactionRouter);

rootRouter.use('/budgets', budgetRouter);

export default rootRouter;