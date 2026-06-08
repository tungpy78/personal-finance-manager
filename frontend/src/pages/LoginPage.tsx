import { Link, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, Input, Button, Card, Typography, message, Layout } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useAuthStore } from '../stores/auth.store';
import { AuthService } from '../services/auth.service';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../types/api.type';

const { Title, Text } = Typography;

const loginSchema = z.object({
    email: z.string()
        .min(1, { message: 'Vui lòng nhập email' })
        .email({ message: 'Email không đúng định dạng (VD: admin@ptit.edu.vn)' }),
    password: z.string()
        .min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
});


type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    
    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: ''
        }
    });

    
    const onSubmit = async (data: LoginFormValues) => {
        try {
           
            const response = await AuthService.login(data);

            const token = response.data.accessToken || response.data.token; 
            const user = response.data.user;

            if (!token) {
                message.error('Lỗi: Backend không trả về Token!');
                return;
            }

            setAuth(user, token);
            
            message.success('Đăng nhập thành công!');
            navigate('/');

        } catch (error) {
            const errorMsg = error as AxiosError<ApiErrorResponse>
            console.log("errorMsg", errorMsg);
            message.error(errorMsg.message);
        }
    };

    return (
        
        <Layout style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f0f2f5' }}>
            <Card 
                style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: 12 }}
                styles={{ body: { padding: '32px 24px' } }}
            >
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Title level={3} style={{ margin: 0 }}>Đăng Nhập</Title>
                    <Text type="secondary">Quản lý chi tiêu cá nhân</Text>
                </div>

                <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
                    
                    {/* BỌC RHF QUANH ANTD INPUT */}
                    <Form.Item 
                        validateStatus={errors.email ? 'error' : ''} 
                        help={errors.email?.message}
                    >
                        <Controller
                            name="email"
                            control={control}
                            render={({ field }) => (
                                <Input 
                                    {...field} 
                                    size="large" 
                                    prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} 
                                    placeholder="Email đăng nhập" 
                                />
                            )}
                        />
                    </Form.Item>

                    <Form.Item 
                        validateStatus={errors.password ? 'error' : ''} 
                        help={errors.password?.message}
                    >
                        <Controller
                            name="password"
                            control={control}
                            render={({ field }) => (
                                <Input.Password 
                                    {...field} 
                                    size="large" 
                                    prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} 
                                    placeholder="Mật khẩu" 
                                />
                            )}
                        />
                    </Form.Item>

                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        size="large" 
                        block 
                        loading={isSubmitting}
                        style={{ marginTop: 8 }}
                    >
                        Đăng Nhập
                    </Button>
                    <div style={{ textAlign: 'center', marginTop: 16 }}>
                        <Text type="secondary">
                            Đã chưa có tài khoản?{' '}
                            <Link to="/register">Đăng ký</Link>
                        </Text>
                    </div>
                </Form>
            </Card>
        </Layout>
    );
};