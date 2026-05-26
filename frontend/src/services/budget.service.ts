import type { ApiResponse } from '../types/api.type';
import type { BudgetProgress } from '../types/budget.type';
import axiosClient from './axiosClient';

export const budgetApi = {
    // Truyền vào tháng và năm để Backend lọc dữ liệu
    getBudgetProgress: (month: number, year: number) => {
        return axiosClient.get<any | ApiResponse<BudgetProgress[]>>(`/budgets/progress?month=${month}&year=${year}`);
    }
};