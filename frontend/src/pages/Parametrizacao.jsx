import { useState, useEffect } from 'react';
import { apiUrl } from '../config/api';

export default function Parametrizacao() {
  const [formData, setFormData] = useState({
    valor_combustivel: '',
    custo_por_km: '',
    km_litro_veiculo: '',
    jornada_padrao: '' // Alterado aqui
  });
  const [loading, setLoading] = useState(false);
  const [buscando, setBuscando] = useState(true);

  useEffect(() => {
    fetch(apiUrl('/api/parametros'))
      .then(res => res.json())
      .then(data => {
        setFormData({
          valor_combustivel: data.valor_combustivel || '',
          custo_por_km: data.custo_por_km || '',
          km_litro_veiculo: data.km_litro_veiculo || '',
          jornada_padrao: data.jornada_padrao || 8 // Alterado aqui
        });
      })
      .catch(err => console.error('Erro ao buscar parâmetros:', err))
      .finally(() => setBuscando(false));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(apiUrl('/api/parametros'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          valor_combustivel: parseFloat(String(formData.valor_combustivel).replace(',', '.')),
          custo_por_km: parseFloat(String(formData.custo_por_km).replace(',', '.')),
          km_litro_veiculo: parseFloat(String(formData.km_litro_veiculo).replace(',', '.')),
          jornada_padrao: parseInt(formData.jornada_padrao, 10) // Alterado aqui
        })
      });

      if (response.ok) {
        alert('Configurações atualizadas com sucesso! Os próximos cálculos já usarão estes valores.');
      } else {
        alert('Erro ao atualizar configurações.');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  if (buscando) return <p style={{ padding: '20px' }}>Carregando configurações atuais...</p>;

  return (
    <div style={{ padding: '20px', flex: 1 }}>
      <header style={{ marginBottom: '20px' }}>
        <h1 style={{ color: 'var(--preto-chumbo)', fontSize: '20px', fontWeight: '900' }}>
          Parô<span style={{ color: 'var(--laranja-paro)' }}>?</span> | Configurações
        </h1>
        <p style={{ color: 'var(--cinza-texto)', fontSize: '12px' }}>Parametrização do Sistema</p>
      </header>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '500px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px', fontWeight: 'bold' }}>Valor do Combustível (R$/litro)</label>
          <input 
            type="text" name="valor_combustivel" value={formData.valor_combustivel} onChange={handleChange} required
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px', fontWeight: 'bold' }}>Custo Fixo por KM (R$/km)</label>
          <input 
            type="text" name="custo_por_km" value={formData.custo_por_km} onChange={handleChange} required
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px', fontWeight: 'bold' }}>Rendimento Padrão da Frota (km/l)</label>
          <p style={{ fontSize: '11px', color: 'var(--cinza-texto)', marginTop: 0 }}>*Usado caso o motorista não tenha rendimento específico cadastrado.</p>
          <input 
            type="text" name="km_litro_veiculo" value={formData.km_litro_veiculo} onChange={handleChange} required
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px', fontWeight: 'bold' }}>Jornada Diária de Trabalho (Horas)</label>
          <input 
            type="number" name="jornada_padrao" value={formData.jornada_padrao} onChange={handleChange} required
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
          />
        </div>

        <button 
          type="submit" disabled={loading}
          style={{
            marginTop: '10px', padding: '15px', fontSize: '16px', fontWeight: 'bold', color: '#fff',
            backgroundColor: loading ? '#ccc' : 'var(--laranja-paro)', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Salvando...' : 'Atualizar Parâmetros'}
        </button>
      </form>
    </div>
  );
}
