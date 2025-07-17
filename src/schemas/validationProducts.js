import { z } from 'zod'

const validateProduct = z.object({
  name: z.string({
    required_error: 'Name of the product is required',
    invalid_type_error: 'Name of the product must be string'
  }).min(3),
  description: z.string({
    required_error: 'Description of the product is required',
    invalid_type_error: 'Description of the product must be string'
  }).min(10),
  price: z.number({
    required_error: 'Price of the product is required',
    invalid_type_error: 'Price of the product must be number'
  }).positive(),
  stock: z.number({
    required_error: 'Stock of the product is required',
    invalid_type_error: 'Stock of the product must be number'
  }).int(),
  category: z.array(
    z.number().int().positive().min(1)
  )
})

export function validationProduct (data) {
  return validateProduct.safeParse(data)
}
