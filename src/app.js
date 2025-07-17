import express from 'express'
import { routesProducts } from './routes/products.routes.js'
import { sequelize } from './database/database.js'

const app = express()
const PORT = process.env.PORT ?? 3000

app.use(express.json())
app.use(routesProducts)

try {
  await sequelize.sync({ force: true })
} catch (e) {
  throw new Error(e)
}

app.get('/', (req, res) => {
  res.send('hola mundo')
})

app.listen(PORT, () => {
  console.log('Your server is running')
})
