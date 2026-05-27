// Định nghĩa kiểu dữ liệu chuẩn khớp 100% với Backend
export interface Transaction {
    id: number;
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    date: string;
    description?: string;
    categoryId: number;
}

// Định nghĩa dữ liệu khi Gửi đi (Thêm mới) - Bỏ id vì DB tự sinh
export type CreateTransactionDTO = Omit<Transaction, 'id'>;

export interface CreateTransactionResponse extends Transaction {
    budgetAlert?: {
        level: 'WARNING' | 'DANGER';
        message: string;
        percentage: number;
    } | null;
}