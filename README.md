# 🚀 AfiliMax CLI

> Interface de Linha de Comando (CLI) modular em TypeScript para gerenciamento de credenciais e geração automática de links de afiliados.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

---

## 📌 Sumário

- [Recursos](#-recursos)
- [Instalação](#-instalação)
- [Plataformas Suportadas](#-plataformas-suportadas)
- [Uso e Comandos](#-uso-e-comandos)
  - [Geração de Links (`create`)](#1-geração-de-links-create)
  - [Scraping & Pesquisa de Produtos (`scrape`)](#2-scraping--pesquisa-de-produtos-scrape)
  - [Visualização da Configuração (`config show`)](#3-visualização-da-configuração-config-show)
  - [Configuração de Credenciais (`config`)](#4-configuração-de-credenciais-config)
- [Métodos de Captura de Cookies (Amazon & Mercado Livre)](#-métodos-de-captura-de-cookies-amazon--mercado-livre)
- [Armazenamento Local](#-armazenamento-local)
- [Desenvolvimento](#-desenvolvimento)
- [Licença](#-licença)

---

## ✨ Recursos

- 🔗 **Detecção Automática de Plataforma**: Envie qualquer URL de produto e a CLI identifica automaticamente o provedor correto.
- 🍪 **Gerenciamento Inteligente de Cookies**: Suporte a exportação de cookies via extensão do navegador (recomendado) ou via navegador automatizado (Puppeteer).
- 🔒 **Validação de Expiração**: Alerta automático sobre a data de expiração dos cookies salvos.
- 🎨 **Interface Rica no Terminal**: Banners ASCII estilizados, relatórios em formato de cartão e mensagens coloridas no padrão ANSI.
- 📁 **Configuração Persistente**: Salva com segurança todas as credenciais em `~/.afilimax/config.json`.

---

## 📦 Instalação

```bash
# Instalação global via NPM
npm install -g @afilimax/cli

# Ou execução direta via npx
npx @afilimax/cli --help
```

---

## 🛒 Plataformas Suportadas

| Plataforma | Autenticação Exigida | Método de Autenticação |
| :--- | :--- | :--- |
| **Amazon Associates** | Cookies de Sessão | Extensão do Chrome *(recomendado)* ou Login em Navegador |
| **Mercado Livre Afiliados** | Tag/Slug do Afiliado + Cookies | Extensão do Chrome *(recomendado)* ou Login em Navegador |
| **Shopee Afiliados** | App ID + App Secret (+ Sub IDs opcionais) | Parâmetros de linha de comando |
| **AliExpress Open Platform** | App Key + App Secret + Tracking ID | Parâmetros de linha de comando |
| **Magazine Luiza (Parceiro Magalu)** | Slug do Afiliado + Cookies | Extensão do Chrome *(recomendado)* ou Login em Navegador |

---

## 🚀 Uso e Comandos

### 1. Geração de Links (`create`)

Você pode usar o comando genérico `create` fornecendo apenas a URL. A plataforma é detectada automaticamente:

```bash
afilimax create "https://www.mercadolivre.com.br/p/MLB22649400"
afilimax create "https://www.amazon.com.br/dp/B0D1VHJVS9/"
```

Ou você pode utilizar os subcomandos explícitos para cada plataforma:

```bash
# Amazon (alias: amz)
afilimax create amazon <url>

# Mercado Livre (alias: ml)
afilimax create mercado-livre <url>

# Shopee (alias: sh)
afilimax create shopee <url>

# AliExpress (alias: ali)
afilimax create aliexpress <url>

# Magazine Luiza (alias: magalu, mlz, luiza)
afilimax create magazine-luiza <url>
```

---

### 2. Scraping & Pesquisa de Produtos (`scrape`)

O comando `scrape` integra as bibliotecas `@afilimax/amazon-scraper`, `@afilimax/mercado-livre-scraper` e `@afilimax/aliexpress-scraper` para extração de dados e busca de produtos com menu interativo e geração de links de afiliados.

#### 📦 Scraping de Produto Individual (`scrape product`)

Extrai os dados estruturados de um produto diretamente a partir da sua URL:

```bash
# Detecta a plataforma automaticamente (Amazon, Mercado Livre ou AliExpress)
afilimax scrape product "https://www.mercadolivre.com.br/p/MLB22649400"
afilimax scrape product "https://www.amazon.com.br/dp/B0D1VHJVS9/"
afilimax scrape product "https://pt.aliexpress.com/item/1005009120888793.html"

# Atalho direto
afilimax scrape <url>

# Retorna os dados em formato JSON puro
afilimax scrape product <url> --json

# Gera o link de afiliado automaticamente ao finalizar
afilimax scrape product <url> --affiliate
```

#### 🔍 Pesquisa de Produtos com Paginação Interativa (`scrape search`)

Pesquisa produtos em tempo real, permitindo navegar entre páginas e selecionar qualquer item para criar o link de afiliado instantaneamente:

```bash
# Pesquisa na Amazon (alias: amz)
afilimax scrape search amazon "echo dot"

# Pesquisa no Mercado Livre (alias: ml, mercadolivre)
afilimax scrape search mercado-livre "smart tv 55"

# Pesquisa no AliExpress (alias: ali)
afilimax scrape search aliexpress "fone bluetooth gamer"
```

**Parâmetros e Opções:**
- `<platform>` *(obrigatório)*: `amazon` (`amz`), `mercado-livre` (`ml`) ou `aliexpress` (`ali`).
- `<query>` *(obrigatório)*: Termo de pesquisa do produto.
- `-p, --page <number>`: Página inicial (padrão: `1`).
- `-l, --limit <number>`: Quantidade de produtos por página (padrão: `10`).
- `-j, --json`: Modo não interativo que exporta os itens encontrados em formato JSON.

**Recursos do Modo Interativo:**
- Digite o número correspondente ao produto (ex: `1`) para gerar o link de afiliado na hora.
- Pressione `Enter` ou `n` para avançar para a próxima página.
- Digite `p` para retornar à página anterior.
- Digite `q` para sair.

---

### 3. Visualização da Configuração (`config show`)

Para verificar o status das suas credenciais e a expiração dos cookies armazenados:

```bash
# Exibe um relatório legível no terminal
afilimax config show

# Alias equivalente
afilimax config ls

# Exibe o objeto JSON bruto de configuração
afilimax config show --json
```

---

### 4. Configuração de Credenciais (`config`)

#### 🟡 Amazon Associates
```bash
afilimax config amazon
# ou alias: afilimax config amz
```
*Siga as instruções interativas para colar o JSON de cookies exportado da extensão ou abrir o navegador.*

#### 🟡 Mercado Livre Afiliados
```bash
afilimax config mercado-livre
# ou alias: afilimax config ml
```
*Solicita a sua Tag/Slug de afiliado e em seguida os cookies de sessão.*

#### 🟠 Shopee Afiliados
```bash
afilimax config shopee -i <appId> -s <appSecret> [-u <subIds...>]
# ou alias: afilimax config sh -i 18364590164 -s SUASECRET -u canal1 canal2
```

Flags disponíveis:
- `-i, --app-id <appId>` *(obrigatório)*: App ID do portal de Afiliados da Shopee.
- `-s, --app-secret <appSecret>` *(obrigatório)*: App Secret do portal.
- `-u, --sub-ids <subIds...>` *(opcional)*: Até 5 Sub IDs para rastreamento interno.

#### 🔴 AliExpress Open Platform
```bash
afilimax config aliexpress -k <appKey> -s <appSecret> -t <trackingId>
# ou alias: afilimax config ali -k MINHAKEY -s MEUSECRET -t MEUTRACKINGID
```

Flags disponíveis:
- `-k, --app-key <appKey>` *(obrigatório)*: App Key do AliExpress Open Platform.
- `-s, --app-secret <appSecret>` *(obrigatório)*: App Secret do AliExpress Open Platform.
- `-t, --tracking-id <trackingId>` *(obrigatório)*: Tracking ID para atribuição das vendas.

#### 🔵 Magazine Luiza (Parceiro Magalu)
```bash
afilimax config magazine-luiza
# ou aliases: afilimax config magalu | mlz | luiza
```
*Solicita o Slug/Nome da loja do afiliado e em seguida os cookies de sessão.*

---

## 🍪 Métodos de Captura de Cookies (Amazon, Mercado Livre & Magazine Luiza)

Para as plataformas que necessitam de sessão ativa (Amazon, Mercado Livre e Magazine Luiza), a CLI oferece duas abordagens:

### Opção 1: Extensão do Chrome (Recomendada)
1. Instale a extensão no Chrome: [Export Cookie JSON File](https://chromewebstore.google.com/detail/export-cookie-json-file-f/nmckokihipjgplolmcmjakknndddifde).
2. Acesse o site oficial (ex: `amazon.com.br` ou `mercadolivre.com.br`) e faça seu login normalmente.
3. Clique na extensão e escolha **Export cookies** (um arquivo JSON será baixado).
4. Copie todo o conteúdo do arquivo baixado e cole no terminal quando solicitado (suporta colagem em múltiplas linhas).

### Opção 2: Login via Navegador Integrado
1. Selecione a opção no menu interativo do CLI.
2. Uma janela isolada do Chromium será aberta.
3. Realize o login manualmente no site exibido.
4. O CLI detectará o encerramento ou a conclusão da sessão e salvará os cookies automaticamente.

---

## 📂 Armazenamento Local

Todas as configurações salvas ficam centralizadas no diretório do usuário:

- **Windows**: `C:\Users\<Usuario>\.afilimax\config.json`
- **Linux/macOS**: `~/.afilimax/config.json`

---

## 🛠 Desenvolvimento

Caso queira contribuir ou executar a CLI em modo de desenvolvimento local:

```bash
# Clonar o repositório
git clone https://github.com/Afilimax/afilimax-cli.git
cd afilimax-cli

# Instalar dependências
npm install

# Executar em modo desenvolvimento (via tsx)
npm run dev -- [comando]
# Exemplo: npm run dev -- config show

# Formatar o código (Prettier)
npm run format

# Executar testes unitários (Vitest)
npm test

# Gerar build de produção
npm run build
```

---

## 🔗 Links Úteis

- **Repositório GitHub**: [https://github.com/Afilimax/afilimax-cli](https://github.com/Afilimax/afilimax-cli)
- **Releases**: [https://github.com/Afilimax/afilimax-cli/releases](https://github.com/Afilimax/afilimax-cli/releases)
- **Reportar Erros / Issues**: [https://github.com/Afilimax/afilimax-cli/issues](https://github.com/Afilimax/afilimax-cli/issues)
- **Extensão de Cookies Recomendada**: [Export Cookie JSON File](https://chromewebstore.google.com/detail/export-cookie-json-file-f/nmckokihipjgplolmcmjakknndddifde)

---

## 📄 Licença

Desenvolvido por **Marcuth** sob a licença [MIT](LICENSE).