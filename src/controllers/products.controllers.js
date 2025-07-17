import { Products, Category } from '../models/associations.js'
import { validationProduct } from '../schemas/validationProducts.js'

export class ProductsControllers {
  static async getAllProducts (req, res) {
    try {
      const getProducts = await Products.findAll({
        include: [{
          model: Category,
          as: 'categories',
          attributes: ['name'],
          through: { attributes: [] }
        }]
      })

      return res.json(getProducts)
    } catch (e) {
      return res.status(500).json({ message: e })
    }
  }

  static async getProductId (req, res) {
    const { id } = req.params.id

    try {
      const getProductsById = await Products.findByPk(id)

      return res.json(getProductsById)
    } catch (e) {
      return res.status(500).res.json({ message: e })
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

      return res.status(201).json(newProduct)
    } catch (e) {
      return res.status(500).res.json({ message: e })
    }
  }
}
