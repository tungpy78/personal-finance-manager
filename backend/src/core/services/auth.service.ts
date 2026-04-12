import bcrypt from "bcryptjs";
import { UserRepository } from "../../database/repositories/user.repository.js";
import ApiError from "../../utils/ErrorClass.js";
import type { RegisterDTO } from "../dtos/auth.dto.js";

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
}