const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();


const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});


/*
const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'root',
  password: 'root',
  database: 'kanban',
});
*/

client.connect();

// Função para ler e executar o arquivo schema.sql
const executeSchema = async () => {
  try {
    const schema = fs.readFileSync('./schema.sql', 'utf8');
    await client.query(schema);
    console.log('Schema executed successfully.');
  } catch (error) {
    console.error('Error executing schema:', error.message);
  } finally {
    client.end();
  }
};

executeSchema();

exports.query = async (query, values) => {
  const { rows } = await client.query(query, values);
  return rows;
};
