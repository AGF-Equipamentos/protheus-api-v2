import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { whereInGenerator } from '../utils/whereInGenerator'

export async function stocksRoutes(app: FastifyInstance) {
  app.get('/', async (request) => {
    const getStocksQueryParamsSchema = z.object({
      filial: z.string().or(z.string().array()).optional(),
      produto: z.string().or(z.string().array()).optional(),
      grupo: z.string().or(z.string().array()).optional(),
      armazem: z.string().or(z.string().array()).optional()
    })

    const { filial, produto, grupo, armazem } =
      getStocksQueryParamsSchema.parse(request.query)

    const query = knex
      .select('FILIAL', 'PRODUTO', 'DESCRICAO', 'SALDO', 'ARMAZEM')
      .from(knex.raw('SALDO_ESTOQUE WITH (NOLOCK)'))
      .where('SALDO', '>', 0)
      .orderBy('PRODUTO')

    const modifyConditions = {
      GRUPO: grupo,
      FILIAL: filial,
      PRODUTO: produto,
      ARMAZEM: armazem
    }

    for (const [column, value] of Object.entries(modifyConditions)) {
      query.modify(whereInGenerator, { column, value })
    }

    const stocks = await query

    return stocks
  })
}
