import type { ApiResponse } from "../types/api.type";
import type { Category } from "../types/category.type";
import axiosClient from "./axiosClient";


export const categoryApi = {
    getAll: () => {
        return axiosClient.get<any | ApiResponse<Category[]>>('/categories');
    },
};