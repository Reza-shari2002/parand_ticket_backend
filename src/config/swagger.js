const swaggerJSDoc = require("swagger-jsdoc");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Insurance Panel API",
      version: "1.0.0",
      description: "API documentation for Insurance Panel backend",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local server",
      },
    ],
    tags: [
      {
        name: "Forms",
        description: "مدیریت فرم‌های بیمه",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: [path.resolve(__dirname, "../routes/forms.js")],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
