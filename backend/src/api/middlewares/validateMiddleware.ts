import type { ZodSchema } from 'zod/v3';
import AppResponse from '../../utils/AppResponse.js';
import type { Request, Response, NextFunction } from "express";

// Đây là một "Hàm tạo Middleware" (Higher-Order Function)
export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Ép req.body phải tuân thủ đúng cái schema truyền vào
      req.body = await schema.parseAsync(req.body);
      next(); // Dữ liệu chuẩn -> Mở cổng cho đi tiếp vào Controller
    } catch (error: any) {
      // Dữ liệu sai -> Chặn lại và báo lỗi ngay lập tức
      const errorMessage = error.errors.map((e: any) => e.message).join(', ');
      return AppResponse.error(res, errorMessage, 400);
    }
  };
};