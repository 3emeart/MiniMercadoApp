# Flux PDV - Sistema de Gestão e Ponto de Venda (MiniMercado SaaS)

[![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=for-the-badge&logo=angular)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Vitest-Testing-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev/)
[![Prettier](https://img.shields.io/badge/Prettier-Code_Style-F7B93E?style=for-the-badge&logo=prettier)](https://prettier.io/)

O **Flux PDV** é uma plataforma moderna de Ponto de Venda e Gestão Empresarial (ERP) desenvolvida para mini-mercados e comércios locais. O sistema oferece uma interface de alta performance, focada em produtividade, segurança e experiência do usuário premium.

---

## 🚀 Funcionalidades Principais

### 🛒 Ponto de Venda (PDV) Imersivo
- **Modo Tela Cheia:** Interface dedicada para operadores, eliminando distrações e otimizando o fluxo de caixa.
- **Carrinho Estilizado:** Visualização estilo "Cupom Fiscal" em tempo real.
- **Busca Avançada:** Pesquisa rápida de produtos por nome ou código.
- **Pagamentos Flexíveis:** Suporte a múltiplas formas de pagamento, incluindo um fluxo moderno para **PIX** com QR Code.
- **Gestão de Cancelamentos:** Fluxo de segurança que exige autorização de gerente para estornos e cancelamentos.

### 📦 Gestão de Estoque e Produtos
- **Catálogo Completo:** Cadastro de produtos com categorias, preços e controle de estoque.
- **Movimentação Automática:** Baixa de estoque integrada à venda e registro de entradas/saídas.
- **Gestão de Categorias:** Organização de produtos com suporte completo a CRUD (Criação, Edição e Exclusão).
- **Alertas de Estoque:** Visualização clara de itens com baixo estoque via badges coloridos.

### 💰 Gestão Financeira
- **Dashboard Detalhado:** Acompanhamento de vendas, faturamento e fluxo de caixa.
- **Histórico de Transações:** Registro completo de todas as vendas realizadas para auditoria.

### 👥 Administração de Usuários
- **Níveis de Acesso:** Separação clara entre Operadores (PDV) e Administradores (ERP).
- **Controle de Sessão:** Sistema de login seguro com proteção de rotas.

---

## 🎨 Design System & Estética

O projeto utiliza um design system corporativo inspirado em interfaces de alto padrão (TOTVS/Enterprise), garantindo profissionalismo e clareza.

- **Tipografia:** Uso da fonte **Inter** para legibilidade superior.
- **Paleta de Cores:** Azul Corporativo (`#0B4F6C`), Verde Sucesso para transações e alertas vibrantes para erros/avisos.
- **Componentes:** Tabelas ricas, cards com elevação sutil e feedbacks visuais em todas as interações (micro-animações).
- **UX:** Layout totalmente responsivo, adaptando-se de telas de PDV dedicadas a tablets e desktops administrativos.

---

## 🛠️ Stack Tecnológica

- **Core:** [Angular 21](https://angular.dev/) (Última versão com as melhores práticas de Signals e Standalone Components).
- **Linguagem:** [TypeScript 5.9](https://www.typescriptlang.org/).
- **Estilização:** CSS3 Moderno (Vanilla) com variáveis CSS e Grid Layout para máxima performance.
- **Testes:** [Vitest](https://vitest.dev/) para unit testing rápido e confiável.
- **Formatador:** [Prettier](https://prettier.io/) para consistência de código.

---

## 📂 Estrutura do Projeto

```bash
src/app/
├── components/     # Componentes compartilhados (Listas, Modais, etc.)
├── layouts/        # Templates de página (Admin, Auth, PDV)
├── pages/          # Módulos de página (Login, Vendas, Estoque, Financeiro)
├── services/       # Lógica de negócio e integração com API
├── Models/         # Interfaces e Tipagens de dados
└── interceptors/   # Middlewares de requisição (Auth, Errors)
```

---

## ⚙️ Configuração e Instalação

### Pré-requisitos
- [Node.js](https://nodejs.org/) (Versão 20 ou superior recomendada)
- [Angular CLI](https://angular.dev/tools/cli)

### Instalação
1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/mini-mercado-app.git
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```

### Executando em Desenvolvimento
Para rodar o projeto localmente:
```bash
npm start
# ou
ng serve
```
Acesse em: `http://localhost:4200/`

### Build para Produção
```bash
npm run build
```
Os arquivos serão gerados na pasta `dist/`.

---

## 🧪 Qualidade de Código

### Testes Unitários
```bash
npm test
```

### Formatação
O projeto segue as regras do `.prettierrc`. Para formatar o código:
```bash
npx prettier --write .
```

---

## 📄 Licença

Este projeto é de uso privado para o ecossistema MiniMercado SaaS.

---
*Desenvolvido com ❤️ pela equipe de engenharia do Flux PDV.*
