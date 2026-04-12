import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validateMiddleware.js'; // Import vệ binh
import { RegisterSchema } from '../../core/dtos/auth.dto.js'; // Import khuôn mẫu

const authRouter = Router();

// Gắn vệ binh `validate` đứng gác trước cổng `AuthController`
authRouter.post('/register', validate(RegisterSchema), AuthController.register);

export default authRouter;