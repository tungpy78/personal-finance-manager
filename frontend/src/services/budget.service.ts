import type { ApiResponse } from '../types/api.type';
import type { BudgetProgress } from '../types/budget.type';
import axiosClient from './axiosClient';
export interface UpsertBudgetPayload {
    category_id: number;
    amount_limit: number;
    month: number;
    year: number;
}

export const budgetApi = {
    getBudgetProgress: (month: number, year: number) => {
        return axiosClient.get<ApiResponse<BudgetProgress[]>>('/budgets/progress', {
            params: { month, year }
        });
    },

    // 2. Thiết lập hoặc cập nhật ngân sách (dành cho danh mục EXPENSE)
    setupBudget: (data: UpsertBudgetPayload) => {
        return axiosClient.post<ApiResponse<unknown>>('/budgets', data);
    },

    // 3. Tính tổng tiền đã Thu/Chi của 1 danh mục bất kỳ (INCOME hoặc EXPENSE)
    getTotalAmount: (category_id: number, month: number, year: number) => {
        return axiosClient.get<ApiResponse<unknown>>('/budgets/total', {
            params: { category_id, month, year }
        });
    }
};