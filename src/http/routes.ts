import { FastifyInstance } from 'fastify'
import { stocks } from './controllers/stocks'
import { purchaseOrders } from './controllers/purchaseOrders'
import { average } from './controllers/average'
import { register } from './controllers/register'
import { requestPurchaseOrders } from './controllers/requestPurchaseOrders'
import { productionOrders } from './controllers/productionOrders'

export async function appRoutes(app: FastifyInstance) {
  app.get('/estoques', stocks)
  app.get('/pcs', purchaseOrders)
  app.get('/average', average)
  app.get('/register', register)
  app.get('/scs', requestPurchaseOrders)
  app.get('/ops', productionOrders)
}
