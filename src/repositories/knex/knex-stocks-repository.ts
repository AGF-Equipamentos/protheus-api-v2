import { knex } from '../../lib/knex-protheus'
import { whereInGenerator } from '../../utils/knex/whereInGenerator'
import { StocksRepository } from '../stocks.repository'

interface KnexStocksRepositorySelectInputs {
  filial: string | string[] | undefined
  produto: string | string[] | undefined
  grupo: string | string[] | undefined
  armazem: string | string[] | undefined
}

export class KnexStocksRepository implements StocksRepository {
  async findMany({
    filial,
    grupo,
    produto,
    armazem
  }: KnexStocksRepositorySelectInputs) {
    const query = knex
      .select('FILIAL', 'PRODUTO', 'DESCRICAO', 'SALDO', 'ARMAZEM')
      .frosm(knex.raw('SALDO_ESTOQUE WITH (NOLOCK)'))
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
  }
}
