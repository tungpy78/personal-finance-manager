import { useEffect, useMemo, useState } from 'react';
import { Card, Row, Col, Statistic, List, Avatar, Typography, Tag, message } from 'antd';
import { PlusOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { FloatButton } from 'antd';
import { FormThemGiaoDich } from './FormThemGiaoDich';
import type { Transaction } from '../types/transaction.type';
import { transactionApi } from '../services/transaction.service';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../types/api.type';
import { formatVND } from '../utils/formatVND';

const { Text, Title } = Typography;

export const TransactionPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [transaction, setTransaction] = useState<Transaction[]>([]);
    
    const fetchData = async () => {
        try {
            setLoading(true);
            const response: any = await transactionApi.getAll();
            const listData = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
            setTransaction(listData); 
        } catch (error) {
            const err = error as AxiosError<ApiErrorResponse>;
            message.error(err.message);
        } finally {
            setLoading(false);
        }
    }; 

    useEffect(() => {
        fetchData();
    }, []);

    
    const { totalIncome, totalExpense, currentBalance } = useMemo(() => {
        let income = 0; let expense = 0;
        transaction.forEach(item => {
            if (item.type === 'INCOME') income += Number(item.amount);
            else if (item.type === 'EXPENSE') expense += Number(item.amount);
        });
        return { totalIncome: income, totalExpense: expense, currentBalance: income - expense };
    }, [transaction]);

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
       
            <Card title="Lịch sử giao dịch" bordered={false} style={{ borderRadius: 12 }}>
                <List
                    itemLayout="horizontal"
                    loading={loading}
                    dataSource={transaction}
                    renderItem={(item) => (
                        <List.Item
                            style={{ padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}
                            extra={<Title level={4} style={{ color: item.type === 'INCOME' ? '#3f8600' : '#cf1322', margin: 0 }}>{item.type === 'INCOME' ? '+' : '-'}{formatVND(item.amount)}</Title>}
                        >
                            <List.Item.Meta
                                avatar={<Avatar size="large" style={{ backgroundColor: item.type === 'INCOME' ? '#d9f7be' : '#ffd8bf', color: '#000' }} icon={item.type === 'INCOME' ? <ArrowUpOutlined /> : <ArrowDownOutlined />} />}
                                title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Text strong style={{ fontSize: 16 }}>{item.description}</Text><Tag color="blue">{item.categoryId}</Tag></div>}
                                description={<Text type="secondary">{item.date}</Text>}
                            />
                        </List.Item>
                    )}
                />
            </Card>

            <FloatButton icon={<PlusOutlined />} type="primary" style={{ right: 24, bottom: 24, width: 56, height: 56 }} tooltip="Thêm giao dịch mới" onClick={() => setIsModalOpen(true)} />
            
            <FormThemGiaoDich 
                open={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={() => { fetchData(); }} 
            />
        </div>
    );
};