import { Products, Category } from '../models/associations.js'
import { validationProduct } from '../schemas/validationProducts.js'
import { Op, Sequelize } from 'sequelize'
import { client } from '../database/redisdatabase.js'

export class ProductsControllers {
  static async getAllProducts (req, res) {
    const { q, category } = req.query
    let whereConditions = {}

    const cacheKey = `products_search:${JSON.stringify(req.query)}`
    const CACHE_EXPIRATION_SECONDS = 600

    const includeConditions = [{
      model: Category,
      as: 'categories',
      attributes: ['id', 'name'],
      through: { attributes: [] }
    }]

    try {
      const getCache = await client.get(cacheKey)
      if (getCache) {
        return res.json(JSON.parse(getCache))
      }

      if (q) {
        const searchLower = q.toLowerCase()

        whereConditions = {
          [Op.or]: [
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('products.name')), { [Op.like]: `%${searchLower}%` }),
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('products.description')), { [Op.like]: `%${searchLower}%` })
          ]
        }
      }

      if (category) {
        const categoryId = Array.isArray(category) ? category : [category]
        const parsedCategoryId = categoryId.map(id => parseInt(id)).filter(id => !isNaN(id))

        if (parsedCategoryId.length > 0) {
          const categoryInclude = includeConditions.find(inc => inc.model === Category)

          if (categoryInclude) {
            categoryInclude.where = { id: { [Op.in]: parsedCategoryId } }
            categoryInclude.required = true
          }
        }
      }

      const getProducts = await Products.findAll({
        where: whereConditions,
        include: includeConditions,
        order: [['name', 'ASC']]
      })

      await client.set(cacheKey, JSON.stringify(getProducts), { EX: CACHE_EXPIRATION_SECONDS })

      return res.json(getProducts)
    } catch (e) {
      return res.status(500).json({ message: e })
    }
  }

  static async getProductId (req, res) {
    const { id } = req.params
    const cacheKey = `product:${id}`

    const cachedProduct = await client.get(cacheKey)

    if (cachedProduct) {
      return res.json(JSON.parse(cachedProduct))
    }

    try {
      const getProductsById = await Products.findByPk(id, {
        include: [{
          model: Category,
          as: 'categories',
          attributes: ['name'],
          through: { attributes: [] }
        }]

      })

      await client.set(cacheKey, JSON.stringify(getProductsById), { EX: 600 })

      return res.json(getProductsById)
    } catch (e) {
      return res.status(500).json({ message: e })
    }
  }

  static async createProduct (req, res) {
    const validateProduct = validationProduct(req.body)

    if (!validateProduct.success) {
      return res.status(500).json({ message: 'Error validation product' })
    }

    const validateData = validateProduct.data
    try {
      const { name, description, price, stock, category } = validateData

      const newProduct = await Products.create({
        name,
        description,
        price,
        stock
      })

      if (category && category.length > 0) {
        const foundCategories = await Category.findAll({ where: { id: category } })

        await newProduct.addCategories(foundCategories)
      }

      await client.del('products_serach:*')

      return res.status(201).json(newProduct)
    } catch (e) {
      return res.status(500).json({ message: e })
    }
  }

  static async updateProduct (req, res) {
    const { id } = req.params

    const validateProduct = validationProduct(req.body)

    if (!validateProduct.success) {
      return res.status(400).json({ message: 'Error validation product' })
    }

    const validateData = validateProduct.data
    try {
      const { name, description, price, stock, category } = validateData

      const updateProduct = await Products.findByPk(id)

      if (!updateProduct) {
        return res.status(404).json({ message: 'Product not found' })
      }

      updateProduct.name = name
      updateProduct.description = description
      updateProduct.price = price
      updateProduct.stock = stock

      await updateProduct.save()

      if (category && category.length > 0) {
        const foundCategories = await Category.findAll({ where: { id: category } })

        await updateProduct.setCategories(foundCategories)
      }

      const updateProductWithCategories = await Products.findByPk(id, {
        include: [{
          model: Category,
          as: 'categories',
          attributes: ['name'],
          through: { attributes: [] }
        }]
      })

      await client.del(`product:${id}`)
      await client.del('products_search:*')

      return res.status(200).json(updateProductWithCategories)
    } catch (e) {
      return res.status(500).json({ message: e })
    }
  }

  static async deleteProduct (req, res) {
    const { id } = req.params

    try {
      await Products.destroy({ where: { id } })

      await client.del('products_search:*')
      await client.del(`product:${id}`)

      return res.status(204).json({ message: 'Deleted' })
    } catch (e) {
      return res.status(500).json({ message: e })
    }
  }
}
