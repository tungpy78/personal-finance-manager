import { type UpsertBudgetDTO } from '../dtos/budget.dto.js';
import { CategoryRepository } from '../../database/repositories/category.repository.js';
import { BudgetRepository } from '../../database/repositories/budget.repository.js';

export class BudgetService {
  static async setupBudget(userId: number, payload: UpsertBudgetDTO) {
    const category = await CategoryRepository.findByPk(payload.category_id, userId);
    
    if (!category) {
      throw new Error("Danh mục chi tiêu không tồn tại hoặc không thuộc quyền sở hữu của bạn.");
    }

    if (category.type !== 'EXPENSE') {
        throw new Error("Chỉ có thể thiết lập ngân sách cho danh mục loại Chi tiêu.");
    }

    const savedBudget = await BudgetRepository.upsertBudget({
      userId: userId,
      categoryId: payload.category_id,
      amount: payload.amount_limit,
      month: payload.month,
      year: payload.year
    });

    return savedBudget;
  }

  static async getBudgetProgress(userId: number, month: number, year: number) {
    const budgets = await BudgetRepository.getBudgetsByMonth(userId, month, year);

    const progressList = await Promise.all(budgets.map(async (budget) => {
      const totalSpent = await BudgetRepository.getSpentAmount({
        userId,
        categoryId: budget.categoryId,
        month,
        year,
      });

      let percentage = 0;
      if (budget.amount > 0) {
        percentage = (totalSpent / budget.amount) * 100;
      }

      return {
        ...budget,
        totalSpent,
        percentage: Number(percentage.toFixed(2))
      };
    }));
    return progressList;
  }

  static async checkBudgetAlert(userId: number, categoryId: number, month: number, year: number) {
    const budget = await BudgetRepository.getBudgetByCategory(userId, categoryId, month, year);
    
    if (!budget) return null; 
    if (budget.amount <= 0) return null;

    const totalSpent = await BudgetRepository.getSpentAmount({ userId, categoryId, month, year });
    const percentage = (totalSpent / budget.amount) * 100;

    if (percentage >= 100) {
      return { 
        level: 'DANGER', 
        message: 'Chú ý! Bạn đã vượt quá ngân sách trong tháng!', 
        percentage 
      };
    } else if (percentage >= 80) {
      return { 
        level: 'WARNING', 
        message: 'Bạn đã tiêu chạm ngưỡng 80% ngân sách.', 
        percentage 
      };
    }
    return null; 
  }
}