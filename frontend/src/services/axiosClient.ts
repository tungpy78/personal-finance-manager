import axios from 'axios';

// 1. KẾT HỢP TINH HOA ĐỒ ÁN CŨ: Dùng biến môi trường + Timeout chống treo App
const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
    headers: {
        'Content-Type': 'application/json',
         Accept: "application/json",
        'Cache-Control': 'no-cache'
    },
    timeout: 30000, // Tối đa 30s không phản hồi thì báo lỗi luôn
});

// --- REQUEST INTERCEPTOR ---
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// --- RESPONSE INTERCEPTOR ---
axiosClient.interceptors.response.use(
    (response) => {
        return response.data; // Thành công: Trả về data lõi
    },
    (error) => {
        const originalRequest = error.config;

        // 2. KẾT HỢP TINH HOA SQA: Chặn đá văng nếu là API Đăng nhập
        // Có thể kết hợp cả UI (pathname) và API (url) để an toàn tuyệt đối
        const isLoginApi = originalRequest.url === '/auth/login';
        const isLoginPage = window.location.pathname === '/login';

        if (error.response && error.response.status === 401 && !isLoginApi && !isLoginPage) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            window.location.href = '/login'; 
        }
        
        // 3. CHUẨN MỰC: Vẫn ném trả nguyên cục error gốc để Component tự phân tích
        // Giúp Type "AxiosError" hoạt động chính xác 100% ở phía Component
        const errorMessage = error.response?.data || error;
        return Promise.reject(errorMessage); // TRẢ VỀ THẲNG DATA LỖI
    }
);

export default axiosClient;