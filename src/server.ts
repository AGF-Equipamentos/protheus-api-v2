import fastify from 'fastify'
import cors from '@fastify/cors'
import qs from 'qs'
import { stocksRoutes } from './routes/stocks'

const app = fastify({
  querystringParser: (str) => qs.parse(str)
})

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
