import { useRoutes, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { TransactionPage } from '../pages/TransactionPage';
import type { JSX } from 'react';
import { useAuthStore } from '../stores/auth.store';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { CategoryPage } from '../pages/CategoryPage';
import BudgetPage from '../pages/BudgetPage';

const NotFoundPage = () => <h2>404 - Không tìm thấy trang</h2>;

// 1. NGƯỜI GÁC CỔNG BÊN TRONG (Dành cho các trang bắt buộc đăng nhập)
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    // Lấy trạng thái từ Zustand Store
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    
    if (!isAuthenticated) {
        // Chưa đăng nhập -> Đá về trang /login
        return <Navigate to="/login" replace />;
    }
    // Đã đăng nhập -> Mời vào
    return children;
};

// 2. NGƯỜI GÁC CỔNG BÊN NGOÀI (Dành cho trang Login, Register)
const PublicRoute = ({ children }: { children: JSX.Element }) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    if (isAuthenticated) {
        // Đã đăng nhập rồi mà còn cố vào trang Login -> Đá về trang chủ (sẽ tự động sang sổ giao dịch)
        return <Navigate to="/" replace />;
    }
    return children;
};

export const AppRoutes = () => {
    const elements = useRoutes([
        {
            path: '/',
            // BỌC MAINLAYOUT VÀO TRONG PROTECTED ROUTE
            element: (
                <ProtectedRoute>
                    <MainLayout />
                </ProtectedRoute>
            ), 
            children: [
                // Tự động chuyển hướng trang gốc sang trang Giao dịch
                { index: true, element: <Navigate to="/transactions" replace /> },
                { path: 'transactions', element: <TransactionPage /> },
                { path: 'categories', element: <CategoryPage /> },
                { path: 'budgets', element: <BudgetPage /> }
            ]
        },
        {
            path: '/login',
            // BỌC LOGIN VÀO TRONG PUBLIC ROUTE
            element: (
                <PublicRoute>
                    <LoginPage />
                </PublicRoute>
            )
        },
        {
            path: '/register',
            // BỌC REGISTER VÀO TRONG PUBLIC ROUTE
            element: (
                <PublicRoute>
                    <RegisterPage />
                </PublicRoute>
            )
        },
        {
            path: '*',
            element: <NotFoundPage />
        }
    ]);

    return elements;
};