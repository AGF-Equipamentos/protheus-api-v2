import { FastifyRequest } from 'fastify'
import { z } from 'zod'
import { knex } from '../../database/protheus'
import { whereInGenerator } from '../../utils/whereInGenerator'

export async function registerRoutes(request: FastifyRequest) {
  const getRegisterQueryParamsSchema = z.object({
    filial: z.string().optional(),
    produto: z.string().or(z.string().array()).optional(),
    top: z.coerce.number().optional(),
    busca_cod_produto: z.string().optional(),
    busca_desc_produto: z.string().optional()
  })

  const { filial, produto, top, busca_cod_produto, busca_desc_produto } =
    getRegisterQueryParamsSchema.parse(request.query)

  const query = knex
    .select(
      knex.raw('RTRIM(SB1.B1_COD) AS CODIGO'),
      knex.raw('RTRIM(SB1.B1_DESC) AS DESCRICAO'),
      knex.raw('RTRIM(SB1.B1_ZZLOCA) AS LOCACAO'),
      'SB1.B1_GRUPO AS GRUPO',
      'SB1.B1_EMIN AS PP',
      'SB1.B1_LE AS LE',
      'SB1.B1_UM AS UM',
      'SB1.B1_ESTSEG AS ESTSEG',
      'SB1.B1_APROPRI AS APROPRI',
      knex.raw(
        'CASE WHEN B1_MSBLQL = 1 THEN CAST(1 AS BIT) WHEN B1_MSBLQL = 2 THEN CAST(0 AS BIT) END AS BLOQUEADO'
      )
    )
    .from(knex.raw('SB1010 AS SB1 WITH (NOLOCK)'))
    .modify((query) => {
      if (top) {
        query.limit(top)
      }
      if (filial) {
        query.where('B1_FILIAL', filial.slice(0, 2))
      }
      if (busca_cod_produto) {
        query.whereLike('B1_COD', `%${busca_cod_produto.toUpperCase()}%`)
      }
      if (busca_desc_produto) {
        query.whereLike('B1_DESC', `%${busca_desc_produto.toUpperCase()}%`)
      }
    })
    .where('D_E_L_E_T_', '')

  const modifyConditions = {
    B1_COD: produto
  }

  for (const [column, value] of Object.entries(modifyConditions)) {
    query.modify(whereInGenerator, { column, value })
  }

  const register = await query

  return register
}
