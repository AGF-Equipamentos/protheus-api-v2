import { FastifyRequest } from 'fastify'
import { z } from 'zod'
import { knex } from '../../database/protheus'
import { whereInGenerator } from '../../utils/whereInGenerator'

export async function requestPurchaseOrdersRoutes(request: FastifyRequest) {
  const getRegisterQueryParamsSchema = z.object({
    filial: z.string().optional(),
    produto: z.string().or(z.string().array()).optional(),
    sc: z.string().optional(),
    aberto: z.coerce.boolean().optional().default(false)
  })

  const { filial, produto, sc, aberto } = getRegisterQueryParamsSchema.parse(
    request.query
  )

  const query = knex
    .select(
      `SC1.C1_NUM AS SC`,
      `SC1.C1_ITEM AS ITEM`,
      knex.raw(
        `CONCAT(SUBSTRING(SC1.C1_EMISSAO,7,2),'/',SUBSTRING(SC1.C1_EMISSAO,5,2),'/',SUBSTRING(SC1.C1_EMISSAO,1,4)) AS EMISSAO`
      ),
      knex.raw(`RTRIM(SC1.C1_PRODUTO) AS PRODUTO`),
      knex.raw(`RTRIM(SC1.C1_DESCRI) AS DESCRICAO`),
      `SC1.C1_UM AS UM`,
      `SC1.C1_QUANT AS QTD`,
      `SC1.C1_QUJE AS QTD_ENT`,
      knex.raw(`SC1.C1_QUANT - SC1.C1_QUJE AS SALDO`),
      knex.raw(`RTRIM(SC1.C1_OBS) AS OBS`),
      knex.raw(
        `CONCAT(SUBSTRING(SC1.C1_DATPRF,7,2),'/',SUBSTRING(SC1.C1_DATPRF,5,2),'/',SUBSTRING(SC1.C1_DATPRF,1,4)) AS ENTREGA`
      ),
      `SC1.C1_PEDIDO AS PC`,
      knex.raw(
        `CONCAT(SUBSTRING(SC7.C7_DATPRF,7,2),'/',SUBSTRING(SC7.C7_DATPRF,5,2),'/',SUBSTRING(SC7.C7_DATPRF,1,4)) AS PC_ENTREGA`
      ),
      knex.raw(`RTRIM(SC1.C1_OP) AS OP`)
    )
    .from(
      knex.raw(`
      SC1010 AS SC1 WITH (NOLOCK) LEFT OUTER JOIN
      SC7010 AS SC7 WITH (NOLOCK) ON SC7.D_E_L_E_T_ = '' AND ((SC7.C7_NUM = SC1.C1_PEDIDO) AND (SC7.C7_ITEM = SC1.C1_ITEMPED))`)
    )
    .modify((query) => {
      if (filial) {
        query.where('SC1.C1_FILIAL', filial)
      }
      if (sc) {
        query.where('SC1.C1_NUM', sc)
      }
      if (aberto) {
        query.where(knex.raw('SC1.C1_QUANT <> SC1.C1_QUJE'))
      }
    })
    .where('SC1.C1_RESIDUO', '')
    .where('SC1.D_E_L_E_T_', '')
    .orderBy(['SC1.C1_DATPRF', 'SC1.C1_NUM', 'SC1.C1_ITEM'])

  const modifyConditions = {
    'SC1.C1_PRODUTO': produto
  }

  for (const [column, value] of Object.entries(modifyConditions)) {
    query.modify(whereInGenerator, { column, value })
  }

  const requestPurchaseOrders = await query

  return requestPurchaseOrders
}
