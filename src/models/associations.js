import { Products } from './products.models.js'
import { Category } from './category.models.js'

Products.belongsToMany(Category, {
  through: 'products_category',
  foreignKey: 'products_id',
  otherKey: 'category_id',
  as: 'categories'
})

Category.belongsToMany(Products, {
  through: 'products_category',
  foreignKey: 'category_id',
  otherKey: 'products_id',
  as: 'products'
})

export { Products, Category }
