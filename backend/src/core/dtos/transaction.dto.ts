import z from "zod/v3";

export const CreateTransactionSchema = z.object({
    amount: z.number({ required_error: 'Vui lòng nhập số tiền' }).positive('Số tiền phải lớn hơn 0').max(9999999999999, 'Số tiền vượt quá giới hạn hệ thống cho phép (Tối đa 10 nghìn tỷ)'),

    categoryId: z.number({ required_error: 'Vui lòng chọn danh mục' }),

    description: z.string().max(255, 'Mô tả không được vượt quá 255 ký tự').optional(),

    date: z.coerce.date({ 
        required_error: 'Vui lòng chọn ngày giao dịch',
        invalid_type_error: 'Ngày giao dịch không hợp lệ'
    })
    .refine((val) => {
        const currentDate = new Date();
        // Reset giờ phút giây của ngày hiện tại về 0 để chỉ so sánh ngày
        currentDate.setHours(23, 59, 59, 999); 
        return val <= currentDate;
    }, { 
        message: 'Ngày giao dịch không được vượt quá thời điểm hiện tại' 
    })
});

export type CreateTransactionDTO = z.infer<typeof CreateTransactionSchema>;
