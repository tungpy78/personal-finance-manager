import User from './User.js';
import Category from './Category.js';
import Transaction from './Transaction.js';
import sequelize from '../../config/database.js';
import Budget from './Budget.js';

// 1 User có nhiều Transactions (1-N)
User.hasMany(Transaction, { foreignKey: 'user_id', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 1 Category có nhiều Transactions (1-N)
Category.hasMany(Transaction, { foreignKey: 'category_id', as: 'transactions' });
Transaction.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// --- QUAN HỆ MỚI CHO BẢNG BUDGET ---

// 1 User có thể thiết lập nhiều Budgets (1-N)
User.hasMany(Budget, { foreignKey: 'user_id', as: 'budgets' });
Budget.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 1 Category có thể có nhiều Budgets (ở các tháng khác nhau) (1-N)
Category.hasMany(Budget, { foreignKey: 'category_id', as: 'budgets' });
Budget.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

export { User, Category, Transaction, sequelize };