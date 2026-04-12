import app from './app.js';
import sequelize from './config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Kiểm tra lại kết nối DB trước khi mở API
    await sequelize.authenticate();
    console.log('🎉 Kết nối CSDL MySQL thành công!');

    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Không thể khởi động Server:', error);
    process.exit(1);
  }
};

startServer();