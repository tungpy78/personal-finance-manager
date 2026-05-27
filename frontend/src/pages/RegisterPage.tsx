import { useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, Input, Button, Card, Typography, message, Layout } from 'antd';
import { LockOutlined, UserOutlined, MailOutlined } from '@ant-design/icons';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../types/api.type';
import { AuthService } from '../services/auth.service';

const { Title, Text } = Typography;

const registerSchema = z
    .object({
        name: z.string().min(1, { message: 'Vui lòng nhập họ tên' }),
        email: z
            .string()
            .min(1, { message: 'Vui lòng nhập email' })
            .email({ message: 'Email không đúng định dạng' }),
        password: z
            .string()
            .min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' }),
        confirmPassword: z
            .string()
            .min(6, { message: 'Vui lòng nhập lại mật khẩu' }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Mật khẩu nhập lại không khớp',
        path: ['confirmPassword'],
    });

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
    const navigate = useNavigate();

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (data: RegisterFormValues) => {
        try {
            const payload = {
                username: data.name,
                email: data.email,
                password: data.password,
            };

            await AuthService.register(payload);

            message.success('Đăng ký thành công! Vui lòng đăng nhập.');
            navigate('/login');
        } catch (error) {
            const err = error as AxiosError<ApiErrorResponse>;

            const errorMessage =
                err.response?.data?.message ||
                err.message ||
                'Đăng ký thất bại';

            message.error(errorMessage);
        }
    };

    return (
        <Layout
            style={{
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#f0f2f5',
            }}
        >
            <Card
                style={{
                    width: 420,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    borderRadius: 12,
                }}
                styles={{
                    body: {
                        padding: '32px 24px',
                    },
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Title level={3} style={{ margin: 0 }}>
                        MoneyCare
                    </Title>
                    <Text type="secondary">
                        Tạo tài khoản quản lý chi tiêu cá nhân
                    </Text>
                </div>

                <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
                    <Form.Item
                        validateStatus={errors.name ? 'error' : ''}
                        help={errors.name?.message}
                    >
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    size="large"
                                    prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                                    placeholder="Họ và tên"
                                />
                            )}
                        />
                    </Form.Item>

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
                                    prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
                                    placeholder="Email đăng ký"
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

                    <Form.Item
                        validateStatus={errors.confirmPassword ? 'error' : ''}
                        help={errors.confirmPassword?.message}
                    >
                        <Controller
                            name="confirmPassword"
                            control={control}
                            render={({ field }) => (
                                <Input.Password
                                    {...field}
                                    size="large"
                                    prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                                    placeholder="Nhập lại mật khẩu"
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
                        Đăng ký
                    </Button>

                    <div style={{ textAlign: 'center', marginTop: 16 }}>
                        <Text type="secondary">
                            Đã có tài khoản?{' '}
                            <Link to="/login">Đăng nhập</Link>
                        </Text>
                    </div>
                </Form>
            </Card>
        </Layout>
    );
};