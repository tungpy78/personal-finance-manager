import type { ApiResponse } from "../types/api.type";
import type { Category } from "../types/category.type";
import axiosClient from "./axiosClient";


export const categoryApi = {
    getAll: (filters?: { keyword?: string; type?: string }) => {
        return axiosClient.get<ApiResponse<Category[]>>('/categories', { params: filters });
    },
    create: (data: Partial<Category>) => {
        return axiosClient.post<ApiResponse<Category>>('/categories', data);
    },
    update: (id: number, data: Partial<Category>) => {
        return axiosClient.put<ApiResponse<Category>>(`/categories/${id}`, data);
    },
    delete: (id: number) => {
        return axiosClient.delete<ApiResponse<null>>(`/categories/${id}`);
    }
};
