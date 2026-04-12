import type { Request, Response, NextFunction } from "express";

export class AuthController{
    static async register(req: Request, res: Response, next: NextFunction){
        try {
        } catch (error) {
            next(error)
        }
    }
}