export const mockCategories = [
    { id: 1, name: 'Ăn uống', type: 'EXPENSE', icon: 'food', color: '#FF5733' },
    { id: 2, name: 'Di chuyển', type: 'EXPENSE', icon: 'transport', color: '#33FF57' },
    { id: 3, name: 'Lương', type: 'INCOME', icon: 'salary', color: '#3357FF' },
    { id: 4, name: 'Thưởng', type: 'INCOME', icon: 'bonus', color: '#F333FF' },
];

export const mockCategoryFilters = {
    empty: {},
    keyword: { keyword: 'Ăn' },
    type: { type: 'EXPENSE' },
};
