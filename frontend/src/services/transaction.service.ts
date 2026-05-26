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
    }
};