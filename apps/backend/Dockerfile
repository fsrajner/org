FROM docker.io/node:lts-alpine

ENV HOST=0.0.0.0
ENV PORT=3000
ENV DATABASE_URL=postgresql://nxsuperuser:keepkalmandpanik@stockpricedb:5432/stockpriceuser
WORKDIR /app

RUN addgroup --system backend && \
          adduser --system -G backend backend

COPY dist/apps/backend backend
RUN chown -R backend:backend .

# You can remove this install step if you build with `--bundle` option.
# The bundled output will include external dependencies.
RUN npm --prefix backend --omit=dev -f install
COPY stocklib/prisma backend/prisma
RUN cd backend && npx prisma generate && cd -

CMD [ "node", "backend" ]
