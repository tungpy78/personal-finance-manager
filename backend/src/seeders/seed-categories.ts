import sequelize from '../config/database.js';
import Category from '../database/models/Category.js';

const runSeeder = async () => {
    try {
        // 1. Kết nối database (nếu chạy file này độc lập)
        await sequelize.authenticate();
        console.log('Đang kiểm tra dữ liệu bảng Categories...');

        // 2. SQA: Kiểm tra xem bảng đã có dữ liệu chưa
        const count = await Category.count();
        if (count > 0) {
            console.log('✅ Bảng Categories đã có dữ liệu. Bỏ qua bước Seed để tránh trùng lặp.');
            process.exit(0); // Thoát chương trình an toàn
        }

        // 3. Chuẩn bị bộ dữ liệu Master Data
        const categoriesData = [
            // --- NHÓM CHI TIÊU (EXPENSE) ---
            { name: 'Ăn uống', type: 'EXPENSE' },
            { name: 'Di chuyển', type: 'EXPENSE' },
            { name: 'Hóa đơn & Tiện ích', type: 'EXPENSE' },
            { name: 'Mua sắm', type: 'EXPENSE' },
            { name: 'Giải trí', type: 'EXPENSE' },
            { name: 'Sức khỏe y tế', type: 'EXPENSE' },
            { name: 'Giáo dục', type: 'EXPENSE' },
            { name: 'Bảo hiểm', type: 'EXPENSE' },
            { name: 'Khác (Chi)', type: 'EXPENSE' },

            // --- NHÓM THU NHẬP (INCOME) ---
            { name: 'Tiền lương', type: 'INCOME' },
            { name: 'Tiền thưởng', type: 'INCOME' },
            { name: 'Đầu tư & Sinh lời', type: 'INCOME' },
            { name: 'Được tặng/Cho', type: 'INCOME' },
            { name: 'Khác (Thu)', type: 'INCOME' },
        ];

        // 4. Bulk Create: Bắn toàn bộ mảng này vào Database trong 1 câu lệnh (Tối ưu hiệu năng)
        await Category.bulkCreate(categoriesData);
        
        console.log('🎉 Seed dữ liệu Category thành công! Cả nhóm đã có thể dùng.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Lỗi khi seed dữ liệu Category:', error);
        process.exit(1);
    }
};

runSeeder();