import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { KnexStocksRepository } from '../../repositories/knex/knex-stocks-repository'
import { FetchStocksUseCase } from '../../use-cases/fetch-stocks'

export async function stocks(request: FastifyRequest, reply: FastifyReply) {
  const getStocksQueryParamsSchema = z.object({
    filial: z.string().or(z.string().array()).optional(),
    produto: z.string().or(z.string().array()).optional(),
    grupo: z.string().or(z.string().array()).optional(),
    armazem: z.string().or(z.string().array()).optional()
  })

  const { filial, produto, grupo, armazem } = getStocksQueryParamsSchema.parse(
    request.query
  )

  const knexStocksRepository = new KnexStocksRepository()
  const fetchStocksUseCase = new FetchStocksUseCase(knexStocksRepository)

  const stocks = await fetchStocksUseCase.execute({
    filial,
    produto,
    grupo,
    armazem
  })

  return stocks
}
