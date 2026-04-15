import z from "zod/v3";

export const CreateTransactionSchema = z.object({
    amount: z.number({ required_error: 'Vui lòng nhập số tiền' }).positive('Số tiền phải lớn hơn 0').max(9999999999999, 'Số tiền vượt quá giới hạn hệ thống cho phép (Tối đa 10 nghìn tỷ)'),

    categoryId: z.number({ required_error: 'Vui lòng chọn danh mục' }),

    description: z.string().max(255, 'Mô tả không được vượt quá 255 ký tự').optional(),

    date: z.string()
        .datetime({ message: 'Định dạng ngày tháng không hợp lệ (ISO 8601)' })
        .refine((val) => {
            const inputDate = new Date(val);
            const currentDate = new Date();
            return inputDate <= currentDate;
        }, { 
            message: 'Ngày giao dịch không được vượt quá thời điểm hiện tại' 
        })
});

export type CreateTransactionDTO = z.infer<typeof CreateTransactionSchema>;
