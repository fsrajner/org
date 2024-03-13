import { PrismaClient, Stock, StockPrice } from '@prisma/client'
import { QuoteResponse, SearchResponse, getResponse } from './finnhub'

const EMAWindow = 10
const multiplier = (2 / (EMAWindow + 1))

export class ErrorResponse extends Error {
  code: number;
  message: string;

  constructor({ code, message }: {
    code: number,
    message: string
  }) {
    super()
    this.message = message
    this.code = code
  }
}
export async function getStock(prisma: PrismaClient, stock: string) {
  const ret = await prisma.stock.findFirst({
    where: {
      name: {
        equals: stock
      }
    },
    include: {
      prices: {
        orderBy: {
          createdAt: "desc"
        },
        take: 1
      }
    }
  })
  if (ret === null)
    throw new ErrorResponse({
      code: 404,
      message: "Stock not found"
    })

  return ret
}
export async function createStock(prisma: PrismaClient, stockName: string) {
  try {
    await getStock(prisma, stockName)
  } catch (error) {
    // stock not in db

    const { count, result } = await getResponse<SearchResponse>("search", {
      "q": stockName
    })

    if (!result.find(x => x.symbol === stockName))
      throw new ErrorResponse({
        code: 406,
        message: "stock not found on finnhub"
      })

    await prisma.stock.create({
      data: {
        name: stockName
      }
    })
  }
}

export async function updateStockPrice(prisma: PrismaClient, stockName: string) {
  const stock = await getStock(prisma, stockName)

  // pc is previous close price
  // c is current, for details see https://finnhub.io/docs/api/quote
  const result = await getResponse<QuoteResponse>("quote", {
    "symbol": stockName
  })

  const currentPrice = result.c

  const prevStockPrices = await prisma.stockPrice.findMany({
    orderBy: {
      createdAt: "desc"
    },
    take: EMAWindow - 1,
    where: {
      stockId: stock.id
    }
  })


  const stockPriceData = {
    stockId: stock.id,
    price: result.c,
  } as StockPrice

  // https://corporatefinanceinstitute.com/resources/data-science/moving-average/
  if (prevStockPrices.length === EMAWindow - 1) {
    const periodSum = prevStockPrices.map(x => x.price).reduce((acc, price) => {
      return acc + price
    }) + currentPrice

    stockPriceData.sma = periodSum / EMAWindow

    const prevEMA = prevStockPrices[0].ema || prevStockPrices[0].sma    //first ema is the sma

    if (prevEMA) {
      const closingPrice = result.pc
      stockPriceData.ema = (closingPrice - prevEMA) * multiplier + prevEMA
    }
  }
  await prisma.stockPrice.create({
    data: stockPriceData
  })
}

export async function getStockData(prisma: PrismaClient, stockName: string) {
  const stock = await getStock(prisma, stockName)
  const stockPrice = stock.prices.length > 0 ? stock.prices[0] : null

  if (!stockPrice || !stockPrice.ema)
    throw new ErrorResponse({
      code: 404,
      message: "not enough data available for stock, please wait for more data..."
    })

  return {
    name: stockName,
    sma: stockPrice.sma,
    ema: stockPrice.ema,
    current: stockPrice.price,
    updated: stockPrice.createdAt,
    currency: stock.currency
  }
}

export async function updateObservedStockPrices(prisma: PrismaClient) {
  const stocks = await prisma.stock.findMany({})
  for (const stock of stocks) {
    await updateStockPrice(prisma, stock.name)
  }
}

export async function searchStock(searchString: string) {
  const { count, result } = await getResponse<SearchResponse>("search", {
    "q": searchString
  })

  return result
}

export async function getChartData(prisma: PrismaClient, stockName: string) {
  const stock = await getStock(prisma, stockName)

  const stockPrices = await prisma.stockPrice.findMany({
    orderBy: {
      createdAt: "desc"
    },
    take: EMAWindow,
    where: {
      stockId: stock.id
    }
  })

  return stockPrices
}