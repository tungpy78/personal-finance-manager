import { sequelize } from './src/database/models/index.js';

const syncDatabase = async () => {
  try {
    // alter: true giúp Sequelize tự động sửa bảng nếu em thêm/xóa cột sau này
    await sequelize.sync({ alter: true }); 
    console.log('✅ Đã tạo các bảng trong MySQL thành công!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi tạo bảng:', error);
    process.exit(1);
  }
};

syncDatabase();