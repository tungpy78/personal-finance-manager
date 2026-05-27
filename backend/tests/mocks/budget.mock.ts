import type { UpsertBudgetDTO } from "../../src/core/dtos/budget.dto.js";
import { jest } from '@jest/globals';

// ==========================================
// 1. MOCK DATA (Dữ liệu nền tảng giả lập CSDL)
// ==========================================

export const mockCategories = [
  { id: 1, name: "Ăn uống", type: "EXPENSE" },    //  Hợp lệ để đặt ngân sách
  { id: 2, name: "Mua sắm", type: "EXPENSE" },    //  Hợp lệ để đặt ngân sách
  { id: 3, name: "Tiền lương", type: "INCOME" }   //  Dùng để test bẫy lỗi SQA (Không được đặt ngân sách)
];

export const mockBudgets = [
  {
    id: 1,
    userId: 1,
    categoryId: 1, 
    amount: 5000000,
    month: 5,
    year: 2026,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    userId: 1,
    categoryId: 2,
    amount: 2000000,
    month: 5,
    year: 2026,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// ==========================================
// 2. MOCK PAYLOADS (Các kịch bản đầu vào test DTO & Service)
// ==========================================

export const mockBudgetPayloads = {
    // ==========================================
    // VALID CASE
    // ==========================================
    valid: {
      category_id: 1,
      amount_limit: 5000000,
      month: 5,
      year: 2026
    } as UpsertBudgetDTO,

    // ==========================================
    // VALIDATION CASES
    // ==========================================
    invalidAmount: {
      category_id: 1,
      amount_limit: -5000,
      month: 5,
      year: 2026
    } as UpsertBudgetDTO,

    invalidMonth: {
      category_id: 1,
      amount_limit: 5000000,
      month: 13,
      year: 2026
    } as UpsertBudgetDTO,

    invalidYear: {
      category_id: 1,
      amount_limit: 5000000,
      month: 5,
      year: -1
    } as UpsertBudgetDTO,

    emptyPayload: {} as UpsertBudgetDTO,

    nullPayload: {
      category_id: null,
      amount_limit: null,
      month: null,
      year: null
    } as unknown as UpsertBudgetDTO,

    stringPayload: {
      category_id: "abc",
      amount_limit: "money",
      month: "May",
      year: "2026"
    } as unknown as UpsertBudgetDTO,

    // ==========================================
    // SERVICE LOGIC CASES
    // ==========================================
    notFoundCategory: {
      category_id: 99,
      amount_limit: 5000000,
      month: 5,
      year: 2026
    } as UpsertBudgetDTO,

    incomeCategory: {
      category_id: 13,
      amount_limit: 5000000,
      month: 5,
      year: 2026
    } as UpsertBudgetDTO,

    // ==========================================
    // EDGE CASES
    // ==========================================
    zeroAmount: {
      category_id: 1,
      amount_limit: 0,
      month: 5,
      year: 2026
    } as UpsertBudgetDTO,

    maxBoundaryAmount: {
      category_id: 1,
      amount_limit: 9999999999999,
      month: 12,
      year: 9999
    } as UpsertBudgetDTO, 

    overflowAmount: {
      category_id: 1,
      amount_limit: 10000000000000,
      month: 12,
      year: 9999
    } as UpsertBudgetDTO
};

export const mockAlertCases = {
   below80: {
      budget: 5000000,
      spent: 3900000
   },

   exact80: {
      budget: 5000000,
      spent: 4000000
   },

   over100: {
      budget: 5000000,
      spent: 5600000
   }
};

// ==========================================
// 3. MOCK BEHAVIOR (Giả lập các hàm của Repository)
// ==========================================

export const mockBudgetRepository = {
  upsertBudget: jest.fn(),
  getSpentAmount: jest.fn(),
  getBudgetsByMonth: jest.fn(),
  getBudgetByCategory: jest.fn()
};

export const mockCategoryRepository = {
  findByPk: jest.fn()
};