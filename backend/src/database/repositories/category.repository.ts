import { Op } from "sequelize";
import Category from "../models/Category.js";
import Transaction from "../models/Transaction.js";

export class CategoryRepository {

    static async findByPk(categoryId: number) {
        const category = await Category.findByPk(categoryId);
        return category ? category.get({ plain: true }) : null;
    }

    static async findAll(filters: { keyword?: string | undefined, type?: string | undefined }) {
        const where: any = {};
        if (filters.keyword) {
            where.name = { [Op.like]: `%${filters.keyword}%` };
        }
        if (filters.type) {
            where.type = filters.type;
        }

        const categories = await Category.findAll({ 
            where,
            order: [['createdAt', 'DESC']]
        });
        return categories.map(c => c.get({ plain: true }));
    }

    static async findOneByNameAndType(name: string, type: string) {
        const category = await Category.findOne({ where: { name, type } });
        return category ? category.get({ plain: true }) : null;
    }

    static async create(data: any) {
        const category = await Category.create(data);
        return category.get({ plain: true });
    }

    static async update(id: number, data: any) {
        await Category.update(data, { where: { id } });
        return this.findByPk(id);
    }

    static async delete(id: number) {
        return await Category.destroy({ where: { id } });
    }

    static async isCategoryUsed(categoryId: number): Promise<boolean> {
        const count = await Transaction.count({ where: { categoryId } });
        return count > 0;
    }
}