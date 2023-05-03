import { FastifyRequest } from 'fastify'
import { z } from 'zod'
import { knex } from '../../database/protheus'

export async function averageRoutes(request: FastifyRequest) {
  const getAverageQueryParamsSchema = z.object({
    filial: z.string().optional(),
    produto: z.string().optional()
  })

  const { filial, produto } = getAverageQueryParamsSchema.parse(request.query)

  const query = knex
    .select(
      knex.raw('RTRIM(SB3.B3_COD) AS CODIGO'),
      'SB3.B3_Q01 AS Q01',
      'SB3.B3_Q02 AS Q02',
      'SB3.B3_Q03 AS Q03',
      'SB3.B3_Q04 AS Q04',
      'SB3.B3_Q05 AS Q05',
      'SB3.B3_Q06 AS Q06',
      'SB3.B3_Q07 AS Q07',
      'SB3.B3_Q08 AS Q08',
      'SB3.B3_Q09 AS Q09',
      'SB3.B3_Q10 AS Q10',
      'SB3.B3_Q11 AS Q11',
      'SB3.B3_Q12 AS Q12'
    )
    .from(knex.raw('SB3010 AS SB3 WITH (NOLOCK)'))
    .where('B3_FILIAL', filial)
    .where('B3_COD', produto)
    .where('D_E_L_E_T_', '')

  const average = await query

  return average
}
