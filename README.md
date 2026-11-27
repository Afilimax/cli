<a href="https://afilimax.net"><img src="https://raw.githubusercontent.com/Afilimax/.github/main/assets/npm-banner.svg" alt="Afilimax — Encontre a oferta. Gere o link. Divulgue sozinho." width="100%" /></a>

[![npm version](https://img.shields.io/npm/v/%40afilimax%2Fcli?logo=npm)](https://www.npmjs.com/package/@afilimax/cli)
[![npm downloads](https://img.shields.io/npm/dm/%40afilimax%2Fcli?logo=npm)](https://www.npmjs.com/package/@afilimax/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/Afilimax/afilimax-cli/blob/HEAD/LICENSE)
[![Website](https://img.shields.io/badge/website-afilimax.net-7857FF)](https://afilimax.net)

# @afilimax/cli

Interface de linha de comando do ecossistema Afilimax para configurar credenciais, gerar links de afiliado, pesquisar produtos e extrair detalhes de ofertas em marketplaces brasileiros.

## Recursos

- Detecção automática da plataforma a partir da URL do produto.
- Geração de links para Amazon, Mercado Livre, Shopee, AliExpress e Magazine Luiza.
- Pesquisa interativa e extração de produtos na Amazon, Mercado Livre e AliExpress.
- Geração de link de afiliado a partir de resultados de pesquisa ou extração.
- Configuração local de credenciais e cookies por plataforma.
- Importação de cookies em JSON ou coleta por navegador automatizado.
- Verificação da expiração dos cookies e visualização das credenciais mascaradas.
- Saída em JSON para integração com outras ferramentas.

## Instalação

Instalação global:

```bash
npm install -g @afilimax/cli
```

Execução direta com `npx`:

```bash
npx @afilimax/cli --help
```

Depois da instalação global, o executável fica disponível como `afilimax`.

## Como usar

### Gerar um link de afiliado

Informe apenas a URL para detectar a plataforma automaticamente:

```bash
afilimax create "https://www.mercadolivre.com.br/p/MLB22649400"
afilimax create "https://www.amazon.com.br/dp/B0D1VHJVS9/"
```

Ou selecione a plataforma explicitamente:

```bash
afilimax create amazon <url>
afilimax create mercado-livre <url>
afilimax create shopee <url>
afilimax create aliexpress <url>
afilimax create magazine-luiza <url>
```

### Extrair um produto

```bash
afilimax scrape product "https://www.mercadolivre.com.br/p/MLB22649400"
afilimax scrape product "https://www.amazon.com.br/dp/B0D1VHJVS9/" --json
afilimax scrape product "https://pt.aliexpress.com/item/1005009120888793.html" --affiliate
```

O atalho `afilimax scrape <url>` executa a mesma extração e aceita `--json` e `--affiliate`.

### Pesquisar produtos

```bash
afilimax scrape search amazon "wireless headphones"
afilimax scrape search mercado-livre "smart tv 55" --page 1 --limit 10
afilimax scrape search aliexpress "bluetooth earphones" --json
```

No modo interativo, digite o número de um produto para gerar seu link. Use `Enter` ou `n` para avançar, `p` para voltar e `q` para sair.

### Configurar credenciais

Amazon, Mercado Livre e Magazine Luiza usam fluxos interativos:

```bash
afilimax config amazon
afilimax config mercado-livre
afilimax config magazine-luiza
```

Shopee e AliExpress recebem as credenciais por opções:

```bash
afilimax config shopee --app-id <app-id> --app-secret <app-secret> --sub-ids <sub-id...>
afilimax config aliexpress --app-key <app-key> --app-secret <app-secret> --tracking-id <tracking-id>
```

Consulte a configuração atual:

```bash
afilimax config show
afilimax config show --json
```

## Configuração

As credenciais ficam em `~/.afilimax/config.json`; no Windows, o caminho equivale a `C:\Users\<user>\.afilimax\config.json`.

| Plataforma | Credenciais | Comando |
| :--- | :--- | :--- |
| Amazon Associates | Cookies de sessão | `afilimax config amazon` |
| Mercado Livre Afiliados | Tag e cookies de sessão | `afilimax config mercado-livre` |
| Shopee Afiliados | App ID, App Secret e Sub IDs opcionais | `afilimax config shopee` |
| AliExpress Open Platform | App Key, App Secret e Tracking ID | `afilimax config aliexpress` |
| Magazine Luiza | Slug de afiliado e cookies de sessão | `afilimax config magazine-luiza` |

Opções de credenciais:

| Plataforma | Opções |
| :--- | :--- |
| Shopee | `-i, --app-id`; `-s, --app-secret`; `-u, --sub-ids <subIds...>` com até cinco valores. |
| AliExpress | `-k, --app-key`; `-s, --app-secret`; `-t, --tracking-id`. |

### Como obter os cookies

Para Amazon, Mercado Livre e Magazine Luiza, a CLI oferece dois métodos:

1. **Exportação em JSON:** faça login no site, exporte os cookies com uma extensão e cole o JSON no terminal. A entrada aceita várias linhas.
2. **Login pelo navegador:** escolha essa opção no fluxo interativo e faça login na janela do Chromium aberta pela CLI.

Os cookies dão acesso à sua sessão. Não compartilhe nem versione o arquivo de configuração.

## Comandos

### `create`

| Forma | Aliases | Finalidade |
| :--- | :--- | :--- |
| `create <url>` | — | Detecta a plataforma e gera o link. |
| `create amazon <url>` | `amz` | Gera link da Amazon. |
| `create mercado-livre <url>` | `ml` | Gera link do Mercado Livre. |
| `create shopee <url>` | `sh` | Gera link da Shopee. |
| `create aliexpress <url>` | `ali` | Gera link do AliExpress. |
| `create magazine-luiza <url>` | `magalu`, `mlz`, `luiza` | Gera link da Magazine Luiza. |

### `scrape`

| Forma | Opções | Finalidade |
| :--- | :--- | :--- |
| `scrape <url>` | `-j, --json`; `-a, --affiliate` | Atalho para extrair um produto. |
| `scrape product <url>` | `-j, --json`; `-a, --affiliate` | Extrai detalhes de um produto; alias `item`. |
| `scrape search <platform> <query>` | `-p, --page`; `-l, --limit`; `-j, --json` | Pesquisa produtos; alias `find`. |

A pesquisa aceita `amazon` (`amz`), `mercado-livre` (`mercadolivre`, `ml`) e `aliexpress` (`ali`). Os padrões são página `1` e limite `10`.

### `config`

| Forma | Aliases | Finalidade |
| :--- | :--- | :--- |
| `config show` | `ls` | Exibe a configuração; aceita `--json`. |
| `config amazon` | `amz` | Configura cookies da Amazon. |
| `config mercado-livre` | `ml` | Configura tag e cookies do Mercado Livre. |
| `config shopee` | `sh` | Configura credenciais da Shopee. |
| `config aliexpress` | `ali` | Configura credenciais do AliExpress. |
| `config magazine-luiza` | `magalu`, `mlz`, `luiza` | Configura slug e cookies da Magazine Luiza. |

## Desenvolvimento

Instale as dependências com `npm install`. Os scripts disponíveis são:

| Comando | Finalidade |
| :--- | :--- |
| `npm run dev -- <command>` | Executa o CLI com `tsx`. |
| `npm run build` | Compila o TypeScript para `dist/`. |
| `npm run build:bundle` | Gera o bundle do executável com esbuild. |
| `npm run build:bin` | Gera binários para Windows, Linux e macOS. |
| `npm run build:all` | Executa compilação, bundle e binários. |
| `npm test` | Executa o Vitest. |
| `npm run test:cov` | Executa os testes uma vez com cobertura. |
| `npm run lint` | Executa o ESLint com correção automática. |
| `npm run format` | Formata os arquivos de `src/` com Prettier. |

Exemplo de execução local:

```bash
npm run dev -- config show
npm run dev -- create "https://www.amazon.com.br/dp/B0D1VHJVS9/"
```

## Licença

Distribuído sob a licença [MIT](./LICENSE).

---

## Automatize sua operação de afiliados

> Use este pacote para automatizar sua operação de afiliados. Conheça a plataforma Afilimax e transforme ofertas em links e divulgação automática.

[Conheça a Afilimax](https://afilimax.net) · [Pacote no npm](https://www.npmjs.com/package/@afilimax/cli) · [Repositório no GitHub](https://github.com/Afilimax/afilimax-cli)
