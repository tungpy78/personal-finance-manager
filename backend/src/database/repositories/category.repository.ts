import Category from "../models/Category.js";

export class CategoryRepository {

    static async findByPk(transactionId : number){
        const category = await Category.findByPk(transactionId);

        return category?.toJSON();
    }
}