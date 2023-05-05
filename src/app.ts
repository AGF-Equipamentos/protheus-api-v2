import fastify from 'fastify'
import cors from '@fastify/cors'
import qs from 'qs'
import { appRoutes } from './http/routes'
import { ZodError } from 'zod'
import { env } from './env'
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: env.SENTRY_DSN,
  tracesSampleRate: 1.0
})

export const app = fastify({
  querystringParser: (str) => qs.parse(str)
})

app.register(cors)

app.register(appRoutes)

app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    return reply
      .status(400)
      .send({ message: 'Validation error.', issues: error.format() })
  }

  if (env.NODE_ENV !== 'production') {
    console.error(error)
  } else {
    Sentry.captureException(error)
  }

  return reply.status(500).send({ message: 'Internal server error.' })
})
