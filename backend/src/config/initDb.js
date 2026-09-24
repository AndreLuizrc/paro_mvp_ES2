const fs = require('fs/promises');
const path = require('path');
const pool = require('./db');

async function initializeDatabase() {
  const schemaPath = path.join(__dirname, '../../database/schema.sql');
  const schema = await fs.readFile(schemaPath, 'utf8');

  await pool.query(schema);
  console.log('PostgreSQL conectado e schema verificado com sucesso.');
}

module.exports = initializeDatabase;
