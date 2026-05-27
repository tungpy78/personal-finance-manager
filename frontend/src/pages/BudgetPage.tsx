import { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Card,
    Button,
    Space,
    Modal,
    Form,
    InputNumber,
    Select,
    message,
    Typography,
    Row,
    Col,
    Progress,
    Spin,
    Empty,
    Tag,
    Statistic
} from 'antd';

import {
    PlusOutlined,
    WalletOutlined,
    AlertOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined
} from '@ant-design/icons';

import { budgetApi } from '../services/budget.service';
import { categoryApi } from '../services/category.service';
import { transactionApi } from '../services/transaction.service';

import type { BudgetProgress } from '../types/budget.type';
import type { Category } from '../types/category.type';
import type { Transaction } from '../types/transaction.type';

const { Title, Text } = Typography;

const BudgetPage = () => {
    const [month, setMonth] = useState<number>(
        new Date().getMonth() + 1
    );

    const [year, setYear] = useState<number>(
        new Date().getFullYear()
    );

    const [progressList, setProgressList] = useState<
        BudgetProgress[]
    >([]);

    const [categories, setCategories] = useState<Category[]>([]);

    const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);

    const [loading, setLoading] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [form] = Form.useForm();

    const {
        totalIncome,
        totalExpense,
        currentBalance
    } = useMemo(() => {

        let income = 0;
        let expense = 0;

        filteredTransactions.forEach((item) => {

            if (item.type === 'INCOME') {
                income += Number(item.amount);
            }

            if (item.type === 'EXPENSE') {
                expense += Number(item.amount);
            }
        });

        return {
            totalIncome: income,
            totalExpense: expense,
            currentBalance: income - expense
        };

    }, [filteredTransactions]);

    const getProgressColor = (percent: number) => {
        if (percent >= 100) return '#cf1322';
        if (percent >= 80) return '#faad14';
        return '#52c41a';
    };

    // =========================================================
    // FETCH DATA
    // =========================================================

    const fetchBudgetData = useCallback(
        async (currentMonth: number, currentYear: number) => {
            try {
                setLoading(true);

                const [budgetRes, transactionRes] =
                    await Promise.all([
                        budgetApi.getBudgetProgress(
                            currentMonth,
                            currentYear
                        ),
                        transactionApi.getAll() as unknown as Promise<{ data: Transaction[] }>
                    ]);

                // =========================
                // Budget Progress
                // =========================

                const budgetData =
                    budgetRes?.data?.data ||
                    budgetRes?.data ||
                    [];

                setProgressList(budgetData);

                // =========================
                // Transaction Filter
                // =========================

                const txData =
                    transactionRes?.data ||
                    [];

                const filtered = txData.filter(
                    (tx: Transaction) => {
                        const txDate = new Date(tx.date);

                        return (
                            txDate.getMonth() + 1 ===
                                currentMonth &&
                            txDate.getFullYear() ===
                                currentYear
                        );
                    }
                );

                setFilteredTransactions(filtered);

            } catch (error: unknown) {
                if (error instanceof Error) {
                    message.error(
                        error.message ||
                            'Lỗi tải dữ liệu ngân sách'
                    );
                }
            } finally {
                setLoading(false);
            }
        },
        []
    );

    // =========================================================
    // FETCH CATEGORY
    // =========================================================

    const fetchCategories = useCallback(async () => {
        try {
            const response =
                await categoryApi.getAll() as unknown as { data: Category[] };

            const list =
                response?.data || [];

            const expenseCategories = list.filter(
                (c: Category) =>
                    c.type === 'EXPENSE'
            );

            setCategories(expenseCategories);

        } catch (error) {
            console.error(error);
        }
    }, []);

    // =========================================================
    // EFFECTS
    // =========================================================

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {

            await Promise.resolve();

            if (isMounted) {
                await fetchBudgetData(month, year);
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };

    }, [month, year, fetchBudgetData]);

    useEffect(() => {
        let isMounted = true;

        const loadCategories = async () => {

            await Promise.resolve();

            if (isMounted) {
                await fetchCategories();
            }
        };

        loadCategories();

        return () => {
            isMounted = false;
        };

    }, [fetchCategories]);

    // =========================================================
    // ADD BUDGET
    // =========================================================

    const handleAdd = () => {
        form.setFieldsValue({
            month,
            year
        });

        setIsModalOpen(true);
    };

    const handleModalOk = async () => {
        try {
            const values =
                await form.validateFields();

            await budgetApi.setupBudget({
                category_id: values.category_id,
                amount_limit: values.amount,
                month: values.month,
                year: values.year
            });

            message.success(
                'Thiết lập ngân sách thành công'
            );

            setIsModalOpen(false);

            form.resetFields();

            fetchBudgetData(month, year);

        } catch (error: unknown) {
            if (error instanceof Error) {
                message.error(
                    error.message ||
                        'Đã có lỗi xảy ra'
                );
            }
        }
    };

    return (
        <div style={{ padding: 24 }}>
            {/* ========================================================= */}
            {/* HEADER */}
            {/* ========================================================= */}

            <div
                style={{
                    display: 'flex',
                    justifyContent:
                        'space-between',
                    alignItems: 'center',
                    marginBottom: 24
                }}
            >
                <div>
                    <Title
                        level={2}
                        style={{ margin: 0 }}
                    >
                        Quản lý ngân sách
                    </Title>

                    <Text type="secondary">
                        Theo dõi tiến độ chi tiêu
                        và lịch sử dòng tiền
                    </Text>
                </div>

                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    onClick={handleAdd}
                    style={{
                        borderRadius: 8
                    }}
                >
                    Thiết lập ngân sách
                </Button>
            </div>

            {/* ========================================================= */}
            {/* FILTER */}
            {/* ========================================================= */}

            <Card
                bordered={false}
                style={{
                    marginBottom: 24,
                    borderRadius: 12,
                    boxShadow:
                        '0 4px 12px rgba(0,0,0,0.05)'
                }}
            >
                <Space size="large">
                    <Space>
                        <Text strong>
                            Tháng:
                        </Text>

                        <Select
                            value={month}
                            onChange={setMonth}
                            style={{
                                width: 120
                            }}
                            options={Array.from(
                                { length: 12 },
                                (_, i) => ({
                                    value: i + 1,
                                    label: `Tháng ${i + 1}`
                                })
                            )}
                        />
                    </Space>

                    <Space>
                        <Text strong>
                            Năm:
                        </Text>

                        <InputNumber
                            value={year}
                            onChange={(val) =>
                                setYear(
                                    val ||
                                        new Date().getFullYear()
                                )
                            }
                        />
                    </Space>
                </Space>
            </Card>

            {/* ========================================================= */}
            {/* CONTENT */}
            {/* ========================================================= */}

            <Row
                gutter={[16, 16]}
                style={{ marginBottom: 24 }}
            >
                <Col xs={24} md={8}>
                    <Card
                        bordered={false}
                        style={{
                            borderRadius: 12,
                            background: '#f6ffed'
                        }}
                    >
                        <Statistic
                            title={`Tổng thu tháng ${month}`}
                            value={totalIncome}
                            precision={0}
                            valueStyle={{
                                color: '#3f8600'
                            }}
                            prefix={<ArrowUpOutlined />}
                            suffix="đ"
                        />
                    </Card>
                </Col>

                <Col xs={24} md={8}>
                    <Card
                        bordered={false}
                        style={{
                            borderRadius: 12,
                            background: '#fff1f0'
                        }}
                    >
                        <Statistic
                            title={`Tổng chi tháng ${month}`}
                            value={totalExpense}
                            precision={0}
                            valueStyle={{
                                color: '#cf1322'
                            }}
                            prefix={<ArrowDownOutlined />}
                            suffix="đ"
                        />
                    </Card>
                </Col>

                <Col xs={24} md={8}>
                    <Card
                        bordered={false}
                        style={{
                            borderRadius: 12,
                            background: '#e6f4ff'
                        }}
                    >
                        <Statistic
                            title="Số dư"
                            value={currentBalance}
                            precision={0}
                            valueStyle={{
                                color:
                                    currentBalance >= 0
                                        ? '#1677ff'
                                        : '#cf1322'
                            }}
                            prefix={<WalletOutlined />}
                            suffix="đ"
                        />
                    </Card>
                </Col>
            </Row>

            <Spin spinning={loading}>
                {/* ========================================================= */}
                {/* BUDGET PROGRESS */}
                {/* ========================================================= */}

                <Title
                    level={4}
                    style={{
                        marginBottom: 16
                    }}
                >
                    <WalletOutlined /> Theo dõi
                    hạn mức
                </Title>

                {progressList.length === 0 ? (
                    <Empty description="Chưa thiết lập ngân sách cho tháng này" />
                ) : (
                    <Row
                        gutter={[16, 16]}
                        style={{
                            marginBottom: 32
                        }}
                    >
                        {progressList.map(
                            (budget) => (
                                <Col
                                    xs={24}
                                    sm={12}
                                    lg={8}
                                    key={budget.id}
                                >
                                    <Card
                                        bordered={false}
                                        style={{
                                            borderRadius: 12,
                                            boxShadow:
                                                '0 4px 12px rgba(0,0,0,0.05)',

                                            borderLeft:
                                                budget.percentage >=
                                                80
                                                    ? `6px solid ${getProgressColor(
                                                          budget.percentage
                                                      )}`
                                                    : 'none'
                                        }}
                                    >
                                        <div
                                            style={{
                                                display:
                                                    'flex',

                                                justifyContent:
                                                    'space-between',

                                                marginBottom: 12
                                            }}
                                        >
                                            <Text
                                                strong
                                                style={{
                                                    fontSize: 16
                                                }}
                                            >
                                                {budget
                                                    .category
                                                    ?.name ||
                                                    String(
                                                        budget.category
                                                    ) ||
                                                    'Không xác định'}
                                            </Text>

                                            {budget.percentage >=
                                                80 && (
                                                <Tag
                                                    color={
                                                        budget.percentage >=
                                                        100
                                                            ? 'red'
                                                            : 'warning'
                                                    }
                                                    icon={
                                                        <AlertOutlined />
                                                    }
                                                >
                                                    {budget.percentage >=
                                                    100
                                                        ? 'VƯỢT MỨC'
                                                        : 'CẢNH BÁO'}
                                                </Tag>
                                            )}
                                        </div>

                                        <div
                                            style={{
                                                display:
                                                    'flex',

                                                justifyContent:
                                                    'space-between',

                                                marginBottom: 8
                                            }}
                                        >
                                            <Text type="secondary">
                                                Đã tiêu
                                            </Text>

                                            <Text strong>
                                                {Number(
                                                    budget.totalSpent
                                                ).toLocaleString(
                                                    'vi-VN'
                                                )}{' '}
                                                /{' '}
                                                {Number(
                                                    budget.amount
                                                ).toLocaleString(
                                                    'vi-VN'
                                                )}{' '}
                                                đ
                                            </Text>
                                        </div>

                                        <Progress
                                            percent={
                                                budget.percentage >
                                                100
                                                    ? 100
                                                    : budget.percentage
                                            }
                                            strokeColor={getProgressColor(
                                                budget.percentage
                                            )}
                                            status={
                                                budget.percentage >=
                                                100
                                                    ? 'exception'
                                                    : 'active'
                                            }
                                            format={(
                                                percent
                                            ) =>
                                                `${percent}%`
                                            }
                                        />
                                    </Card>
                                </Col>
                            )
                        )}
                    </Row>
                )}
            </Spin>

            {/* ========================================================= */}
            {/* MODAL */}
            {/* ========================================================= */}

            <Modal
                title="Thiết lập ngân sách"
                open={isModalOpen}
                onOk={handleModalOk}
                onCancel={() =>
                    setIsModalOpen(false)
                }
                okText="Lưu"
                cancelText="Hủy"
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    style={{
                        marginTop: 16
                    }}
                >
                    <Form.Item
                        name="category_id"
                        label="Danh mục"
                        rules={[
                            {
                                required: true,
                                message:
                                    'Vui lòng chọn danh mục'
                            }
                        ]}
                    >
                        <Select placeholder="Chọn danh mục">
                            {categories.map(
                                (c) => (
                                    <Select.Option
                                        key={c.id}
                                        value={c.id}
                                    >
                                        {c.name}
                                    </Select.Option>
                                )
                            )}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="amount"
                        label="Hạn mức"
                        rules={[
                            {
                                required: true,
                                message:
                                    'Vui lòng nhập số tiền'
                            },

                            {
                                type: 'number',
                                min: 1000,
                                message:
                                    'Tối thiểu 1.000đ'
                            }
                        ]}
                    >
                        <InputNumber
                            style={{
                                width: '100%'
                            }}
                            formatter={(
                                value
                            ) =>
                                `${value}`.replace(
                                    /\B(?=(\d{3})+(?!\d))/g,
                                    ','
                                )
                            }
                            parser={(value) =>
                                value!.replace(
                                    /\$\s?|(,*)/g,
                                    ''
                                )
                            }
                            placeholder="Ví dụ: 5,000,000"
                        />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="month"
                                label="Tháng"
                                rules={[
                                    {
                                        required: true
                                    }
                                ]}
                            >
                                <Select>
                                    {Array.from(
                                        {
                                            length: 12
                                        },
                                        (_, i) => (
                                            <Select.Option
                                                key={
                                                    i +
                                                    1
                                                }
                                                value={
                                                    i +
                                                    1
                                                }
                                            >
                                                Tháng{' '}
                                                {i +
                                                    1}
                                            </Select.Option>
                                        )
                                    )}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                name="year"
                                label="Năm"
                                rules={[
                                    {
                                        required: true
                                    }
                                ]}
                            >
                                <InputNumber
                                    style={{
                                        width: '100%'
                                    }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </div>
    );
};

export default BudgetPage;