import 'dotenv/config'
import { knex as setupKnex } from 'knex'
import { env } from '../env'

export const knex = setupKnex({
  client: 'mssql',
  connection: {
    user: env.PROTHEUS_USER,
    password: env.PROTHEUS_PASSWORD,
    server: env.PROTHEUS_SERVER,
    database: env.PROTHEUS_DATABASE,
    options: {
      instanceName: env.PROTHEUS_INSTANCE_NAME
    }
  }
})
