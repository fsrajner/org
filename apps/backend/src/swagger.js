var swaggerAutogen = require('swagger-autogen');

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const options = {
  swaggerDefinition: {
    restapi: '1.0.0',
    info: {
      title: 'Stock price Checker API',
      version: '1.0.0',
      description: "It's a price checker API, really",
    },
    servers: [
      {
        url: `http://${host}:${port}`,
      },
    ],
  },
  apis: ['**/*.js'],

  definitions: {
    SearchResult: {
      
    }
  }
};

const outputFile = './assets/swagger_output.json';
const endpointsFiles = ['./src/main.ts'];

swaggerAutogen({ openapi: '3.0.0' })(outputFile, endpointsFiles, options);
