import { useState } from 'react';
import { Button, Layout, Menu, Space, theme, Typography } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { DashboardOutlined, TransactionOutlined, SettingOutlined, WalletOutlined, LogoutOutlined, PieChartOutlined } from '@ant-design/icons';
import { useAuthStore } from '../stores/auth.store';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

export const MainLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

     const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    
    const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken()

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { key: '/', icon: <DashboardOutlined />, label: 'Tổng quan' },
        { key: '/transactions', icon: <TransactionOutlined />, label: 'Sổ giao dịch' },
        { key: '/categories', icon: <WalletOutlined />, label: 'Danh mục' },
        { key: '/budgets', icon: <PieChartOutlined />, label: 'Ngân sách' },
        { key: '/settings', icon: <SettingOutlined />, label: 'Cài đặt' },
    ];


    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                <div style={{ height: 64, margin: '16px', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: 12 }}>
                    <WalletOutlined style={{ fontSize: 28, color: '#1677ff' }} />
                    {!collapsed && <Title level={4} style={{ color: '#fff', margin: 0, whiteSpace: 'nowrap' }}>MoneyCare</Title>}
                </div>
                <Menu 
                    theme="dark" 
                    mode="inline" 
                    selectedKeys={[location.pathname]} 
                    items={menuItems}
                    onClick={({ key }) => navigate(key)}
                />
            </Sider>
            <Layout>
                <Header 
                style={{
                padding: '0 24px',
                background: colorBgContainer,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center', }}
                >
                    <div style={{ fontSize: 16 }}>
                        Quản lý chi tiêu cá nhân
                    </div>

                    <Space>
                        <div>
                            Xin chào, {user?.email || 'Người dùng'}
                        </div>

                        <Button
                            danger
                            icon={<LogoutOutlined />}
                            onClick={handleLogout}
                        >
                            Đăng xuất
                        </Button>
                    </Space>
                </Header>
                <Content style={{ margin: '16px 16px' }}>
                    <div style={{ padding: 24, minHeight: 360, background: colorBgContainer, borderRadius: borderRadiusLG }}>
                        <Outlet /> 
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};