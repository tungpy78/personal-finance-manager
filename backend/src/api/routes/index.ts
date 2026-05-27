import { Router } from "express";
import authRouter from "./auth.route.js";
import transactionRouter from "./transaction.route.js";
import categoryRouter from "./category.route.js";
import budgetRouter from "./budget.route.js";

const rootRouter = Router();

// Gộp chung tất cả các Module của nhóm vào đây
rootRouter.use('/auth', authRouter);
rootRouter.use('/transactions', transactionRouter);
rootRouter.use('/categories', categoryRouter);
rootRouter.use('/budgets', budgetRouter);

export default rootRouter;