import { useEffect, useMemo, useState } from 'react';
import { Card, Row, Col, Statistic, Progress, List, Avatar, Typography, Tag, message, Form, Input, Select, DatePicker, Button, Space, Popconfirm } from 'antd';
import { PlusOutlined, ArrowUpOutlined, ArrowDownOutlined, SearchOutlined, ReloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { FloatButton } from 'antd';
import { FormThemGiaoDich } from './FormThemGiaoDich';
import type { Transaction } from '../types/transaction.type';
import { transactionApi } from '../services/transaction.service';
import { budgetApi } from '../services/budget.service'; // 1. Import thêm budgetApi
import { categoryApi } from '../services/category.service';
import type { Category } from '../types/category.type';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse, ApiResponse } from '../types/api.type';
import type { BudgetProgress } from '../types/budget.type';
import { formatVND } from '../utils/formatVND';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

export const TransactionPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [transaction, setTransaction] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    
    const [budgetProgress, setBudgetProgress] = useState<BudgetProgress[]>([]);
    const [form] = Form.useForm();

    const fetchCategories = async () => {
        setLoadingCategories(true);
        try {
            const response = await categoryApi.getAll() as unknown as ApiResponse<Category[]>;
            const listCategories = response?.data || [];
            setCategories(listCategories);
        } catch (error) {
            console.error('Lỗi khi lấy danh mục:', error);
        } finally {
            setLoadingCategories(false);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const searchFilters = form.getFieldsValue();
            const payload: any = {
                search: searchFilters.search || undefined,
                type: searchFilters.type || undefined,
                categoryId: searchFilters.categoryId ? Number(searchFilters.categoryId) : undefined,
                sort: searchFilters.sort || undefined,
            };

            if (searchFilters.dateRange && searchFilters.dateRange[0] && searchFilters.dateRange[1]) {
                payload.begin_date = searchFilters.dateRange[0].format('YYYY-MM-DD');
                payload.end_date = searchFilters.dateRange[1].format('YYYY-MM-DD');
            }

            const response: any = await transactionApi.search(payload);
            const listData = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
            setTransaction(listData); 
        } catch (error) {
            const err = error as AxiosError<ApiErrorResponse>;
            message.error(err.message || 'Lỗi khi lấy danh sách giao dịch');
        } finally {
            setLoading(false);
        }
    };

    const fetchBudget = async () => {
        try {
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth() + 1;
            const currentYear = currentDate.getFullYear();
            const response = await budgetApi.getBudgetProgress(currentMonth, currentYear);
            setBudgetProgress(response.data);
        } catch (error) {
            console.log("Chưa cài đặt ngân sách hoặc lỗi API Budget");
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchData();
        fetchBudget();
    }, []);

    const watchType = Form.useWatch('type', form);

    const filteredCategoriesForFilter = useMemo(() => {
        if (!watchType) return categories;
        return categories.filter(cat => cat.type === watchType);
    }, [categories, watchType]);

    const disabledDate = (current: dayjs.Dayjs) => {
        return current && current > dayjs().endOf('day');
    };

    const handleResetFilter = () => {
        form.resetFields();
        fetchData();
    };

    const { totalIncome, totalExpense, currentBalance } = useMemo(() => {
        let income = 0; let expense = 0;
        transaction.forEach(item => {
            if (item.type === 'INCOME') income += Number(item.amount);
            else if (item.type === 'EXPENSE') expense += Number(item.amount);
        });
        return { totalIncome: income, totalExpense: expense, currentBalance: income - expense };
    }, [transaction]);

    const handleDelete = async (id: number) => {

    try {

        await transactionApi.delete(id);

        message.success('Xóa giao dịch thành công!');

        fetchData();
        fetchBudget();

    } catch (error) {

        const err = error as AxiosError<ApiErrorResponse>;

        message.error(
            err.response?.data?.message ||
            'Xóa thất bại'
        );
    }
};

    return (
        <div style={{ paddingBottom: 60 }}>
            
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ background: '#f6ffed' }}><Statistic title="Tổng thu" value={totalIncome} precision={0} valueStyle={{ color: '#3f8600' }} suffix="đ" /></Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ background: '#fff1f0' }}><Statistic title="Tổng chi" value={totalExpense} precision={0} valueStyle={{ color: '#cf1322' }} suffix="đ" /></Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ background: '#e6f4ff' }}><Statistic title="Số dư hiện tại" value={currentBalance} precision={0} valueStyle={{ color: '#1677ff' }} suffix="đ" /></Card>
                </Col>
            </Row>

           
           <Card title={`Theo dõi ngân sách tháng ${new Date().getMonth() + 1}`} bordered={false} style={{ marginBottom: 24, borderRadius: 12 }}>
                {budgetProgress.length === 0 ? (
                    <Text type="secondary">Bạn chưa thiết lập hạn mức chi tiêu cho tháng này.</Text>
                ) : (
                    budgetProgress.map((budget) => (
                        <div key={budget.id} style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                
                                {/* TỐI ƯU UI: Hiển thị tên danh mục thật và ép kiểu amount về Number */}
                                <Text strong>
                                    {budget.category?.name || 'Không xác định'} (Hạn mức: {Number(budget.amount).toLocaleString()}đ)
                                </Text>
                                
                                <Text type="secondary">Đã tiêu: {Number(budget.totalSpent).toLocaleString()}đ ({budget.percentage}%)</Text>
                            </div>
                            <Progress 
                                percent={budget.percentage > 100 ? 100 : budget.percentage} 
                                status={budget.percentage >= 100 ? "exception" : "active"}
                                strokeColor={budget.percentage >= 100 ? '#ff4d4f' : budget.percentage >= 80 ? '#faad14' : '#52c41a'}
                            />
                        </div>
                    ))
                )}
            </Card>

            
            <Card title="Lịch sử giao dịch" bordered={false} style={{ borderRadius: 12 }}>
                {/* Bộ lọc tra cứu và tìm kiếm */}
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={fetchData}
                    style={{
                        marginBottom: 24,
                        padding: '16px 24px',
                        background: '#fafafa',
                        borderRadius: 8,
                        border: '1px solid #f0f0f0'
                    }}
                >
                    <Row gutter={[16, 8]} align="bottom">
                        <Col xs={24} sm={12} md={6}>
                            <Form.Item name="search" label="Mô tả" style={{ marginBottom: 0 }}>
                                <Input placeholder="Tìm kiếm mô tả..." allowClear />
                            </Form.Item>
                        </Col>
                        <Col xs={12} sm={6} md={4}>
                            <Form.Item name="type" label="Loại giao dịch" style={{ marginBottom: 0 }}>
                                <Select placeholder="Tất cả" allowClear>
                                    <Select.Option value="INCOME">Thu nhập</Select.Option>
                                    <Select.Option value="EXPENSE">Chi tiêu</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={12} sm={6} md={4}>
                            <Form.Item name="categoryId" label="Danh mục" style={{ marginBottom: 0 }}>
                                <Select placeholder="Tất cả" allowClear loading={loadingCategories}>
                                    {filteredCategoriesForFilter.map((cat) => (
                                        <Select.Option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Form.Item name="dateRange" label="Khoảng ngày" style={{ marginBottom: 0 }}>
                                <DatePicker.RangePicker 
                                    style={{ width: '100%' }} 
                                    disabledDate={disabledDate}
                                    placeholder={['Từ ngày', 'Đến ngày']}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={4}>
                            <Form.Item name="sort" label="Sắp xếp" style={{ marginBottom: 0 }}>
                                <Select placeholder="Mặc định" allowClear>
                                    <Select.Option value="date_desc">Mới nhất</Select.Option>
                                    <Select.Option value="date_asc">Cũ nhất</Select.Option>
                                    <Select.Option value="amount_desc">Số tiền lớn nhất</Select.Option>
                                    <Select.Option value="amount_asc">Số tiền nhỏ nhất</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row justify="end" style={{ marginTop: 16 }}>
                        <Space>
                            <Button icon={<ReloadOutlined />} onClick={handleResetFilter}>
                                Reset
                            </Button>
                            <Button type="primary" icon={<SearchOutlined />} htmlType="submit" loading={loading}>
                                Tìm kiếm
                            </Button>
                        </Space>
                    </Row>
                </Form>

                <List
                    itemLayout="horizontal"
                    loading={loading}
                    dataSource={transaction}
                    renderItem={(item) => {
                        const categoryName = categories.find(cat => cat.id === item.categoryId)?.name || `Danh mục #${item.categoryId}`;
                        return (
                            <List.Item
                                style={{ padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}
                                extra={
                                    <Space direction="vertical" align="end">

                                        <Title
                                            level={4}
                                            style={{
                                                color:
                                                    item.type === 'INCOME'
                                                        ? '#3f8600'
                                                        : '#cf1322',
                                                margin: 0
                                            }}
                                        >
                                            {item.type === 'INCOME' ? '+' : '-'}
                                            {formatVND(item.amount)}
                                        </Title>

                                        <Space>

                                            <Button
                                                icon={<EditOutlined />}
                                                onClick={() => {
                                                    setEditingTransaction(item);
                                                    setIsModalOpen(true);
                                                }}
                                            >
                                                Sửa
                                            </Button>

                                            <Popconfirm
                                                title="Xóa giao dịch"
                                                description="Bạn chắc chắn muốn xóa?"
                                                onConfirm={() => handleDelete(item.id)}
                                                okText="Xóa"
                                                cancelText="Hủy"
                                            >
                                                <Button danger icon={<DeleteOutlined />}>
                                                    Xóa
                                                </Button>
                                            </Popconfirm>

                                        </Space>

                                    </Space>
                                }
                            >
                                <List.Item.Meta
                                    avatar={<Avatar size="large" style={{ backgroundColor: item.type === 'INCOME' ? '#d9f7be' : '#ffd8bf', color: '#000' }} icon={item.type === 'INCOME' ? <ArrowUpOutlined /> : <ArrowDownOutlined />} />}
                                    title={
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <Text strong style={{ fontSize: 16 }}>{item.description || 'Không có mô tả'}</Text>
                                            <Tag color="blue">{categoryName}</Tag>
                                        </div>
                                    }
                                    description={<Text type="secondary">{dayjs(item.date).format('YYYY-MM-DD')}</Text>}
                                />
                            </List.Item>
                        );
                    }}
                />
            </Card>

            <FloatButton icon={<PlusOutlined />} type="primary" style={{ right: 24, bottom: 24, width: 56, height: 56 }} tooltip="Thêm giao dịch mới" onClick={() => setIsModalOpen(true)} />
            
            <FormThemGiaoDich 
                open={isModalOpen} 
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingTransaction(null);
                }}
                onSuccess={() => { fetchData(); fetchBudget(); }} 
                editData={editingTransaction}
            />
        </div>
    );
};