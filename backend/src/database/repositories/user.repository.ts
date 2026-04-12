import User from "../models/User.js"

export interface IUserCreate {
  username: string;
  email: string;
  password: string;
}

export class UserRepository{
    static async findByEmail(email:string) {
        return await User.findOne({where:{email}})
    }
    static async create(userData: IUserCreate) {
    return await User.create(userData as any);
  }
}