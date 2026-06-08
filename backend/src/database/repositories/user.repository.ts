import type { CreationAttributes } from "sequelize";
import User from "../models/User.js"

export type IUserCreate = CreationAttributes<User>;

export class UserRepository{
    static async findByEmail(email:string) {
        return await User.findOne({where:{email}})
    }
    static async create(userData: IUserCreate) {
    const newUser = await User.create(userData as any);

    const plainUser = newUser.toJSON();

    delete plainUser.password;

    return plainUser;
  }
}