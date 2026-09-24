const pool = require('../config/db');

exports.calcularCustoRoteiro = async (req, res) => {
  const { id } = req.params;
  
  try {
    // 1. Busca os dados do roteiro (distância) e do motorista (rendimento do veículo)
    const { rows: roteiros } = await pool.query(`
      SELECT r.distancia_total, m.rendimento_km_litro
      FROM Roteiro r
      JOIN Motorista m ON r.motorista_id = m.id
      WHERE r.id = $1
    `, [id]);

    if (roteiros.length === 0) {
      return res.status(404).json({ error: 'Roteiro não encontrado.' });
    }

    const distancia = parseFloat(roteiros[0].distancia_total);
    const rendimentoVeiculo = parseFloat(roteiros[0].rendimento_km_litro);

    // 2. Busca os parâmetros globais do sistema de custos
    const { rows: parametros } = await pool.query('SELECT * FROM Parametro LIMIT 1');
    if (parametros.length === 0) {
      return res.status(500).json({ error: 'Parâmetros do sistema não encontrados.' });
    }
    const param = parametros[0];

    const valorCombustivel = parseFloat(param.valor_combustivel);
    const custoFixoPorKm = parseFloat(param.custo_por_km);
    const rendimentoPadrao = parseFloat(param.km_litro_veiculo);

    // Se o motorista não tiver um rendimento cadastrado, usamos o global do sistema
    const rendimentoCalculo = rendimentoVeiculo > 0 ? rendimentoVeiculo : rendimentoPadrao;

    // 3. Aplica a Regra de Negócio Matemática (RN07)
    const custoCombustivel = (distancia / rendimentoCalculo) * valorCombustivel;
    const custoFixo = distancia * custoFixoPorKm;
    const custoTotal = custoCombustivel + custoFixo;

    // 4. Salva o custo calculado de volta na tabela do Roteiro
    await pool.query(
      'UPDATE Roteiro SET custo_estimado = $1 WHERE id = $2',
      [custoTotal.toFixed(2), id]
    );

    res.json({
      message: 'Custo calculado com sucesso!',
      custo_estimado: custoTotal.toFixed(2),
      detalhes: {
        distancia: distancia,
        custoCombustivel: custoCombustivel.toFixed(2),
        custoFixo: custoFixo.toFixed(2)
      }
    });

  } catch (error) {
    console.error('Erro ao calcular custo do roteiro:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao calcular custos.' });
  }
};

exports.criarRoteiro = async (req, res) => {
  const { motorista_id, data, distancia_total, pontos } = req.body;
  const connection = await pool.connect(); // Usamos uma conexão específica para a transação
  
  try {
    await connection.query('BEGIN'); // Inicia a transação segura

    // 1. Cria o Roteiro principal
    const { rows: roteirosCriados } = await connection.query(
      `INSERT INTO Roteiro (data, motorista_id, distancia_total)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [data, motorista_id, distancia_total]
    );
    
    const roteiroId = roteirosCriados[0].id;

    // 2. Salva todos os Pontos vinculados a esse Roteiro
    for (let i = 0; i < pontos.length; i++) {
      await connection.query(
        'INSERT INTO Ponto (roteiro_id, ordem_roteiro, endereco) VALUES ($1, $2, $3)',
        [roteiroId, i + 1, pontos[i].endereco]
      );
    }

    await connection.query('COMMIT'); // Confirma a gravação no banco
    res.status(201).json({ message: 'Roteiro e Pontos criados com sucesso!', roteiroId });
    
  } catch (error) {
    await connection.query('ROLLBACK'); // Se der erro em qualquer ponto, desfaz tudo
    console.error('Erro ao montar roteiro:', error);
    res.status(500).json({ error: 'Erro interno ao salvar roteiro.' });
  } finally {
    connection.release();
  }
};
