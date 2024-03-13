import {
  createStock,
  getStockData,
  ErrorResponse,
  updateObservedStockPrices,
  searchStock,
  getChartData,
} from '@org/stocklib';
import { PrismaClient } from '@prisma/client';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { CronJob } from 'cron';
import { SearchResponse } from 'stocklib/src/lib/finnhub';

const swaggerOutputFile = '../../../src/assets/swagger_output.json';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();
const prisma = new PrismaClient();

app.get('/stock/:symbol', async function (req, res) {
  try {
    const symbol = req.params.symbol;
    const data = await getStockData(prisma, symbol);

    /* #swagger.responses[200] = {
            description: 'SearchResults',
            schema: {
              "name": "AAPL",
              "sma": 173.23,
              "ema": 172.778916037368,
              "current": 173.23,
              "updated": "2024-03-13T10:31:00.663Z",
              "currency": "USD"
            }
    } */
    return res.send(data);
  } catch (error) {
    if (error instanceof ErrorResponse)
      return res.status(error.code).send({
        message: error.message,
      });
    else
      return res.status(500).send({
        message: JSON.stringify(error),
      });
  }
});

app.put('/stock/:symbol', async function (req, res) {
  try {
    const symbol = req.params.symbol;
    const data = await createStock(prisma, symbol);
    return res.send(data);
  } catch (error) {
    if (error instanceof ErrorResponse)
      return res.status(error.code).send({
        message: error.message,
      });
    else
      return res.status(500).send({
        message: JSON.stringify(error),
      });
  }
});

app.get('/search/:symbol', async function (req, res) {
  try {
    const symbol = req.params.symbol;
    let data: SearchResponse["result"] = []
    if (symbol && symbol.length > 0)
      data = await searchStock(symbol);

    /* #swagger.responses[200] = {
          description: 'SearchResults',
          schema: [{
            "description": "APPLE INC",
            "displaySymbol": "AAPL",
            "symbol": "AAPL",
            "type": "Common Stock"
          }]
    } */
    return res.send(data);
  } catch (error) {
    if (error instanceof ErrorResponse)
      res.status(error.code).send({
        message: error.message,
      });
    else
      res.status(500).send({
        message: JSON.stringify(error),
      });
  }
});
app.get('/chart/:symbol', async function (req, res) {
  try {
    const symbol = req.params.symbol;
    /* #swagger.responses[200] = {
        description: 'ChartResult',
        schema: [{
          "id": 219,
          "stockId": 2,
          "price": 173.23,
          "ema": 172.8027945757707,
          "sma": 173.23,
          "createdAt": "2024-03-13T10:26:00.442Z"
        }]

} */
    return res.send(await getChartData(prisma, symbol));
  } catch (error) {
    if (error instanceof ErrorResponse)
      return res.status(error.code).send({
        message: error.message,
      });
    else
      return res.status(500).send({
        message: JSON.stringify(error),
      });
  }
});

CronJob.from({
  cronTime: '*/1 * * * *',
  onTick: async function () {
    try {
      await updateObservedStockPrices(prisma);
    } catch (error) {
      console.error(error);
    }
  },
  start: true,
});

try {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(require(swaggerOutputFile))
  );
} catch (error) {
  console.log(__dirname);
}
app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
