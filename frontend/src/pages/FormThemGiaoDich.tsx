import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Input, InputNumber, Select, DatePicker, Button, message, Modal } from 'antd';
import dayjs from 'dayjs'; // Thư viện xử lý ngày tháng chuẩn của AntD
import { transactionSchema, type TransactionFormValues } from '../utils/schemas/transaction.schema';
import { categoryApi } from '../services/category.service';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse, ApiResponse } from '../types/api.type';
import type { Category } from '../types/category.type';
import { transactionApi } from '../services/transaction.service';
import type { Transaction } from '../types/transaction.type';

interface FormThemGiaoDichProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editData?: Transaction | null;
}

export const FormThemGiaoDich = ({ open, onClose, onSuccess, editData}: FormThemGiaoDichProps) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    

     const fetchCategories = async () => {
        setLoadingCategories(true);
        try {
            const { data } = await categoryApi.getAll() as unknown as ApiResponse<Category[]>; 
            console.log("categoty", data) 
            setCategories(data);
        } catch (error) {
            const err = error as AxiosError<ApiErrorResponse>
            message.error(err.message);
        } finally {
            setLoadingCategories(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);


    const { control, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<TransactionFormValues>({
        resolver: zodResolver(transactionSchema), 
        defaultValues: {
            amount: 0,
            type: 'EXPENSE',
            description: ''
        } as Partial<TransactionFormValues>
    });

    useEffect(() => {
        if (editData) {
            reset({
                amount: editData.amount,
                categoryId: editData.categoryId,
                date: editData.date,
                description: editData.description,
                type: editData.type
            });
        } else {
            reset({
                amount: 0,
                type: 'EXPENSE',
                description: ''
            });
        }
    }, [editData, reset]);

    const onSubmit = async (data: TransactionFormValues) => {
    try {

        if (editData) {

            const response  = await transactionApi.update(editData.id, data)

            const alerts = response.data.budgetAlerts || [];

            let hasDanger = false;

            alerts.forEach(alert => {

                if (alert.level === 'DANGER') {
                    message.error(`Cảnh báo: ${alert.message}`, 5);
                    hasDanger = true;
                }

                else if (alert.level === 'WARNING') {
                    message.warning(`Chú ý: ${alert.message}`, 5);
                }

            });

            if (!hasDanger) {
                message.success('Cập nhật giao dịch thành công!');
            }

        } else {

            const response = await transactionApi.create(data)

            if (response.data.budgetAlert) {

                const alert = response.data.budgetAlert;

                if (alert.level === 'DANGER') {
                    message.error(`Cảnh báo: ${alert.message}`, 5);
                }

                else if (alert.level === 'WARNING') {
                    message.warning(`Chú ý: ${alert.message}`, 5);
                }

            } else {
                message.success('Thêm giao dịch thành công!');
            }
        }

        reset();
        onSuccess();
        onClose();

    } catch (error) {

        const err = error as AxiosError<ApiErrorResponse>;

        message.error(
            err.response?.data?.message ||
            'Có lỗi xảy ra'
        );
    }
};

    const selectedType = watch('type');
    
    const filteredCategories = categories.filter(cat => cat.type === selectedType);

    return (
        <Modal open={open} onCancel={onClose} footer={null} title={editData ? 'Cập nhật giao dịch' : 'Thêm giao dịch'}>
            <Form layout="vertical" onFinish={handleSubmit(onSubmit)} style={{ maxWidth: 400 }}>
            
            <Form.Item 
                label="Số tiền" 
                validateStatus={errors.amount ? 'error' : ''} 
                help={errors.amount?.message}
            >
                <Controller
                    name="amount"
                    control={control}
                    render={({ field }) => (
                        <InputNumber {...field} style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                    )}
                />
            </Form.Item>

            <Form.Item 
                label="Loại giao dịch" 
                validateStatus={errors.type ? 'error' : ''} 
                help={errors.type?.message}
            >
                <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                        <Select {...field} options={[
                            { value: 'INCOME', label: 'Thu nhập' },
                            { value: 'EXPENSE', label: 'Chi tiêu' }
                        ]} />
                    )}
                />
            </Form.Item>

            <Form.Item 
                label="Danh mục" 
                validateStatus={errors.categoryId ? 'error' : ''} 
                help={errors.categoryId?.message}
            >
                <Controller
                    name="categoryId"
                    control={control}
                    render={({ field }) => (
                        <Select 
                            {...field} 
                            placeholder="Chọn danh mục" 
                            loading={loadingCategories} // Hiển thị vòng xoay lúc đang gọi API
                            options={filteredCategories.map(cat => ({ value: cat.id, label: cat.name }))}
                        />
                    )}
                />
            </Form.Item>

            <Form.Item 
                label="Ngày giao dịch" 
                validateStatus={errors.date ? 'error' : ''} 
                help={errors.date?.message}
            >
                <Controller
                    name="date"
                    control={control}
                    render={({ field }) => (
                        <DatePicker 
                            style={{ width: '100%' }} 
                            format="YYYY-MM-DD"
                            
                            value={field.value ? dayjs(field.value) : null}
                            
                            onChange={(_, dateString) => field.onChange(dateString)}
                        />
                    )}
                />
            </Form.Item>

            <Form.Item 
                label="Mô tả" 
                validateStatus={errors.description ? 'error' : ''} 
                help={errors.description?.message}
            >
                <Controller
                    name="description"
                    control={control}
                    render={({ field }) => <Input.TextArea {...field} rows={3} />}
                />
            </Form.Item>

            <Button type="primary" htmlType="submit" loading={isSubmitting} block>
                {editData ? 'Cập nhật' : 'Lưu giao dịch'}
            </Button>
        </Form>
        </Modal>
    );
};