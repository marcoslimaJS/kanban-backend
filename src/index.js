const express = require('express');
require('express-async-errors');
const routes = require('./routes');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());
app.use(routes);

app.listen(3000, () => console.log('Server started at http://localhost:3000'));
