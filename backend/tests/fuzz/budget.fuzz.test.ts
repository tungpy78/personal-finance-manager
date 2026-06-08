import { jest } from '@jest/globals';
import app from '../../src/app.js';
import User from '../../src/database/models/User.js';
import { AuthService } from '../../src/core/services/auth.service.js';
import sequelize from '../../src/config/database.js';
import type { Server } from 'http';
import 'dotenv/config';

// Tăng timeout cho Jest vì 200 requests HTTP qua DB thật có thể mất thời gian
jest.setTimeout(60000); 

const generateRandomString = (length: number) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:",.<>?/';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

const generateRandomDate = () => {
    const start = new Date(1970, 0, 1).getTime();
    const end = new Date(2050, 11, 31).getTime();
    return new Date(start + Math.random() * (end - start));
};

const generateFuzzFilters = () => {
    const sorts = ["date_asc", "date_desc", "amount_asc", "amount_desc", "invalid_sort", "", null, undefined];
    const types = ["INCOME", "EXPENSE", "INVALID_TYPE", generateRandomString(10), undefined];

    return {
        search: Math.random() > 0.5 ? generateRandomString(Math.floor(Math.random() * 100)) : undefined,
        type: types[Math.floor(Math.random() * types.length)] as any,
        category_id: Math.random() > 0.5 ? Math.floor(Math.random() * 1000) : (Math.random() > 0.5 ? generateRandomString(5) as any : undefined),
        begin_date: Math.random() > 0.5 ? generateRandomDate() : (Math.random() > 0.5 ? generateRandomString(10) as any : undefined),
        end_date: Math.random() > 0.5 ? generateRandomDate() : undefined,
        sort: sorts[Math.floor(Math.random() * sorts.length)] as any,
    };
};

describe("Transaction - API-level Fuzz Test - searchTransactions", () => {
    let server: Server;
    let baseURL: string;
    let cachedToken: string | null = null;
    let tokenExpiry: number = 0; // Epoch timestamp in seconds

    let testEmail = "tung@gmail.com";
    let testPassword = "tung12345";
    let isTempUserCreated = false;
    let tempUserEmail = '';

    // Hàm lấy token, chỉ gọi lại khi token hết hạn
    const getAuthToken = async (): Promise<string> => {
        const nowInSeconds = Math.floor(Date.now() / 1000);
        // Nếu token vẫn còn hạn (có buffer 60 giây) thì trả về luôn
        if (cachedToken && nowInSeconds < tokenExpiry - 60) {
            return cachedToken;
        }

        // Nếu hết hạn hoặc chưa có, gọi API đăng nhập để lấy token mới
        const loginResponse = await fetch(`${baseURL}/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testEmail,
                password: testPassword
            })
        });

        const result = await loginResponse.json() as any;
        if (!loginResponse.ok || !result.success) {
            throw new Error(`Đăng nhập thất bại để lấy token: ${JSON.stringify(result)}`);
        }

        const token = result.data.accessToken;
        cachedToken = token;

        // Giải mã JWT Payload để lấy thời gian hết hạn (exp)
        try {
            const payloadBase64 = token.split('.')[1];
            const decodedPayload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf8'));
            tokenExpiry = decodedPayload.exp;
        } catch (e) {
            // Dự phòng nếu không giải mã được payload: mặc định hết hạn sau 1 giờ
            tokenExpiry = nowInSeconds + 3600;
        }

        return token;
    };

    beforeAll(async () => {
        // Khởi động kết nối DB
        await sequelize.authenticate();

        // Khởi động server động trên port ngẫu nhiên
        server = app.listen(0, () => {
            const address = server.address();
            if (address && typeof address !== 'string') {
                baseURL = `http://localhost:${address.port}`;
            }
        });

        // Đợi baseURL được gán
        await new Promise<void>((resolve) => {
            const check = () => {
                if (baseURL) resolve();
                else setTimeout(check, 10);
            };
            check();
        });

        // Nếu không có cấu hình tài khoản kiểm thử trong .env, tự tạo tài khoản tạm thời
        if (!testEmail || !testPassword) {
            tempUserEmail = `fuzz_${Date.now()}@example.com`;
            testPassword = "Password123!";
            
            // Đăng ký user thông qua AuthService để mã hóa mật khẩu chính xác
            await AuthService.registerUser({
                username: `fuzz_${Date.now()}`,
                email: tempUserEmail,
                password: testPassword
            });
            
            testEmail = tempUserEmail;
            isTempUserCreated = true;
            console.log(`Đã tạo tài khoản test fuzz tạm thời: ${testEmail}`);
        }
    });

    afterAll(async () => {
        // Dọn dẹp tài khoản tạm thời nếu có
        if (isTempUserCreated && tempUserEmail) {
            await User.destroy({ where: { email: tempUserEmail } });
            console.log(`Đã dọn dẹp tài khoản test fuzz tạm thời: ${tempUserEmail}`);
        }

        // Đóng server
        if (server) {
            await new Promise<void>((resolve) => server.close(() => resolve()));
        }
        
        // Đóng kết nối DB
        await sequelize.close();
    });

    it("không được crash (ném HTTP 500) với hàng loạt input ngẫu nhiên (Fuzzing qua API)", async () => {
        const ITERATIONS = 200; // Số lần chạy fuzzing qua API (mỗi lần chạy qua DB thật nên để khoảng 200)
        let crashes = 0;

        for (let i = 0; i < ITERATIONS; i++) {
            const fuzzInput = generateFuzzFilters();
            const token = await getAuthToken();

            try {
                const response = await fetch(`${baseURL}/api/v1/transactions/search`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(fuzzInput)
                });

                const result = await response.json() as any;

                // Các mã lỗi validation (400) hoặc thành công (200) là hợp lệ
                // Bất kỳ lỗi 500 (Internal Server Error) nào đều được coi là crash/unhandled exception
                if (response.status === 500) {
                    crashes++;
                    console.error(`[Fuzz Crash] Input:`, fuzzInput, `Response status: 500, Error:`, result);
                }
            } catch (error: any) {
                // Lỗi kết nối hoặc lỗi unhandled khác ngoài HTTP status code
                crashes++;
                console.error(`[Fuzz Error] Input:`, fuzzInput, `Exception:`, error);
            }
        }

        expect(crashes).toBe(0);
    });
});