import { getStock } from './stocklib';

import { MockContext, Context, createMockContext } from '../test/context'

const existingStock = "NVDA"
const notExistingStock = "AAPL"

let mockCtx: MockContext
let ctx: Context


beforeEach(async () => {
  mockCtx = createMockContext()
  ctx = mockCtx as unknown as Context
})



test('stock is found', async () => {
  const data = {
    id: 1,
    name: existingStock,
    currency: "USD",
    updatedAt: new Date()
  }
  mockCtx.prisma.stock.findFirst.mockResolvedValueOnce(data)
  const stock = await getStock(mockCtx.prisma, existingStock);
  expect(stock.name).toEqual(existingStock);
});

test("stock isn't found, error is thrown", async () => {
  try {
    await getStock(mockCtx.prisma, notExistingStock);
  } catch (error) {
    expect(error).toMatch("stock not found");
  }
});