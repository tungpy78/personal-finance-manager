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

export const SearchTransactionSchema = z.object({
    search: z
        .preprocess((val) => (val === "" ? undefined : val), z.string().trim().max(255, "Mô tả không được vượt quá 255 ký tự").optional()),

    begin_date: z
        .preprocess((val) => (val === "" ? undefined : val), z.coerce.date({
            invalid_type_error: "Ngày bắt đầu không hợp lệ",
        }).optional()),

    end_date: z
        .preprocess((val) => (val === "" ? undefined : val), z.coerce.date({
            invalid_type_error: "Ngày kết thúc không hợp lệ",
        }).optional()),

    sort: z
        .preprocess((val) => (val === "" ? undefined : val), z.enum(["date_asc", "date_desc", "amount_asc", "amount_desc"]).optional()),

    categoryId: z
        .preprocess((val) => (val === "" ? undefined : val), z.coerce.number().int().positive("ID danh mục phải là số nguyên dương").optional()),

    type: z
        .preprocess((val) => (val === "" ? undefined : val), z.enum(["INCOME", "EXPENSE"]).optional()),
})
.superRefine((data, ctx) => {
    const { begin_date, end_date } = data;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const normalize = (d: Date) => {
        const x = new Date(d);
        x.setHours(0, 0, 0, 0);
        return x;
    };

    const b = begin_date ? normalize(begin_date) : null;
    let e = end_date ? normalize(end_date) : null;

    if (!b && e) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Phải chọn ngày bắt đầu khi đã chọn ngày kết thúc",
            path: ["beginDate"],
        });
        return;
    }

    if (b && !e) {
        e = today;
        data.end_date = e;
    }

    if (b && b > today) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Ngày bắt đầu không được lớn hơn hôm nay",
            path: ["beginDate"],
        });
    }

    if (e && e > today) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Ngày kết thúc không được lớn hơn hôm nay",
            path: ["endDate"],
        });
    }

    // validate range
    if (b && e && e < b) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Ngày kết thúc phải >= ngày bắt đầu",
            path: ["endDate"],
        });
    }
});

export type SearchTransactionDTO = z.infer<typeof SearchTransactionSchema>;