export interface BudgetAlert {
    level: 'WARNING' | 'DANGER';
    message: string;
    percentage: number;
}


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
    budgetAlert?: BudgetAlert | null;
}

export interface UpdateTransactionResponse extends Transaction {
    budgetAlerts?: BudgetAlert[];
}