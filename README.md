# 🛒 MiniMercado SaaS Ecosystem - Flux PDV & ERP

Bem-vindo ao repositório central de documentação do **MiniMercado SaaS**, uma solução completa de ponta a ponta (End-to-End) para gestão de comércios varejistas, focada em mini-mercados e lojas de conveniência.

Este ecossistema é composto por uma arquitetura robusta e escalável, utilizando padrões de **Clean Architecture** e **Domain-Driven Design (DDD)**, integrando um backend de alta performance em .NET com um frontend moderno e intuitivo em Angular.

---

## 🏗️ Arquitetura do Ecossistema

O sistema é estruturado como um **Monolito Modular** preparado para escala, dividido em dois grandes pilares:

### 1. [Backend] MiniMercadoSaas (.NET API)
O "cérebro" do sistema, construído com foco em desacoplamento e manutenibilidade.
- **Arquitetura:** Clean Architecture (API, Application, Domain, Infrastructure).
- **Core:** .NET 9.0, Entity Framework Core.
- **Mensageria Assíncrona:** Utiliza **MassTransit** com **RabbitMQ** para processamento de eventos (ex: alertas de estoque baixo via `EstoqueBaixoConsumer`).
- **Segurança:** Autenticação JWT e Hashing de senhas com **BCrypt**.
- **Banco de Dados:** MySQL.

### 2. [Frontend] MiniMercadoApp (Flux PDV)
A interface de usuário, focada em velocidade de operação e experiência premium.
- **Tecnologia:** Angular 21 (Signals & Standalone Components).
- **Design:** Sistema visual corporativo (Enterprise UI) inspirado em padrões TOTVS.
- **Diferencial:** Módulo de PDV imersivo (Fullscreen) e suporte a pagamentos PIX via QR Code.

---

## 🚀 Fluxos de Negócio Integrados

### 🛒 Ponto de Venda & Checkout
- O **MiniMercadoApp** envia as vendas para a **API**, que valida o estoque em tempo real.
- Após a finalização, a API registra a movimentação e, caso o estoque atinja o nível crítico, dispara um evento via **MassTransit**.

### 📦 Gestão de Estoque & Auditoria
- Cada produto possui um histórico completo de auditoria.
- Entradas manuais e saídas automáticas (vendas/cancelamentos) são rastreadas com identificação do usuário responsável.

### 🔐 Segurança Baseada em Roles (RBAC)
- **Admin:** Controle total do ecossistema.
- **Gerente:** Gestão de estoque e autorização de cancelamentos críticos no PDV.
- **Operador:** Focado na operação ágil de frente de caixa.

---

## 🛠️ Stack Tecnológica Geral

| Camada | Tecnologia Principal | Finalidade |
| :--- | :--- | :--- |
| **Frontend** | Angular 21 | Interface de Usuário & PDV |
| **Backend** | .NET 9.0 | API RESTful & Regras de Negócio |
| **Banco de Dados** | MySQL 8.0 | Persistência de Dados Relacionais |
| **Mensageria** | RabbitMQ / MassTransit | Processamento de Eventos Assíncronos |
| **Testes** | Vitest (FE) / xUnit (BE) | Garantia de Qualidade |
| **DevOps** | Docker | Containerização de Serviços (RabbitMQ/DB) |

---

## ⚙️ Como Rodar o Projeto Completo

Para ter o ecossistema funcionando localmente, siga os passos:

### 1. Preparar Infraestrutura (Docker)
Suba os serviços de suporte:
```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
docker run -d --name mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=sua_senha mysql:8
```

### 2. Rodar o Backend (MiniMercadoSaas)
```bash
cd RiderProjects/MiniMercadoSaas
dotnet ef database update --project MiniMercadoSaas.Infrastructure --startup-project MiniMercadoSaas.API
dotnet run --project MiniMercadoSaas.API
```

### 3. Rodar o Frontend (MiniMercadoApp)
```bash
cd WebstormProjects/MiniMercadoApp
npm install
npm start
```

---

## 📄 Repositórios e Links
- [Documentação Técnica do PDV (Frontend)](file:///Users/3eme/WebstormProjects/MiniMercadoApp/README_FRONTEND.md)
- [Documentação Técnica da API (Backend)](file:///Users/3eme/RiderProjects/MiniMercadoSaas/README.md)

---
*Este ecossistema foi projetado para ser escalável, seguro e extremamente fácil de operar, elevando o nível de gestão de pequenos negócios.*
