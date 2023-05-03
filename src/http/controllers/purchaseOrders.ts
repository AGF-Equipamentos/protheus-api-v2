import { FastifyRequest } from 'fastify'
import { z } from 'zod'
import { knex } from '../../database/protheus'
import { whereInGenerator } from '../../utils/whereInGenerator'

export async function purchaseOrdersRoutes(request: FastifyRequest) {
  const getStocksQueryParamsSchema = z.object({
    filial: z.string().optional(),
    pc: z.string().optional(),
    produto: z.string().or(z.string().array()).optional(),
    grupo: z.string().optional(),
    top: z.coerce.number().optional(),
    entregue: z.coerce.boolean().optional().default(false),
    desc: z.coerce.boolean().optional().default(false),
    cnpj: z.string().optional(),
    legenda: z.string().or(z.string().array()).optional()
  })

  const { filial, pc, produto, grupo, top, entregue, desc, cnpj, legenda } =
    getStocksQueryParamsSchema.parse(request.query)

  const query = knex
    .select(
      knex.raw(`
          SC7.C7_NUM AS PEDIDO,
          SC7.C7_ITEM AS ITEM,
          SC7.C7_CONAPRO AS APROVADO,
          CONCAT(SUBSTRING(SC7.C7_EMISSAO,7,2),'/',SUBSTRING(SC7.C7_EMISSAO,5,2),'/',SUBSTRING(SC7.C7_EMISSAO,1,4)) AS EMISSAO,
          RTRIM(SC7.C7_PRODUTO) AS PRODUTO,
          RTRIM(SC7.C7_DESCRI) AS DESCRICAO,
          SC7.C7_UM AS UM,
          SC7.C7_QUANT AS QTD,
          SC7.C7_QUJE AS QTD_ENT,
          SC7.C7_QUANT - SC7.C7_QUJE AS SALDO,
          SC7.C7_PRECO AS PRECO,
          RTRIM(SC7.C7_NUMSC) AS NUMSC,
          RTRIM(SC7.C7_OBS) AS OBS,
          SC7.C7_FORNECE AS FORN,
          CASE WHEN C7_RESIDUO <> '' THEN 'RESÍDUO ELIMINADO' WHEN C7_QTDACLA > 0 AND C7_RESIDUO = '' THEN 'PEDIDO USADO EM PRÉ-NOTA' WHEN C7_QUJE = 0 AND C7_QTDACLA = 0 AND
          C7_RESIDUO = '' THEN 'PENDENTE' WHEN C7_QUJE <> 0 AND C7_QUJE < C7_QUANT AND C7_RESIDUO = '' THEN 'ATENDIDO PARCIALMENTE' WHEN C7_QUJE >= C7_QUANT AND
          C7_RESIDUO = '' THEN 'PEDIDO ATENDIDO' ELSE '' END AS LEGENDA,
          CONCAT(SUBSTRING(SC7.C7_DATPRF,7,2),'/',SUBSTRING(SC7.C7_DATPRF,5,2),'/',SUBSTRING(SC7.C7_DATPRF,1,4)) AS ENTREGA,
          RTRIM(SA2.A2_NREDUZ) AS DESC_FORN,
          RTRIM(SA2.A2_CGC) AS CNPJ,
          RTRIM(SC7.C7_OP) AS OP
        `)
    )
    .from(
      knex.raw(`
          SC7010 AS SC7 WITH (NOLOCK) INNER JOIN
          SB1010 AS SB1 WITH (NOLOCK) ON SB1.D_E_L_E_T_ = '' AND SB1.B1_FILIAL = LEFT('${filial}', 2) AND SB1.B1_COD = SC7.C7_PRODUTO LEFT OUTER JOIN
          SA2010 AS SA2 WITH (NOLOCK) ON SA2.D_E_L_E_T_ = '' AND SA2.A2_FILIAL = LEFT('${filial}', 2) AND SA2.A2_COD = SC7.C7_FORNECE  AND SC7.C7_LOJA = SA2.A2_LOJA
      `)
    )
    .where('SC7.C7_RESIDUO', '=', '')
    .where('SC7.D_E_L_E_T_', '=', '')
    .modify((query) => {
      if (top) {
        query.limit(top)
      }

      if (entregue) {
        query.where('C7_QUJE', '>', 0)
      }

      if (desc) {
        query.orderBy([
          { column: 'SC7.C7_DATPRF', order: 'desc' },
          { column: 'SC7.C7_NUM', order: 'desc' },
          { column: 'SC7.C7_ITEM', order: 'desc' }
        ])
      } else {
        query.orderBy(['SC7.C7_DATPRF', 'SC7.C7_NUM', 'SC7.C7_ITEM'])
      }

      if (legenda) {
        if (Array.isArray(legenda)) {
          query.whereRaw(`CASE WHEN C7_RESIDUO <> '' THEN 'RESÍDUO ELIMINADO' WHEN C7_QTDACLA > 0 AND C7_RESIDUO = '' THEN 'PEDIDO USADO EM PRÉ-NOTA' WHEN C7_QUJE = 0 AND C7_QTDACLA = 0 AND
              C7_RESIDUO = '' THEN 'PENDENTE' WHEN C7_QUJE <> 0 AND C7_QUJE < C7_QUANT AND C7_RESIDUO = '' THEN 'ATENDIDO PARCIALMENTE' WHEN C7_QUJE >= C7_QUANT AND
              C7_RESIDUO = '' THEN 'PEDIDO ATENDIDO' ELSE '' END IN ('${legenda.join(
                `','`
              )}')`)
        } else {
          query.whereRaw(
            `CASE WHEN C7_RESIDUO <> '' THEN 'RESÍDUO ELIMINADO' WHEN C7_QTDACLA > 0 AND C7_RESIDUO = '' THEN 'PEDIDO USADO EM PRÉ-NOTA' WHEN C7_QUJE = 0 AND C7_QTDACLA = 0 AND
                C7_RESIDUO = '' THEN 'PENDENTE' WHEN C7_QUJE <> 0 AND C7_QUJE < C7_QUANT AND C7_RESIDUO = '' THEN 'ATENDIDO PARCIALMENTE' WHEN C7_QUJE >= C7_QUANT AND
                C7_RESIDUO = '' THEN 'PEDIDO ATENDIDO' ELSE '' END IN ('${legenda}')`
          )
        }
      }
    })

  const modifyConditions = {
    'SC7.C7_FILIAL': filial,
    'SC7.C7_NUM': pc,
    'SB1.B1_GRUPO': grupo,
    'SA2.A2_CGC': cnpj,
    'SC7.C7_PRODUTO': produto
  }

  for (const [column, value] of Object.entries(modifyConditions)) {
    query.modify(whereInGenerator, { column, value })
  }

  const stocks = await query

  return stocks
}
