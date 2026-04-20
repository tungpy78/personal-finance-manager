import { DataTypes, Model, type CreationOptional } from 'sequelize';
import sequelize from '../../config/database.js';

class Budget extends Model {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare categoryId: number;
  declare amount: number; // Số tiền ngân sách đặt ra
  declare month: number;  // Tháng áp dụng
  declare year: number;   // Năm áp dụng
}

Budget.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    field: 'user_id'
  },
  categoryId: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    field: 'category_id'
  },
  amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  month: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    validate: { min: 1, max: 12 } // SQA: Chặn dữ liệu tháng phi logic
  },
  year: { type: DataTypes.INTEGER, allowNull: false },
}, { 
  sequelize, 
  tableName: 'Budgets',
  timestamps: true,
  // Đảm bảo 1 user chỉ có 1 ngân sách cho 1 danh mục trong 1 tháng cụ thể
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'category_id', 'month', 'year']
    }
  ]
});

export default Budget;