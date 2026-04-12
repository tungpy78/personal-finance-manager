// src/middlewares/errorMiddleware.ts
// src/middlewares/errorMiddleware.ts
import type { Request, Response, NextFunction } from 'express';
import AppResponse from '../../utils/AppResponse.js';

const errorHandlingMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    
    // Log lỗi ra console để dev fix (nhưng không gửi chi tiết cho user xem)
    console.error("🔥 ERROR LOG:", err);

    // Mặc định là lỗi 500 nếu không xác định được
    let message = err.message || 'Lỗi hệ thống máy chủ';
    let statusCode = err.statusCode || 500;

    // Ví dụ: Bắt lỗi của thư viện JWT
    if (err.name === 'JsonWebTokenError') {
        message = 'Token không hợp lệ';
        statusCode = 401;
    }

    // Dùng AppResponse để trả về lỗi theo format chuẩn
    return AppResponse.error(res, message, statusCode);
};

export default errorHandlingMiddleware;