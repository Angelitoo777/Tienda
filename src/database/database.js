import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'
dotenv.config()

export const sequelize = new Sequelize('tienda_db', 'root', '', {
  host: process.env.HOST ?? 'localhost',
  dialect: 'mysql'
})
