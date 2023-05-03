import { FastifyInstance } from 'fastify'
import { stocksRoutes } from '../controllers/stocks'
import { purchaseOrdersRoutes } from '../controllers/purchaseOrders'
import { averageRoutes } from '../controllers/average'
import { registerRoutes } from '../controllers/register'

export async function appRoutes(app: FastifyInstance) {
  app.get('/estoques', stocksRoutes)
  app.get('/pcs', purchaseOrdersRoutes)
  app.get('/average', averageRoutes)
  app.get('/register', registerRoutes)
}
