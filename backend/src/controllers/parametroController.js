const pool = require('../config/db');

exports.getParametros = async (req, res) => {
  try {
    const { rows: parametros } = await pool.query('SELECT * FROM Parametro LIMIT 1');
    if (parametros.length === 0) {
      return res.status(404).json({ error: 'Parâmetros não encontrados.' });
    }
    res.json(parametros[0]);
  } catch (error) {
    console.error('Erro ao buscar parâmetros:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

exports.updateParametros = async (req, res) => {
  const { valor_combustivel, custo_por_km, km_litro_veiculo, jornada_padrao } = req.body;
  
  try {
    // Atualizamos a primeira linha (presumindo id = 1)
    await pool.query(
      `UPDATE Parametro SET 
        valor_combustivel = $1,
        custo_por_km = $2,
        km_litro_veiculo = $3,
        jornada_padrao = $4
       WHERE id = 1`,
      [valor_combustivel, custo_por_km, km_litro_veiculo, jornada_padrao ?? 8]
    );
    res.json({ message: 'Parâmetros atualizados com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar parâmetros:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar.' });
  }
};
