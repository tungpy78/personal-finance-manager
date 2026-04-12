import type { Request, Response, NextFunction } from "express";
import { AuthService } from "../../core/services/auth.service.js";
import AppResponse from "../../utils/AppResponse.js";

export class AuthController{
    static async register(req: Request, res: Response, next: NextFunction){
        try {
            const result = await AuthService.registerUser(req.body);
            return AppResponse.success(res, result, 'Đăng ký tài khoản thành công!', 201);
        } catch (error) {
            next(error);
        }
    }

    static async login(req: Request, res: Response, next: NextFunction){
        try {
            const result = await AuthService.loginUser(req.body);
            return AppResponse.success(res, result, 'Đăng nhập tài khoản thành công!', 200);
        } catch (error) {
            next(error);
        }
    }
}