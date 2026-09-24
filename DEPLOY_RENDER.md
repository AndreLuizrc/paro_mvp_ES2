# Deploy no Render

O arquivo `render.yaml` cria o front-end, a API e o PostgreSQL gratuito no mesmo Blueprint.

## 1. Criar o Blueprint

1. Envie este repositório para GitHub ou GitLab.
2. No Render, escolha **New > Blueprint**.
3. Conecte o repositório e confirme o arquivo `render.yaml`.
4. Informe as duas variáveis solicitadas:
   - `FRONTEND_URL`: URL pública do site, sem barra no final.
   - `VITE_API_URL`: URL pública da API, sem barra no final.

Com os nomes padrão do Blueprint, as URLs pretendidas são:

```text
FRONTEND_URL=https://paro-es2-web.onrender.com
VITE_API_URL=https://paro-es2-api.onrender.com
```

Se o Render atribuir endereços diferentes, atualize as variáveis nas configurações dos serviços. Depois, faça um novo deploy do site e da API.

## 2. Banco de dados

A API executa `backend/database/schema.sql` ao iniciar. Esse script é idempotente: cria as tabelas, índices e o registro inicial de parâmetros somente quando necessário.

Não coloque credenciais no repositório. O Blueprint injeta `DATABASE_URL` automaticamente usando a conexão privada do PostgreSQL.

## 3. Conferir o deploy

1. Abra `https://URL-DA-API/health` e confirme a resposta `{"status":"ok"}`.
2. Abra o site e cadastre um motorista.
3. Monte um roteiro.
4. Abra o dashboard e calcule seu custo.

O PostgreSQL gratuito do Render expira 30 dias depois da criação. Para a apresentação, crie o Blueprint perto da data de uso.

## Desenvolvimento local

Crie os arquivos locais a partir dos exemplos:

```text
backend/.env.example  -> backend/.env
frontend/.env.example -> frontend/.env
```

Use um PostgreSQL local e crie previamente o banco indicado em `DATABASE_URL`. As tabelas serão criadas automaticamente quando a API iniciar.
