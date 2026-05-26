import type { Category } from './category.type'; // Import type Category nhóm em đã có

export interface BudgetProgress {
    id: number;
    userId: number;
    categoryId: number;
    // Để an toàn, amount có thể là string (vì DB thường trả về "5000000.00") hoặc number
    amount: string | number; 
    month: number;
    year: number;
    totalSpent: number;
    percentage: number;
    category?: Category; // Nested object (Danh mục đi kèm)
}