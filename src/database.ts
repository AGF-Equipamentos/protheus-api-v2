import 'dotenv/config'
import { knex as setupKnex } from 'knex'

export const knex = setupKnex({
  client: 'mssql',
  connection: {
    user: process.env.PROTHEUS_USER,
    password: process.env.PROTHEUS_PASSWORD,
    server: process.env.PROTHEUS_SERVER,
    database: process.env.PROTHEUS_DATABASE,
    options: {
      instanceName: process.env.PROTHEUS_INSTANCE_NAME
    }
  }
})
