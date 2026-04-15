import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validateMiddleware.js'; // Import vệ binh
import { LoginSchema, RegisterSchema } from '../../core/dtos/auth.dto.js'; // Import khuôn mẫu

const authRouter = Router();

authRouter.post('/register', validate(RegisterSchema), AuthController.register);
authRouter.post('/login', validate(LoginSchema), AuthController.login);

export default authRouter;