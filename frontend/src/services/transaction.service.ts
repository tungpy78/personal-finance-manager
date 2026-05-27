import type { ApiResponse } from '../types/api.type';
import type { CreateTransactionDTO, CreateTransactionResponse, Transaction } from '../types/transaction.type';
import axiosClient from './axiosClient';


export const transactionApi = {
    // Gọi hàm này để lấy danh sách
    getAll: () => {
        return axiosClient.get<any , ApiResponse<Transaction[]>>('/transactions');
    },

    // Gọi hàm này để thêm mới
    create: (data: CreateTransactionDTO) => {
        return axiosClient.post<any , ApiResponse<CreateTransactionResponse>>('/transactions', data);
    },
    

    // Gọi hàm này để xóa
    delete: (id: number): Promise<any> => {
        return axiosClient.delete<any, ApiResponse<any>>(`/transactions/${id}`);
    },

    // Gọi hàm này để tìm kiếm và lọc giao dịch
    search: (filters: {
        search?: string;
        begin_date?: string;
        end_date?: string;
        sort?: 'date_asc' | 'date_desc' | 'amount_asc' | 'amount_desc';
        categoryId?: number;
        type?: 'INCOME' | 'EXPENSE';
    }) => {
        return axiosClient.post<any, ApiResponse<Transaction[]>>('/transactions/search', filters);
    }
};