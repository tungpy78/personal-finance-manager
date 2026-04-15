import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database.js';

class Category extends Model {
  declare id: number;
  declare name: string;
  declare type: string; // 'INCOME' hoặc 'EXPENSE'
}

Category.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  type: { type: DataTypes.ENUM('INCOME', 'EXPENSE'), allowNull: false },
}, { 
  sequelize, 
  tableName: 'Categories',
  timestamps: true 
});

export default Category;