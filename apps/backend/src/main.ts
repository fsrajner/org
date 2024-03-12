import {
  createStock,
  getStockData,
  ErrorResponse,
  updateObservedStockPrices,
} from '@org/stocklib';
import { PrismaClient } from '@prisma/client';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { CronJob } from 'cron';

const swaggerOutputFile = '../../../src/assets/swagger_output.json';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();
const prisma = new PrismaClient();

app.get('/stock/:symbol?', async function (req, res) {
  try {
    const symbol = req.params.symbol;
    const data = await getStockData(prisma, symbol);
    res.send(data);
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

app.put('/stock/:symbol?', async function (req, res) {
  try {
    const symbol = req.params.symbol;
    const data = await createStock(prisma, symbol);
    res.send(data);
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
