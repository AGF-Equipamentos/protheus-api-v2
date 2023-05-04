import { FastifyRequest } from 'fastify'
import { z } from 'zod'
import { knex } from '../../database/protheus'

export async function productionOrdersRoutes(request: FastifyRequest) {
  const getProductionOrdersQueryParamsSchema = z.object({
    filial: z.string().optional(),
    obs: z.string().optional(),
    produto: z.string().or(z.string().array()).optional(),
    opnumber: z.string().optional(),
    fechado: z.string().optional(),
    ano: z.string().optional(),
    mes: z.string().optional()
  })

  const { filial, obs, produto, opnumber, fechado, ano, mes } =
    getProductionOrdersQueryParamsSchema.parse(request.query)

  const query = knex
    .select(
      knex.raw(`
        RTRIM(SC2.C2_PRODUTO) AS PRODUTO,
        RTRIM(SB1.B1_DESC) AS DESCRICAO,
        SC2.C2_NUM + SC2.C2_ITEM + SC2.C2_SEQUEN AS OP,
        RTRIM(SC2.C2_CC) AS CC,
        SC2.C2_QUANT AS QTD,
        CONCAT(SUBSTRING(SC2.C2_DATPRI,7,2),'/',SUBSTRING(SC2.C2_DATPRI,5,2),'/',SUBSTRING(SC2.C2_DATPRI,1,4)) AS DAT_INI,
        CONCAT(SUBSTRING(SC2.C2_DATPRF,7,2),'/',SUBSTRING(SC2.C2_DATPRF,5,2),'/',SUBSTRING(SC2.C2_DATPRF,1,4)) AS DAT_FIM,
        CONCAT(SUBSTRING(SC2.C2_DATRF,7,2),'/',SUBSTRING(SC2.C2_DATRF,5,2),'/',SUBSTRING(SC2.C2_DATRF,1,4)) AS DAT_REAL,
        SUBSTRING(SC2.C2_DATRF,5,2) AS MES_REAL,
        SUBSTRING(SC2.C2_DATRF,1,4) AS ANO_REAL,
        RTRIM(SC2.C2_OBS) AS OBS,
        CONCAT(SUBSTRING(SC2.C2_EMISSAO,7,2),'/',SUBSTRING(SC2.C2_EMISSAO,5,2),'/',SUBSTRING(SC2.C2_EMISSAO,1,4)) AS DAT_EMI,
        SC2.C2_QUJE AS QTD_PRO
      `)
    )
    .from(
      knex.raw(`
        SC2010 AS SC2 WITH (NOLOCK) LEFT OUTER JOIN
        SB1010 AS SB1 WITH (NOLOCK) ON SB1.D_E_L_E_T_ = '' AND SB1.B1_COD = SC2.C2_PRODUTO`)
    )
    .modify((query) => {
      if (filial) {
        query.where('SC2.C2_FILIAL', filial)
      }
      if (produto) {
        // to-do
        query.where(knex.raw(`SC2.C2_PRODUTO IN ('${produto}')`))
      }
      if (obs) {
        query.whereLike('SC2.C2_OBS', `%${obs}%`)
      }
      if (fechado === 'true') {
        query.where('SC2.C2_DATRF', '<>', '')
      } else if (fechado === 'false') {
        query.where('SC2.C2_DATRF', '=', '')
      }
      if (opnumber) {
        query.where('SC2.C2_NUM', opnumber.slice(0, 6))
        query.where('SC2.C2_ITEM', opnumber.slice(6, 8))
        query.where('SC2.C2_SEQUEN', opnumber.slice(8, 11))
      }
      if (mes) {
        query.where(knex.raw(`SUBSTRING(SC2.C2_DATRF,5,2) = '${mes}'`))
      }
      if (ano) {
        query.where(knex.raw(`SUBSTRING(SC2.C2_DATRF,1,4) = '${ano}'`))
      }
    })
    .where('SC2.D_E_L_E_T_', '')
    .orderBy(['SC2.C2_DATPRI'])

  const productionOrders = await query

  return productionOrders
}
