import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'defaultdb',
  process.env.DB_USER || 'avnadmin',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'mysql-19fbac4c-truonganhtung230904-132c.i.aivencloud.com',
    port: parseInt(process.env.DB_PORT || '13485'), // Khai báo Port
    dialect: 'mysql',
    logging: false, // Tắt log SQL
    dialectOptions: {
      ssl: {
        require: true, // Bắt buộc dùng SSL khi gọi lên Aiven Cloud
        rejectUnauthorized: false // Bỏ qua xác thực chứng chỉ tự ký
      }
    }
  }
);

// Đoạn code test kết nối SQA
sequelize.authenticate()
  .then(() => {
    console.log('🎉 Kết nối CSDL Aiven Cloud thành công chuẩn SQA!');
  })
  .catch((error) => {
    console.error('❌ Lỗi kết nối CSDL Cloud:', error);
  });

export default sequelize;