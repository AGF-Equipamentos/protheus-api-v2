import {
  StocksRepository,
  StocksRepositorySelectInputs
} from '../repositories/stocks.repository'

export class FetchStocksUseCase {
  constructor(private stockRepository: StocksRepository) {}

  async execute(data: StocksRepositorySelectInputs) {
    const stocks = await this.stockRepository.findMany(data)

    return stocks
  }
}
