import { Knex } from 'knex'

type Data = {
  column: string
  value: string | string[] | undefined
}

export function modifyGenerator(queryBuilder: Knex.QueryBuilder, data: Data) {
  if (Array.isArray(data.value)) {
    queryBuilder.whereIn(data.column, data.value)
  } else if (data.value !== undefined) {
    queryBuilder.where(data.column, data.value)
  }
}
