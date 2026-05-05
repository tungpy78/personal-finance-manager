// Import các Model từ file index chứa khai báo quan hệ (Associations) của bạn
import { Budget, Category } from '../models/index.js'; 
import { sequelize } from '../models/index.js'; 

export interface IBudgetPayload {
  userId: number;
  categoryId: number;
  amount: number; 
  month: number;
  year: number;
}

export interface IBudgetProgressPayload {
  userId: number;
  categoryId: number;
  month: number;
  year: number;
}

export class BudgetRepository {
  static async upsertBudget(data: IBudgetPayload) {
    const [budget, created] = await Budget.upsert({
      userId: data.userId,
      categoryId: data.categoryId,
      amount: data.amount,
      month: data.month,
      year: data.year
    });
    return budget.toJSON();
  }

  static async getBudgetByCategory(userId: number, categoryId: number, month: number, year: number) {
    const budget = await Budget.findOne({
      where: { userId, categoryId, month, year }
    });
    return budget ? budget.toJSON() : null;
  }


  static async getBudgetsByMonth(userId: number, month: number, year: number) {
    const budgets = await Budget.findAll({
      where: {
        userId: userId,
        month: month,
        year: year
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'type']
        }
      ]
    });

    return budgets.map(b => b.toJSON());
  }

  static async getSpentAmount(data: IBudgetProgressPayload): Promise<number> {
    const result = await sequelize.query(
      'CALL sp_TinhTienDoNganSach(:p_user_id, :p_category_id, :p_month, :p_year)',
      {
        replacements: {
          p_user_id: data.userId,
          p_category_id: data.categoryId,
          p_month: data.month,
          p_year: data.year
        }
      }
    );

    const rawData = result as any[];
    const totalSpent = rawData && rawData[0] && rawData[0].Total_Spent ? Number(rawData[0].Total_Spent) : 0;

    return totalSpent;
  }
}