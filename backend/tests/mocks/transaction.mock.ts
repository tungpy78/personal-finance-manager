import type { SearchTransactionDTO } from "../../src/core/dtos/transaction.dto.js";

export const mockTransactions = [
    {
        id: 1,
        userId: 1,
        amount: 500000,
        type: "INCOME",
        categoryId: 1,
        description: "Lương tháng 5",
        date: new Date("2026-05-01T10:00:00Z"),
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 2,
        userId: 1,
        amount: 200000,
        type: "EXPENSE",
        categoryId: 2,
        description: "Mua sắm quần áo",
        date: new Date("2026-05-02T15:30:00Z"),
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 3,
        userId: 1,
        amount: 100000,
        type: "EXPENSE",
        categoryId: 3,
        description: "Ăn trưa",
        date: new Date("2026-05-03T12:00:00Z"),
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 4,
        userId: 2,
        amount: 1500000,
        type: "INCOME",
        categoryId: 1,
        description: "Thưởng dự án",
        date: new Date("2026-05-04T09:00:00Z"),
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

export const mockSearchFilters = {
    empty: {} as SearchTransactionDTO,
    byTypeIncome: { type: "INCOME" } as SearchTransactionDTO,
    byTypeExpense: { type: "EXPENSE" } as SearchTransactionDTO,
    bySearchString: { search: "Lương" } as SearchTransactionDTO,
    byCategoryId: { category_id: 2 } as SearchTransactionDTO,
    byDateRange: { begin_date: new Date("2026-05-01"), end_date: new Date("2026-05-02") } as SearchTransactionDTO,
    withSortDateDesc: { sort: "date_desc" } as SearchTransactionDTO,
    withSortAmountAsc: { sort: "amount_asc" } as SearchTransactionDTO
};
