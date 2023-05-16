const express = require('express');
require('express-async-errors');
const routes = require('./routes');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());
app.use(routes);

app.use("/", (req, res) => {
  console.log("Bem vindo a api do Kanban");
});

app.listen(process.env.PORT || 3000, '0.0.0.0', () => {
  console.log('Server started at http://localhost:3000');
});

