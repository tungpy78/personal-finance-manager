import { z } from "zod/v3";

// ======================================================
// POST /budgets
// ======================================================

export const UpsertBudgetSchema = z.object({
    amount_limit: z.number({
        required_error: 'Vui lòng nhập số tiền hạn mức',
        invalid_type_error: 'Số tiền hạn mức phải là một số'
    })
    .positive('Số tiền ngân sách phải lớn hơn 0')
    .max(
        9999999999999,
        'Số tiền vượt quá giới hạn hệ thống cho phép (Tối đa 10 nghìn tỷ)'
    ),

    category_id: z.number({
        required_error: 'Vui lòng chọn danh mục',
        invalid_type_error: 'ID danh mục không hợp lệ'
    })
    .int('ID danh mục phải là số nguyên')
    .positive('ID danh mục không hợp lệ'),

    month: z.number({
        required_error: 'Vui lòng chọn tháng áp dụng',
        invalid_type_error: 'Tháng phải là một số'
    })
    .int('Tháng phải là số nguyên')
    .min(1, 'Tháng tối thiểu là 1')
    .max(12, 'Tháng tối đa là 12'),

    year: z.number({
        required_error: 'Vui lòng chọn năm áp dụng',
        invalid_type_error: 'Năm phải là một số'
    })
    .int('Năm phải là số nguyên')
    .refine((val) => {

        const currentYear = new Date().getFullYear();

        return val >= currentYear;

    }, {
        message: 'Năm thiết lập ngân sách không được ở trong quá khứ'
    })
});

export type UpsertBudgetDTO =
    z.infer<typeof UpsertBudgetSchema>;


// ======================================================
// GET /budgets/progress
// ======================================================

export const GetBudgetProgressSchema = z.object({

    month: z.coerce.number({
        required_error: 'Vui lòng chọn tháng',
        invalid_type_error: 'Tháng không hợp lệ'
    })
    .int('Tháng phải là số nguyên')
    .min(1, 'Tháng tối thiểu là 1')
    .max(12, 'Tháng tối đa là 12'),

    year: z.coerce.number({
        required_error: 'Vui lòng chọn năm',
        invalid_type_error: 'Năm không hợp lệ'
    })
    .int('Năm phải là số nguyên')
    .min(2025, 'Năm không hợp lệ')
});

export type GetBudgetProgressDTO =
    z.infer<typeof GetBudgetProgressSchema>;