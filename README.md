# StockPriceChecker

Project is set up using NX Monorepo
    backend: Express
        responsible only for handling requests, and starting chron task. 
        logic is in stocklib

        src path: apps/backend

        generated swagger document:
            path: apps/backend/src/assets/swagger_output.json
            generate new swagger document:
                nx run backend:swagger
        
    lib: stocklib
        contains business logic, db access and finnhub functions
        uses prisma and axios

        src path: stocklib

    frontend: NextJS
        simple page to test functionality, development only!
        uses generated TanStack Query API from swagger


start project with:
    npm run start_docker
    nx run frontend:dev

    this will create 2 dockerimages (stockpricedb, backend) and start all of them seperately

    backend is located on http://localhost:3000
    swagger is located on http://localhost:3000/api-docs
    
    frontend is http://localhost:4000
    frontend with:
        
