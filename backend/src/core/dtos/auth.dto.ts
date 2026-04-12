import { z } from "zod/v3";


export const RegisterSchema = z.object({
    username: z.string().min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự'),
    email: z.string().email('Định dạng email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
})

export type RegisterDTO = z.infer<typeof RegisterSchema>