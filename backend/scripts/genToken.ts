import jwt from 'jsonwebtoken';
import 'dotenv/config';

// Script này giúp tạo nhanh 1 Token JWT để phục vụ việc Load Test
const secret = process.env.JWT_SECRET || 'Chuyen_Nghanh_IT_PTIT_2026_Tung_Dep_Trai';
const payload = {
    id: 1, // Giả định user ID là 1
    username: 'tung anh'
};

const token = jwt.sign(payload, secret, { expiresIn: '1d' });

console.log('--- TEST JWT TOKEN ---');
console.log(token);
console.log('----------------------');
console.log('Hãy copy token này và dán vào file tests/load/search.load.ts hoặc set biến môi trường TEST_JWT_TOKEN');
