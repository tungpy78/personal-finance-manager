import z from "zod/v3";

export const CategorySchema = z.object({
  name: z.string({ required_error: "Tên danh mục không được để trống" })
    .min(1, "Tên danh mục không được để trống")
    .max(50, "Tên danh mục không vượt quá 50 ký tự")
    .trim(),
  
  type: z.enum(["INCOME", "EXPENSE"], { 
    required_error: "Vui lòng chọn loại danh mục",
    invalid_type_error: "Loại danh mục không hợp lệ"
  }),

  description: z.string()
    .max(255, "Mô tả không vượt quá 255 ký tự")
    .optional()
    .or(z.literal(''))
});

export type CategoryDTO = z.infer<typeof CategorySchema>;
