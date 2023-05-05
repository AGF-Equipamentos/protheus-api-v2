import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'test', 'production']).default('dev'),
  PORT: z.coerce.number().default(3333),
  PROTHEUS_USER: z.string(),
  PROTHEUS_PASSWORD: z.string(),
  PROTHEUS_SERVER: z.string(),
  PROTHEUS_DATABASE: z.string(),
  PROTHEUS_INSTANCE_NAME: z.string(),
  SENTRY_DSN: z.string()
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('Invalid environment variables', _env.error.format())

  throw new Error('Invalid environment variables.')
}

export const env = _env.data
