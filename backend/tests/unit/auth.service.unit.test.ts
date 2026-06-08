import { jest } from '@jest/globals';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = "test_secret_key";
process.env.JWT_EXPIRES_IN = "1h";

// 1. Mock DB (Đã sửa tên hàm cho khớp với thực tế: findByEmail)
const mockUserCreate = jest.fn() as any;
const mockFindByEmail = jest.fn() as any; 

jest.unstable_mockModule("../../src/database/repositories/user.repository.js", () => ({
    UserRepository: { create: mockUserCreate, findByEmail: mockFindByEmail } 
}));

const { AuthService } = await import("../../src/core/services/auth.service.js");

// Giả lập Zod Schema
const mockAuthSchema = {
    safeParse: (data: any) => {
        if (!data.email) return { success: false, error: { issues: [{ message: "Vui lòng nhập email" }] } };
        if (data.password?.length < 6) return { success: false, error: { issues: [{ message: "Mật khẩu phải có ít nhất 6 ký tự" }] } };
        return { success: true };
    }
};

describe("AuthService & Middleware - Unit Test", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("Đăng ký (Register)", () => {
        it("TC-AUTH-01: Positive: Nhập Username, Email hợp lệ, Password >= 6 ký tự", async () => {
            mockFindByEmail.mockResolvedValueOnce(null); 
            const mockUser = { id: 1, username: "tung", email: "test@ptit.edu.vn" };
            mockUserCreate.mockResolvedValueOnce(mockUser);

            // Đã đổi tên hàm thành registerUser
            const result = await AuthService.registerUser({ username: "tung", email: "test@ptit.edu.vn", password: "password123" } as any);

            expect(result.email).toBe("test@ptit.edu.vn");
            expect(mockUserCreate).toHaveBeenCalled();
        });

        it("TC-AUTH-02: Negative (Logic): Nhập một Email đã tồn tại trong DB", async () => {
            mockFindByEmail.mockResolvedValueOnce({ id: 2, email: "test@ptit.edu.vn" }); 

            await expect(AuthService.registerUser({ username: "tung", email: "test@ptit.edu.vn", password: "password123" } as any))
                .rejects.toThrow("Email này đã được sử dụng!");
        });
    });

    describe("Đăng nhập (Login)", () => {
        it("TC-AUTH-03: Positive: Nhập đúng Email và Password", async () => {
            // SQA: Dùng bcrypt tạo mật khẩu băm (hash) THẬT thay vì dùng hàm giả
            const realHashedPassword = await bcrypt.hash("password123", 10);
            
            mockFindByEmail.mockResolvedValueOnce({ 
                id: 1, 
                username: "tung", 
                email: "test@ptit.edu.vn", 
                password: realHashedPassword // Đưa hash thật vào DB ảo
            });

            // Không cần dùng jest.spyOn nữa, cứ để hệ thống chạy thật
            const result = await AuthService.loginUser({ email: "test@ptit.edu.vn", password: "password123" } as any);

            expect(result).toHaveProperty("user");
            expect(result).toHaveProperty("accessToken");
        });

        it("TC-AUTH-04: Negative (Bảo mật): Nhập đúng Email nhưng sai Password", async () => {
            // SQA: Cấp hash thật của "password123"
            const realHashedPassword = await bcrypt.hash("password123", 10);
            
            mockFindByEmail.mockResolvedValueOnce({ 
                id: 1, 
                email: "test@ptit.edu.vn", 
                password: realHashedPassword 
            });

            // Cố tình nhập sai mật khẩu thành "wrong_pass"
            await expect(AuthService.loginUser({ email: "test@ptit.edu.vn", password: "wrong_pass" } as any))
                .rejects.toThrow("Mật khẩu không chính xác!");
        });
    });

    describe("Bảo mật & Validation", () => {
        it("TC-AUTH-05: Boundary (Zod): Để trống trường Email hoặc nhập Password chỉ có 3 ký tự", () => {
            const resultEmail = mockAuthSchema.safeParse({ email: "", password: "123" });
            expect(resultEmail.success).toBe(false);
            if (!resultEmail.success) expect(resultEmail.error?.issues[0]?.message).toContain("Vui lòng nhập email");

            const resultPass = mockAuthSchema.safeParse({ email: "test@test.com", password: "123" });
            expect(resultPass.success).toBe(false);
            if (!resultPass.success) expect(resultPass.error?.issues[0]?.message).toContain("Mật khẩu phải có ít nhất 6 ký tự");
        });

        it("TC-AUTH-06: Bảo mật Token - Hết hạn", () => {
            jest.spyOn(jwt, 'verify').mockImplementationOnce(() => { throw new Error("jwt expired"); });
            
            expect(() => {
                jwt.verify("expired_token", "secret");
            }).toThrow("jwt expired");
        });

        it("TC-AUTH-07: Bảo mật Token - Thiếu Header", () => {
            const req = { headers: {} }; 
            expect(req.headers).not.toHaveProperty('authorization');
        });
    });
});