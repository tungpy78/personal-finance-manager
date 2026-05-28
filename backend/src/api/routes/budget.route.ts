import { Router } from 'express';
import { BudgetController } from '../controllers/budget.controller.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { UpsertBudgetSchema } from '../../core/dtos/budget.dto.js';

const budgetRouter = Router();

// API: POST /api/budgets
budgetRouter.post(
  '/', 
  protect, 
  validate(UpsertBudgetSchema), 
  BudgetController.setupBudget
);

budgetRouter.get(
  '/progress',
  protect,
  BudgetController.getBudgetProgress
);

budgetRouter.get(
  '/total',
  protect,
  BudgetController.getTotalAmount
);

export default budgetRouter;