import express from 'express';
import cors from 'cors';
import errorHandler from './api/middlewares/errorHandler.js';

const app = express();

// 1. Cài đặt các Middleware cơ bản
app.use(cors()); // Cho phép Frontend (React) gọi API
app.use(express.json()); // Cho phép API đọc dữ liệu JSON từ Frontend gửi lên

// 2. Định nghĩa các Routes (Các bạn sẽ thêm route vào đây sau)
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Hệ thống Quản lý chi tiêu đang hoạt động tốt!' });
});

// Chốt chặn 404: Bắt các API không tồn tại
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: `Không tìm thấy đường dẫn: ${req.originalUrl}`,
    data: null
  });
});

// 3. Chốt chặn cuối cùng: Bắt mọi lỗi xảy ra trong ứng dụng
app.use(errorHandler);

export default app;