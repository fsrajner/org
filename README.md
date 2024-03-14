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
        uses generated TanStack Query API from swagger document

start db with:
    docker-compose create stockpricedb
    docker-compose start stockpricedb
push db with:
    nx run stocklib:generateprismaclient
    nx run stocklib:generateprismadb
generate frontend api with:
    nx run frontend:generate-api

build project with:
    nx run backend:build
        this will also run nx run stocklib:generateprismaclient, stocklib:generateprismadb and backend:swagger
    
    nx run frontend:build
        this will also run nx run frontend:generate-api

scripts:
    npm run start_docker
        this will create 2 dockerimages (stockpricedb, backend) and start all of them seperately

start from empty project:
    npm i
    docker-compose create stockpricedb
    docker-compose start stockpricedb
    nx run backend:build
    nx run frontend:build
    npm run start_docker
    nx run frontend:start


backend is  http://localhost:3000
swagger is  http://localhost:3000/api-docs
    
frontend is http://localhost:4000
        