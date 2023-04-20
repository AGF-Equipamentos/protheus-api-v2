import { FastifyInstance } from 'fastify'
import { stocksRoutes } from '../controllers/stocks'
import { purchaseOrdersRoutes } from '../controllers/purchaseOrders'

export async function appRoutes(app: FastifyInstance) {
  app.get('/estoques', stocksRoutes)
  app.get('/pcs', purchaseOrdersRoutes)
}