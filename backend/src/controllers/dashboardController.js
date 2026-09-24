const pool = require('../config/db');

exports.getResumoDashboard = async (req, res) => {
  // Pega o motorista_id da URL (ex: /api/dashboard/resumo?motorista_id=2)
  const { motorista_id } = req.query;

  let filtroSQL = '';
  let paramsGerais = [];

  // Se veio um ID, preparamos o filtro
  if (motorista_id) {
    filtroSQL = 'WHERE motorista_id = $1';
    paramsGerais.push(motorista_id);
  }

  try {
    // 1. Gráfico (Geral ou Filtrado)
    const { rows: linhasGrafico } = await pool.query(`
      SELECT TO_CHAR(data, 'DD/MM') as dia, SUM(tempo_total_parado) as minutos
      FROM Roteiro ${filtroSQL} 
      GROUP BY data ORDER BY data ASC LIMIT 5
    `, paramsGerais);

    // 2. Resumo Financeiro (Geral ou Filtrado)
    const { rows: linhasTotal } = await pool.query(`
      SELECT SUM(tempo_total_parado) as total_minutos, SUM(custo_estimado) as total_custo 
      FROM Roteiro ${filtroSQL}
    `, paramsGerais);

    // 3. Histórico: Busca o Roteiro mais recente (Geral ou do Motorista específico)
    let subQueryHist = 'SELECT MAX(id) FROM Roteiro';
    let paramsHist = [];
    if (motorista_id) {
      subQueryHist += ' WHERE motorista_id = $1';
      paramsHist.push(motorista_id);
    }

    const { rows: linhasHistorico } = await pool.query(`
      SELECT 
        p.ordem_roteiro, p.endereco, 
        TO_CHAR(p.data_hora_chegada, 'HH24:MI:SS') as chegada,
        TO_CHAR(p.data_hora_saida, 'HH24:MI:SS') as saida,
        p.tempo_parado_calculado as tempo_parado,
        m.nome as motorista,
        TO_CHAR(r.data, 'DD/MM/YYYY') as data_roteiro,
        r.id as roteiro_id
      FROM Ponto p
      JOIN Roteiro r ON p.roteiro_id = r.id
      JOIN Motorista m ON r.motorista_id = m.id
      WHERE r.id = (${subQueryHist})
      ORDER BY p.ordem_roteiro ASC
    `, paramsHist);

    const infoRoteiro = linhasHistorico.length > 0 ? {
      id: linhasHistorico[0].roteiro_id,
      motorista: linhasHistorico[0].motorista,
      data: linhasHistorico[0].data_roteiro
    } : null;

    res.json({
      grafico: linhasGrafico,
      historico: linhasHistorico,
      infoRoteiro: infoRoteiro,
      resumo: {
        tempoMes: linhasTotal[0].total_minutos || 0,
        custoMes: linhasTotal[0].total_custo || 0
      }
    });
  } catch (error) {
    console.error('Erro ao carregar dashboard:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};
