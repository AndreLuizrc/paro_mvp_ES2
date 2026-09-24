import { useState, useEffect } from 'react';
import { apiUrl } from '../config/api';

export default function MontagemRoteiro() {
  const [motoristas, setMotoristas] = useState([]);
  const [formData, setFormData] = useState({
    motorista_id: '',
    data: new Date().toISOString().split('T')[0],
    distancia_total: ''
  });
  
  // O roteiro sempre começa com pelo menos 1 ponto (a origem)
  const [pontos, setPontos] = useState([{ endereco: '' }]);
  const [loading, setLoading] = useState(false);

  // Busca a lista de motoristas para popular o Select
  useEffect(() => {
    fetch(apiUrl('/api/motoristas'))
      .then(res => res.json())
      .then(data => setMotoristas(data))
      .catch(err => console.error('Erro ao buscar motoristas:', err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePontoChange = (index, value) => {
    const novosPontos = [...pontos];
    novosPontos[index].endereco = value;
    setPontos(novosPontos);
  };

  const adicionarPonto = () => {
    setPontos([...pontos, { endereco: '' }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pontos.some(p => p.endereco.trim() === '')) {
      return alert('Preencha todos os endereços dos pontos!');
    }
    
    setLoading(true);
    try {
      const response = await fetch(apiUrl('/api/roteiros'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          distancia_total: parseFloat(formData.distancia_total),
          pontos: pontos
        })
      });

      if (response.ok) {
        alert('Roteiro montado e salvo com sucesso!');
        setFormData({ ...formData, distancia_total: '' });
        setPontos([{ endereco: '' }]);
      } else {
        alert('Erro ao montar roteiro.');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', flex: 1 }}>
      <header style={{ marginBottom: '20px' }}>
        <h1 style={{ color: 'var(--preto-chumbo)', fontSize: '20px', fontWeight: '900' }}>
          Parô<span style={{ color: 'var(--laranja-paro)' }}>?</span> | Operação
        </h1>
        <p style={{ color: 'var(--cinza-texto)', fontSize: '12px' }}>Montar Roteiro Diário</p>
      </header>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px', fontWeight: 'bold' }}>Data do Roteiro</label>
          <input 
            type="date" name="data" value={formData.data} onChange={handleChange} required
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px', fontWeight: 'bold' }}>Motorista Responsável</label>
          <select 
            name="motorista_id" value={formData.motorista_id} onChange={handleChange} required
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: '#fff' }}
          >
            <option value="">Selecione um motorista...</option>
            {motoristas.map(m => (
              <option key={m.id} value={m.id}>{m.nome} ({m.veiculo})</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px', fontWeight: 'bold' }}>Distância Total Estimada (km)</label>
          <input 
            type="number" step="0.1" name="distancia_total" value={formData.distancia_total} onChange={handleChange} required
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ backgroundColor: 'var(--cinza-fundo)', padding: '15px', borderRadius: '8px', marginTop: '10px' }}>
          <h3 style={{ fontSize: '14px', marginBottom: '10px' }}>Endereços (Sequência)</h3>
          
          {pontos.map((ponto, index) => (
            <div key={index} style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '12px' }}>Ponto {index + 1} {index === 0 ? '(Partida)' : ''}</label>
              <input 
                type="text" value={ponto.endereco} onChange={(e) => handlePontoChange(index, e.target.value)}
                placeholder="Ex: Av. João César, 1000" required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', marginTop: '3px' }}
              />
            </div>
          ))}

          <button 
            type="button" onClick={adicionarPonto}
            style={{ padding: '8px 15px', fontSize: '12px', backgroundColor: 'transparent', border: '1px solid var(--laranja-paro)', color: 'var(--laranja-paro)', borderRadius: '4px', cursor: 'pointer', marginTop: '5px' }}
          >
            + Adicionar Endereço
          </button>
        </div>

        <button 
          type="submit" disabled={loading}
          style={{
            marginTop: '10px', padding: '15px', fontSize: '16px', fontWeight: 'bold', color: '#fff',
            backgroundColor: loading ? '#ccc' : 'var(--laranja-paro)', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Montando...' : 'Salvar Roteiro'}
        </button>
      </form>
    </div>
  );
}
