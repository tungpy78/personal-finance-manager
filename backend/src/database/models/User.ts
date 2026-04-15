import { DataTypes, Model, type CreationOptional } from 'sequelize';
import sequelize from '../../config/database.js';

class User extends Model {
  declare id: CreationOptional<number>;
  declare username: string;
  declare email: string;
  declare password: string;
}

User.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  email: { 
    type: DataTypes.STRING(100), 
    allowNull: false, 
    unique: true,
    validate: {
      isEmail: true // SQA: Chốt chặn không cho phép nhập sai định dạng email (vd: thiếu @)
    }
  },
  password: { type: DataTypes.STRING(255), allowNull: false },
}, { 
  sequelize, 
  tableName: 'Users',
  timestamps: true 
});

export default User;