const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./config/db');
const initializeDatabase = require('./config/initDb');

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map(origin => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:5173');
}

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origem não permitida pelo CORS.'));
  }
}));
app.use(express.json({ limit: '100kb' }));

// Importação das rotas
const pontoRoutes = require('./routes/pontoRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes'); 
const roteiroRoutes = require('./routes/roteiroRoutes');
const motoristaRoutes = require('./routes/motoristaRoutes');
const parametroRoutes = require('./routes/parametroRoutes');
// Rota base para os pontos
app.use('/api/pontos', pontoRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/roteiros', roteiroRoutes); 
app.use('/api/motoristas', motoristaRoutes);
app.use('/api/parametros', parametroRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API do Parô? rodando sobre rodas!' });
});

const PORT = process.env.PORT || 3333;

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Falha no health check:', error);
    res.status(503).json({ status: 'error' });
  }
});

app.use((error, req, res, next) => {
  if (error.message === 'Origem não permitida pelo CORS.') {
    return res.status(403).json({ error: error.message });
  }

  console.error('Erro não tratado:', error);
  return res.status(500).json({ error: 'Erro interno do servidor.' });
});

async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('Não foi possível inicializar a aplicação:', error);
    process.exit(1);
  }
}

startServer();
