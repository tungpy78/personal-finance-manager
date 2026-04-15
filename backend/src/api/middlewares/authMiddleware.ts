import type { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import AppResponse from "../../utils/AppResponse.js";

export interface AuthRequest extends Request {
  user?: any; 
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }

    if(!token){
        return AppResponse.error(res, 'Vui lòng đăng nhập để truy cập!', 401);
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

        req.user = decoded;
        next();
    } catch (error) {
        return AppResponse.error(res, 'Token không hợp lệ hoặc đã hết hạn!', 401);
    }
}