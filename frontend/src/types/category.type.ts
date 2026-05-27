// Định nghĩa kiểu dữ liệu chuẩn khớp 100% với Backend
export interface Category {
    id: number;
    type: 'INCOME' | 'EXPENSE';
    name: string
}
