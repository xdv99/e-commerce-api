const express = require("express");
const { jwtAuthenticate } = require("./config/jwtStrategy");
const router = require("./routes/router");
const dbConnection = require("./config/dbConnection");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(jwtAuthenticate);

app.use("/", router);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(3000, dbConnection);
