import { CreateTransactionSchema } from "../../src/core/dtos/transaction.dto.js";


describe("Transaction Validation - Unit Test (Zod Schema)", () => {
    
    it("TC-GD-02: Bỏ trống trường 'Số tiền' hoặc 'Danh mục', bấm Lưu", () => {
        const payload = { description: "Thiếu dữ liệu", date: new Date().toISOString() };
        const result = CreateTransactionSchema.safeParse(payload);
        
        expect(result.success).toBe(false);
        // Zod sẽ gom mảng các lỗi thiếu trường required
        expect(result.success === false && result.error.issues.length).toBeGreaterThan(0);
    });

    it("TC-GD-03: Thêm giao dịch - Negative: Nhập số tiền là -100 (âm)", () => {
        const payload = { amount: -100, categoryId: 1, type: "EXPENSE", date: new Date().toISOString() };
        const result = CreateTransactionSchema.safeParse(payload);
        
        expect(result.success).toBe(false);
        if (!result.success) {
            // Tùy theo message em setup trong file Zod, có thể điều chỉnh chuỗi expect này
            const errorMsg = JSON.stringify(result.error.issues);
            expect(errorMsg).toMatch(/lớn hơn 0|positive|min/i); 
        }
    });

    it("TC-GD-07: Sửa giao dịch - Negative (Validation): Sửa số tiền thành một số âm (-50000) hoặc để trống số tiền", () => {
        const payload = { amount: -50000, categoryId: 1, type: "EXPENSE", date: new Date().toISOString() };
        const result = CreateTransactionSchema.safeParse(payload);
        expect(result.success).toBe(false);
    });

    it("TC-GD-10: Thêm / Sửa GD - Boundary (Zod): Nhập mô tả (description) dài hơn 255 ký tự", () => {
        const longText = "A".repeat(300); // Sinh chuỗi 300 ký tự
        const payload = { amount: 50000, categoryId: 1, type: "EXPENSE", date: new Date().toISOString(), description: longText };
        
        const result = CreateTransactionSchema.safeParse(payload);
        expect(result.success).toBe(false);
        if (!result.success) {
            const errorMsg = JSON.stringify(result.error.issues);
            expect(errorMsg).toMatch(/255|vượt quá/i);
        }
    });

    it("TC-GD-11: Thêm / Sửa GD - Boundary (Zod): Nhập số tiền khổng lồ vượt quá giới hạn của DECIMAL(15,2)", () => {
        const payload = { amount: 9999999999999999, categoryId: 1, type: "EXPENSE", date: new Date().toISOString() };
        const result = CreateTransactionSchema.safeParse(payload);
        
        expect(result.success).toBe(false);
    });

    it("TC-GD-12: Thêm / Sửa GD - Negative (Logic): Chọn ngày giao dịch (date) ở một thời điểm trong tương lai xa", () => {
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 5); // Tương lai 5 năm
        
        const payload = { amount: 50000, categoryId: 1, type: "EXPENSE", date: futureDate.toISOString() };
        const result = CreateTransactionSchema.safeParse(payload);
        
        expect(result.success).toBe(false);
    });
});