const pool = require('../config/db');

// Registra apenas a chegada no ponto
exports.registrarChegada = async (req, res) => {
  const { id } = req.params;
  try {
    // A função NOW() pega a data e hora exata do servidor PostgreSQL
    const resultado = await pool.query(
      'UPDATE Ponto SET data_hora_chegada = NOW() WHERE id = $1',
      [id]
    );
    if (resultado.rowCount === 0) {
      return res.status(404).json({ error: 'Ponto não encontrado.' });
    }
    res.json({ message: 'Chegada registrada com sucesso no banco de dados.' });
  } catch (error) {
    console.error('Erro ao registrar chegada:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// Registra a saída e aplica as Regras de Negócio do MVP
exports.registrarSaida = async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Atualiza o horário de saída
    const resultado = await pool.query(
      'UPDATE Ponto SET data_hora_saida = NOW() WHERE id = $1',
      [id]
    );
    if (resultado.rowCount === 0) {
      return res.status(404).json({ error: 'Ponto não encontrado.' });
    }

    // 2. Busca os dados do ponto para calcular o tempo
    const { rows: linhas } = await pool.query(
      'SELECT roteiro_id, ordem_roteiro, data_hora_chegada, data_hora_saida FROM Ponto WHERE id = $1',
      [id]
    );
    const ponto = linhas[0];

    // Regra RN01: O ponto de partida (ordem 1) não conta tempo parado
    if (ponto.ordem_roteiro > 1 && ponto.data_hora_chegada) {
      
      // Regra RN02: Tempo parado = saída - chegada
      const chegada = new Date(ponto.data_hora_chegada);
      const saida = new Date(ponto.data_hora_saida);
      
      // Converte a diferença de milissegundos para minutos inteiros
      const diffMinutos = Math.round((saida - chegada) / 60000); 

      // Salva o tempo calculado no ponto específico
      await pool.query(
        'UPDATE Ponto SET tempo_parado_calculado = $1 WHERE id = $2',
        [diffMinutos, id]
      );

      // Regra RN03: Atualiza a soma total do tempo parado no roteiro
      await pool.query(`
        UPDATE Roteiro 
        SET tempo_total_parado = (
          SELECT COALESCE(SUM(tempo_parado_calculado), 0) 
          FROM Ponto 
          WHERE roteiro_id = $1
        )
        WHERE id = $2`,
        [ponto.roteiro_id, ponto.roteiro_id]
      );
    }

    res.json({ message: 'Saída registrada e cálculos de tempo atualizados com sucesso.' });
  } catch (error) {
    console.error('Erro ao registrar saída e calcular tempo:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};
