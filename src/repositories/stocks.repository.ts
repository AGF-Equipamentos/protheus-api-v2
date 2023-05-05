export interface StocksRepositorySelectInputs {
  filial: string | string[] | undefined
  produto: string | string[] | undefined
  grupo: string | string[] | undefined
  armazem: string | string[] | undefined
}

type Stock = {
  FILIAL: string
  PRODUTO: string
  DESCRICAO: string
  SALDO: string
  ARMAZEM: string
}

export interface StocksRepository {
  findMany(data: StocksRepositorySelectInputs): Promise<Stock[]>
}
