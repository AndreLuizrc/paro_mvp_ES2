import { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { apiUrl } from '../config/api';

export default function Dashboard() {
  const [dadosGrafico, setDadosGrafico] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [infoRoteiro, setInfoRoteiro] = useState(null);
  const [resumo, setResumo] = useState({ tempoMes: 0, custoMes: 0 });
  const [loading, setLoading] = useState(true);
  const [calculando, setCalculando] = useState(false);

  // NOVOS ESTADOS PARA O FILTRO
  const [listaMotoristas, setListaMotoristas] = useState([]);
  const [filtroId, setFiltroId] = useState('');

  // Busca a lista de motoristas apenas uma vez quando a tela abre
  useEffect(() => {
    fetch(apiUrl('/api/motoristas'))
      .then(res => res.json())
      .then(data => setListaMotoristas(data))
      .catch(err => console.error('Erro ao buscar motoristas:', err));
  }, []);

  // Agora a função de carga escuta o filtroId
  const carregarDados = useCallback(async () => {
    setLoading(true);
    try {
      const url = filtroId 
        ? apiUrl(`/api/dashboard/resumo?motorista_id=${encodeURIComponent(filtroId)}`)
        : apiUrl('/api/dashboard/resumo');

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setDadosGrafico(data.grafico);
        setHistorico(data.historico);
        setResumo(data.resumo);
        setInfoRoteiro(data.infoRoteiro);
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [filtroId]); // Toda vez que o filtro muda, essa função recria

  useEffect(() => {
    // eslint-disable-next-line
    carregarDados();
  }, [carregarDados]); // Aciona o recarregamento da tela

  const calcularCustoFinal = async () => {
    if (!infoRoteiro) return alert('Nenhum roteiro para calcular.');
    setCalculando(true);
    try {
      const response = await fetch(apiUrl(`/api/roteiros/${infoRoteiro.id}/calcular-custo`), { method: 'PUT' });
      if (response.ok) {
        alert('Custo recalculado com base na distância e combustível!');
        await carregarDados(); 
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao calcular custos.');
    } finally {
      setCalculando(false);
    }
  };

  return (
    <div style={{ padding: '20px', flex: 1 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ color: 'var(--preto-chumbo)', fontSize: '20px', fontWeight: '900' }}>
            Parô<span style={{ color: 'var(--laranja-paro)' }}>?</span> | Painel
          </h1>
          <p style={{ color: 'var(--cinza-texto)', fontSize: '12px' }}>Visão Geral de Paradas</p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* NOVO: CAIXA DE SELEÇÃO DO FILTRO */}
          <select 
            value={filtroId} 
            onChange={(e) => setFiltroId(e.target.value)}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: '#fff', outline: 'none' }}
          >
            <option value="">🌎 Visão Global (Toda a Frota)</option>
            {listaMotoristas.map(m => (
              <option key={m.id} value={m.id}>👤 {m.nome}</option>
            ))}
          </select>

          <button 
            onClick={calcularCustoFinal} disabled={calculando}
            style={{
              backgroundColor: 'var(--preto-chumbo)', color: '#fff', border: 'none',
              padding: '10px 15px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
            }}
          >
            {calculando ? 'Calculando...' : 'Calcular Custo'}
          </button>
        </div>
      </header>

      {loading ? (
        <p style={{ textAlign: 'center', marginTop: '50px' }}>Carregando dados...</p>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
            <div style={{ flex: 1, backgroundColor: 'var(--cinza-fundo)', padding: '15px', borderRadius: '8px' }}>
              <p style={{ fontSize: '12px', color: 'var(--cinza-texto)' }}>Tempo Total</p>
              <h3 style={{ fontSize: '22px', color: 'var(--preto-chumbo)' }}>{resumo.tempoMes} min</h3>
            </div>
            <div style={{ flex: 1, backgroundColor: '#FFF3E0', padding: '15px', borderRadius: '8px', border: '1px solid var(--laranja-paro)' }}>
              <p style={{ fontSize: '12px', color: 'var(--laranja-paro)' }}>Custo Estimado</p>
              <h3 style={{ fontSize: '22px', color: 'var(--laranja-paro)' }}>
                R$ {Number(resumo.custoMes).toFixed(2).replace('.', ',')}
              </h3>
            </div>
          </div>

          <div style={{ backgroundColor: '#fff', padding: '10px 0', borderRadius: '8px', border: '1px solid #eaeaea', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '14px', margin: '0 0 15px 15px', color: 'var(--preto-chumbo)' }}>Tempo Parado (Por dia)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dadosGrafico} margin={{ top: 0, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="minutos" fill="var(--laranja-paro)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eaeaea', overflow: 'hidden' }}>
            <div style={{ padding: '15px', backgroundColor: 'var(--cinza-fundo)', borderBottom: '1px solid #eaeaea', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '14px', color: 'var(--preto-chumbo)', margin: 0 }}>Histórico do Último Roteiro</h3>
              {infoRoteiro && (
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--laranja-paro)' }}>
                  👤 Motorista: {infoRoteiro.motorista} | 📅 Data: {infoRoteiro.data}
                </span>
              )}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
              <thead style={{ backgroundColor: 'var(--cinza-fundo)' }}>
                <tr>
                  <th style={{ padding: '10px 15px' }}>Ponto</th>
                  <th style={{ padding: '10px 15px' }}>Endereço</th>
                  <th style={{ padding: '10px 15px' }}>Chegada</th>
                  <th style={{ padding: '10px 15px' }}>Saída</th>
                  <th style={{ padding: '10px 15px' }}>Tempo</th>
                </tr>
              </thead>
              <tbody>
                {historico.length > 0 ? historico.map((item, index) => (
                  <tr key={index} style={{ borderTop: '1px solid #eaeaea' }}>
                    <td style={{ padding: '10px 15px', fontWeight: 'bold' }}>{item.ordem_roteiro}</td>
                    <td style={{ padding: '10px 15px' }}>{item.endereco}</td>
                    <td style={{ padding: '10px 15px' }}>{item.chegada || '--'}</td>
                    <td style={{ padding: '10px 15px' }}>{item.saida || '--'}</td>
                    <td style={{ padding: '10px 15px', color: 'var(--laranja-paro)', fontWeight: 'bold' }}>{item.tempo_parado} min</td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>Nenhum histórico encontrado para este motorista.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
