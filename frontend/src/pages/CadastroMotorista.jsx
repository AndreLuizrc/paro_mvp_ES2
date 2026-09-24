import { useState } from 'react';
import { apiUrl } from '../config/api';

export default function CadastroMotorista() {
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    documento: '',
    veiculo: '',
    rendimento_km_litro: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(apiUrl('/api/motoristas'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          // Garante que o rendimento seja enviado como número
          rendimento_km_litro: parseFloat(formData.rendimento_km_litro.replace(',', '.'))
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Motorista cadastrado com sucesso!');
        setFormData({ nome: '', telefone: '', documento: '', veiculo: '', rendimento_km_litro: '' });
      } else {
        alert(`Erro: ${data.error}`);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      alert('Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', flex: 1 }}>
      <header style={{ marginBottom: '20px' }}>
        <h1 style={{ color: 'var(--preto-chumbo)', fontSize: '20px', fontWeight: '900' }}>
          Parô<span style={{ color: 'var(--laranja-paro)' }}>?</span> | Cadastro
        </h1>
        <p style={{ color: 'var(--cinza-texto)', fontSize: '12px' }}>Novo Motorista</p>
      </header>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px', fontWeight: 'bold' }}>Nome Completo</label>
          <input 
            type="text" name="nome" value={formData.nome} onChange={handleChange} required
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px', fontWeight: 'bold' }}>CPF / Documento</label>
          <input 
            type="text" name="documento" value={formData.documento} onChange={handleChange} required
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px', fontWeight: 'bold' }}>Telefone</label>
          <input 
            type="text" name="telefone" value={formData.telefone} onChange={handleChange} required
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px', fontWeight: 'bold' }}>Veículo (Modelo/Placa)</label>
          <input 
            type="text" name="veiculo" value={formData.veiculo} onChange={handleChange}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px', fontWeight: 'bold' }}>Rendimento (km/litro)</label>
          <input 
            type="number" step="0.1" name="rendimento_km_litro" value={formData.rendimento_km_litro} onChange={handleChange} required
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
          />
        </div>

        <button 
          type="submit" disabled={loading}
          style={{
            marginTop: '10px', padding: '15px', fontSize: '16px', fontWeight: 'bold', color: '#fff',
            backgroundColor: loading ? '#ccc' : 'var(--preto-chumbo)', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Salvando...' : 'Cadastrar Motorista'}
        </button>
      </form>
    </div>
  );
}
