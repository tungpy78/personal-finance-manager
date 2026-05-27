export const formatVND = (amount: number | string) => {
    return Number(amount).toLocaleString('vi-VN') + ' đ';
};