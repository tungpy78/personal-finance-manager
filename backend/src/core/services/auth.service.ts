import bcrypt from "bcryptjs";
import { UserRepository } from "../../database/repositories/user.repository.js";
import ApiError from "../../utils/ErrorClass.js";
import type { LoginDTO, RegisterDTO } from "../dtos/auth.dto.js";
import jwt from 'jsonwebtoken';

export class AuthService{
    static async registerUser(data: RegisterDTO){

        const existingUser = await UserRepository.findByEmail(data.email);

        if(existingUser){
            throw new ApiError("Email này đã được sử dụng!", 400);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.password, salt);

        const newUser = await UserRepository.create({
            username: data.username,
            email: data.email,
            password: hashedPassword
        });

        return{
            id: newUser.id,
            username: newUser.username,
            email: newUser.email
        };

    }

    static async loginUser(data: LoginDTO): Promise<{
        user: { id: number; username: string; email: string };
        accessToken: string;
    }> {
        const user = await UserRepository.findByEmail(data.email);
        if(!user){
            throw new ApiError('Tài khoản không tồn tại!', 404);
        }

        const isMatch = await bcrypt.compare(data.password, user.password);
        if(!isMatch){
            throw new ApiError('Mật khẩu không chính xác!', 401);
        }

        const token = jwt.sign(
            {id: user.id, username: user.username},
            process.env.JWT_SECRET as string,
            {expiresIn: process.env.JWT_EXPIRES_IN as any}
        );

        return {
            user:{ id: user.id , username: user.username, email: user.email },
            accessToken: token
        };
    }
}