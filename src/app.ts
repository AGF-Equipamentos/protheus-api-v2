import fastify from 'fastify'
import cors from '@fastify/cors'
import qs from 'qs'
import { appRoutes } from './http/routes/routes'

export const app = fastify({
  querystringParser: (str) => qs.parse(str)
})

app.register(cors)

app.register(appRoutes)
