import fastify from 'fastify'
import cors from '@fastify/cors'
import { stocksRoutes } from './routes/stocks'

const app = fastify()

app.register(cors)

app.register(stocksRoutes, {
  prefix: 'estoques'
})

app
  .listen({
    port: 3333
  })
  .then(() => {
    console.log('HTTP Server Running!')
  })
