import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { CreateTransactionSchema } from '../../core/dtos/transaction.dto.js';

const transactionRouter = Router();

transactionRouter.post(
  '/', 
  protect, 
  validate(CreateTransactionSchema), 
  TransactionController.create
);

export default transactionRouter;