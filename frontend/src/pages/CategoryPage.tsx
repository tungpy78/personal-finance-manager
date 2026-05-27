import { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Space, Modal, Form, Input, Select, message, Typography, Popconfirm, Row, Col, Statistic } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TagOutlined } from '@ant-design/icons';
import { categoryApi } from '../services/category.service';
import type { Category } from '../types/category.type';
import type { ApiResponse } from '../types/api.type';

const { Title, Text } = Typography;

export const CategoryPage = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [form] = Form.useForm();

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await categoryApi.getAll() as unknown as ApiResponse<Category[]>;
            setCategories(response.data);
        } catch (error: any) {
            message.error(error?.message || 'Lỗi khi lấy danh sách danh mục');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAdd = () => {
        setEditingCategory(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (record: Category) => {
        setEditingCategory(record);
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await categoryApi.delete(id);
            message.success('Xóa danh mục thành công');
            fetchCategories();
        } catch (error: any) {
            message.error(error?.message || 'Không thể xóa danh mục này');
        }
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingCategory) {
                await categoryApi.update(editingCategory.id, values);
                message.success('Cập nhật danh mục thành công');
            } else {
                await categoryApi.create(values);
                message.success('Thêm danh mục thành công');
            }
            setIsModalOpen(false);
            fetchCategories();
        } catch (error: any) {
            message.error(error?.message || 'Đã có lỗi xảy ra, vui lòng thử lại');
        }
    };

    const columns = [
        {
            title: 'Tên danh mục',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => (
                <Space>
                    <TagOutlined style={{ color: '#1677ff' }} />
                    <Text strong>{text}</Text>
                </Space>
            ),
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            render: (type: 'INCOME' | 'EXPENSE') => (
                <Tag color={type === 'INCOME' ? 'green' : 'volcano'}>
                    {type === 'INCOME' ? 'THU NHẬP' : 'CHI TIÊU'}
                </Tag>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: Category) => (
                <Space size="middle">
                    <Button 
                        type="text" 
                        icon={<EditOutlined />} 
                        onClick={() => handleEdit(record)}
                        style={{ color: '#1677ff' }}
                    />
                    <Popconfirm
                        title="Xóa danh mục?"
                        description="Bạn có chắc chắn muốn xóa danh mục này không?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button 
                            type="text" 
                            danger 
                            icon={<DeleteOutlined />} 
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const incomeCount = categories.filter(c => c.type === 'INCOME').length;
    const expenseCount = categories.filter(c => c.type === 'EXPENSE').length;

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <Title level={2} style={{ margin: 0 }}>Quản lý danh mục</Title>
                    <Text type="secondary">Phân loại các khoản thu chi của bạn</Text>
                </div>
                <Button type="primary" icon={<PlusOutlined />} size="large" onClick={handleAdd} style={{ borderRadius: 8 }}>
                    Thêm danh mục
                </Button>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12}>
                    <Card bordered={false} className="stat-card" style={{ background: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)', borderRadius: 12 }}>
                        <Statistic 
                            title="Danh mục Thu nhập" 
                            value={incomeCount} 
                            valueStyle={{ color: '#3f8600' }} 
                            prefix={<TagOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12}>
                    <Card bordered={false} className="stat-card" style={{ background: 'linear-gradient(135deg, #fff1f0 0%, #ffccc7 100%)', borderRadius: 12 }}>
                        <Statistic 
                            title="Danh mục Chi tiêu" 
                            value={expenseCount} 
                            valueStyle={{ color: '#cf1322' }} 
                            prefix={<TagOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <Table 
                    columns={columns} 
                    dataSource={categories} 
                    rowKey="id" 
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title={editingCategory ? "Cập nhật danh mục" : "Thêm danh mục mới"}
                open={isModalOpen}
                onOk={handleModalOk}
                onCancel={() => setIsModalOpen(false)}
                okText={editingCategory ? "Cập nhật" : "Thêm mới"}
                cancelText="Hủy"
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    style={{ marginTop: 16 }}
                    initialValues={{ type: 'EXPENSE' }}
                >
                    <Form.Item
                        name="name"
                        label="Tên danh mục"
                        rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
                    >
                        <Input placeholder="Ví dụ: Ăn uống, Tiền lương..." />
                    </Form.Item>
                    <Form.Item
                        name="type"
                        label="Loại"
                        rules={[{ required: true }]}
                    >
                        <Select>
                            <Select.Option value="EXPENSE">Chi tiêu</Select.Option>
                            <Select.Option value="INCOME">Thu nhập</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            <style>{`
                .stat-card .ant-statistic-title {
                    font-size: 16px;
                    font-weight: 500;
                }
            `}</style>
        </div>
    );
};
