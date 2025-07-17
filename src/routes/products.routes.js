import { Router } from 'express'
import { ProductsControllers } from '../controllers/products.controllers.js'

export const routesProducts = Router()

routesProducts.get('/products', ProductsControllers.getAllProducts)
routesProducts.get('/products/:id', ProductsControllers.getProductId)

routesProducts.post('/products', ProductsControllers.createProduct)
routesProducts.patch('/products/:id', ProductsControllers.updateProduct)
routesProducts.delete('/products/:id', ProductsControllers.deleteProduct)
