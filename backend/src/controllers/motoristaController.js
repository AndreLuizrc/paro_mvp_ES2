const pool = require('../config/db');

// Lê todos os motoristas cadastrados
exports.listar = async (req, res) => {
  try {
    const { rows: motoristas } = await pool.query('SELECT * FROM Motorista ORDER BY nome ASC');
    res.json(motoristas);
  } catch (error) {
    console.error('Erro ao listar motoristas:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// Cadastra um novo motorista
exports.criar = async (req, res) => {
  const { nome, telefone, documento, veiculo, rendimento_km_litro } = req.body;
  
  try {
    const { rows } = await pool.query(
      `INSERT INTO Motorista (nome, telefone, documento, veiculo, rendimento_km_litro)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [nome, telefone, documento, veiculo, rendimento_km_litro]
    );
    
    res.status(201).json({ 
      message: 'Motorista cadastrado com sucesso!', 
      id: rows[0].id
    });
  } catch (error) {
    console.error('Erro ao cadastrar motorista:', error);
    // Se o documento já existir, o MySQL bloqueia por causa da restrição UNIQUE
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Já existe um motorista com este documento.' });
    }
    res.status(500).json({ error: 'Erro interno ao cadastrar.' });
  }
};
