CREATE TABLE IF NOT EXISTS motorista (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  telefone VARCHAR(30) NOT NULL,
  documento VARCHAR(30) NOT NULL UNIQUE,
  veiculo VARCHAR(100),
  rendimento_km_litro NUMERIC(10, 2) NOT NULL CHECK (rendimento_km_litro > 0),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parametro (
  id BIGINT PRIMARY KEY,
  valor_combustivel NUMERIC(10, 2) NOT NULL CHECK (valor_combustivel >= 0),
  custo_por_km NUMERIC(10, 2) NOT NULL CHECK (custo_por_km >= 0),
  km_litro_veiculo NUMERIC(10, 2) NOT NULL CHECK (km_litro_veiculo > 0),
  jornada_padrao INTEGER NOT NULL DEFAULT 8 CHECK (jornada_padrao > 0)
);

CREATE TABLE IF NOT EXISTS roteiro (
  id BIGSERIAL PRIMARY KEY,
  data DATE NOT NULL,
  motorista_id BIGINT NOT NULL REFERENCES motorista(id) ON DELETE RESTRICT,
  distancia_total NUMERIC(10, 2) NOT NULL CHECK (distancia_total >= 0),
  tempo_total_parado INTEGER NOT NULL DEFAULT 0 CHECK (tempo_total_parado >= 0),
  custo_estimado NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (custo_estimado >= 0),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roteiro_data ON roteiro(data);
CREATE INDEX IF NOT EXISTS idx_roteiro_motorista ON roteiro(motorista_id);

CREATE TABLE IF NOT EXISTS ponto (
  id BIGSERIAL PRIMARY KEY,
  roteiro_id BIGINT NOT NULL REFERENCES roteiro(id) ON DELETE CASCADE,
  ordem_roteiro INTEGER NOT NULL CHECK (ordem_roteiro > 0),
  endereco TEXT NOT NULL,
  data_hora_chegada TIMESTAMPTZ,
  data_hora_saida TIMESTAMPTZ,
  tempo_parado_calculado INTEGER NOT NULL DEFAULT 0 CHECK (tempo_parado_calculado >= 0),
  UNIQUE (roteiro_id, ordem_roteiro)
);

CREATE INDEX IF NOT EXISTS idx_ponto_roteiro ON ponto(roteiro_id);

INSERT INTO parametro (
  id,
  valor_combustivel,
  custo_por_km,
  km_litro_veiculo,
  jornada_padrao
)
VALUES (1, 6.00, 0.50, 10.00, 8)
ON CONFLICT (id) DO NOTHING;
