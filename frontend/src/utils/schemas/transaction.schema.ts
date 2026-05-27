import { z } from 'zod';

export const transactionSchema = z.object({
    amount: z.number({ message: "Vui lòng nhập số" })
        .positive("Số tiền phải lớn hơn 0"),
    
    type: z.enum(["INCOME", "EXPENSE"], { message: "Vui lòng chọn loại giao dịch" }),
    categoryId: z.number({ message: "Vui lòng chọn danh mục" }),
    date: z.string().min(1, "Vui lòng chọn ngày"),
    description: z.string().max(255, "Mô tả không được vượt quá 255 ký tự").optional(),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;