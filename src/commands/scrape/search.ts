import { AliExpressScraper } from "@afilimax/aliexpress-scraper"
import { AmazonScraper } from "@afilimax/amazon-scraper"
import { ScrapedProductPreview } from "@afilimax/core"
import { MercadoLivreScraper } from "@afilimax/mercado-livre-scraper"
import { Command } from "commander"
import readlineSync from "readline-sync"

import { generateAffiliateUrl } from "../../helpers/affiliate.helper"
import { openInBrowser } from "../../helpers/browser.helper"
import { logError, logInfo, logJson, logSuccess, logWarning } from "../../helpers/logger.helper"

const reset = "\x1b[0m"
const bold = "\x1b[1m"
const cyan = "\x1b[38;2;80;200;240m"
const gold = "\x1b[38;2;255;200;0m"
const gray = "\x1b[38;2;140;140;140m"
const green = "\x1b[38;2;80;200;120m"

export type SupportedPlatform = "amazon" | "mercado-livre" | "aliexpress"

export function normalizePlatform(raw: string): SupportedPlatform | null {
    const p = raw.toLowerCase().trim()
    if (p === "amazon" || p === "amz") return "amazon"
    if (p === "mercado-livre" || p === "mercadolivre" || p === "ml") return "mercado-livre"
    if (p === "aliexpress" || p === "ali") return "aliexpress"
    return null
}

function formatPrice(val: number | null | undefined): string {
    if (val == null || isNaN(val)) return "N/A"
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val)
}

function displaySearchResults(items: ScrapedProductPreview[], platform: SupportedPlatform, page: number): void {
    console.log(
        `\n  ${bold}${gold}🔍 Resultados para "${platform.toUpperCase()}"${reset} ${gray}(Página ${page} • ${items.length} produtos exibidos)${reset}\n`,
    )

    items.forEach((item, index) => {
        const itemNumber = `[${index + 1}]`
        console.log(`  ${bold}${cyan}${itemNumber} ${item.title}${reset}`)

        const priceCurrent = formatPrice(item.price.value)
        let priceLine = `  💰 Preço: ${bold}${green}${priceCurrent}${reset}`

        if (item.price.originalValue && item.price.originalValue > (item.price.value ?? 0)) {
            const discountPct = Math.round(
                ((item.price.originalValue - (item.price.value ?? 0)) / item.price.originalValue) * 100,
            )
            priceLine += ` ${gray}(De: ${formatPrice(item.price.originalValue)} • ${bold}${cyan}${discountPct}% OFF${reset}${gray})${reset}`
        }
        console.log(priceLine)

        const details: string[] = []
        if (item.rating && item.rating.average != null && item.rating.average > 0) {
            const reviews = item.rating.totalReviews != null ? ` (${item.rating.totalReviews})` : ""
            details.push(`⭐ ${item.rating.average.toFixed(1)}${reviews}`)
        }
        if (item.brand) {
            details.push(`🏷️  ${item.brand}`)
        }
        if (item.externalId) {
            details.push(`🆔 ${item.externalId}`)
        }

        if (details.length > 0) {
            console.log(`     ${gray}${details.join(" • ")}${reset}`)
        }

        console.log(`     ${gray}🔗 ${item.url}${reset}\n`)
    })
}

export async function scrapeSearch(
    rawPlatform: string,
    query: string,
    options: { page?: string; limit?: string; json?: boolean } = {},
): Promise<void> {
    const platform = normalizePlatform(rawPlatform)

    if (!platform) {
        logError(
            `Plataforma "${rawPlatform}" inválida.\n  Opções aceitas: amazon (amz), mercado-livre (ml), aliexpress (ali).`,
        )
        process.exit(1)
    }

    let currentPage = options.page ? parseInt(options.page, 10) : 1
    const limit = options.limit ? parseInt(options.limit, 10) : 10

    if (isNaN(currentPage) || currentPage < 1) currentPage = 1

    let amazonScraper: AmazonScraper | null = null
    let mlScraper: MercadoLivreScraper | null = null
    let aliScraper: AliExpressScraper | null = null

    try {
        if (platform === "amazon") {
            amazonScraper = new AmazonScraper({ quiet: true })
        } else if (platform === "mercado-livre") {
            mlScraper = new MercadoLivreScraper()
        } else {
            aliScraper = new AliExpressScraper({ quiet: true })
        }

        const isInteractive = Boolean(process.stdout.isTTY && process.stdin.isTTY && !options.json)

        while (true) {
            if (!options.json) {
                logInfo(`Buscando "${query}" em ${platform.toUpperCase()} (Página ${currentPage})...`)
            }

            let results: ScrapedProductPreview[] = []

            if (platform === "amazon" && amazonScraper) {
                results = await amazonScraper.searchProducts({ query, page: currentPage })
                if (limit && results.length > limit) results = results.slice(0, limit)
            } else if (platform === "mercado-livre" && mlScraper) {
                results = await mlScraper.searchProducts({
                    query,
                    limit,
                    offset: (currentPage - 1) * limit,
                })
            } else if (platform === "aliexpress" && aliScraper) {
                results = await aliScraper.searchProducts({
                    query,
                    limit,
                    page: currentPage,
                })
            }

            if (options.json) {
                logJson({
                    platform,
                    query,
                    page: currentPage,
                    totalItems: results.length,
                    items: results,
                })
                break
            }

            if (results.length === 0) {
                logWarning(`Nenhum produto encontrado para "${query}" na página ${currentPage}.`)
                if (!isInteractive) break

                const navAnswer = readlineSync.question(`  ${gray}[p] Página anterior | [q] Sair: ${reset}`)
                const choice = navAnswer.trim().toLowerCase()
                if (choice === "p" && currentPage > 1) {
                    currentPage--
                    continue
                }
                break
            }

            displaySearchResults(results, platform, currentPage)

            if (!isInteractive) {
                break
            }

            const promptText = `  ${bold}${gold}Ações:${reset} Digite o ${bold}número do produto (1-${results.length})${reset} para gerar link de afiliado\n  ${gray}[Enter/n]: Próxima página | [p]: Página anterior | [q]: Sair:${reset} `
            const rawChoice = readlineSync.question(promptText)
            const choice = rawChoice.trim().toLowerCase()

            if (choice === "q" || choice === "exit" || choice === "sair") {
                break
            }

            if (choice === "p" || choice === "prev" || choice === "anterior") {
                if (currentPage > 1) {
                    currentPage--
                } else {
                    logWarning("Você já está na primeira página.")
                }
                continue
            }

            if (choice === "n" || choice === "next" || choice === "proxima" || choice === "") {
                currentPage++
                continue
            }

            const selectedIndex = parseInt(choice, 10)
            if (!isNaN(selectedIndex) && selectedIndex >= 1 && selectedIndex <= results.length) {
                const selectedProduct = results[selectedIndex - 1]
                console.log(`\n  ${bold}Selecionado:${reset} ${selectedProduct.title}`)
                logInfo("Gerando link de afiliado...")

                try {
                    const affiliateUrl = await generateAffiliateUrl(selectedProduct.url)
                    logSuccess("Link gerado com sucesso!")
                    console.log(`\n  🔗 ${bold}${cyan}${affiliateUrl}${reset}\n`)

                    const openAnswer = readlineSync.question(`  🌐 Deseja abrir o link no navegador? [s/N]: `)
                    if (openAnswer.trim().toLowerCase() === "s" || openAnswer.trim().toLowerCase() === "sim") {
                        openInBrowser(affiliateUrl)
                    }
                } catch (err: any) {
                    logError(err.message || "Erro ao gerar link de afiliado")
                }

                const continueAnswer = readlineSync.question(`\n  Deseja continuar navegando nos resultados? [S/n]: `)
                if (continueAnswer.trim().toLowerCase() === "n") {
                    break
                }
            } else {
                logWarning("Opção inválida.")
            }
        }
    } finally {
        if (amazonScraper) await amazonScraper.close()
        if (mlScraper) await mlScraper.close()
        if (aliScraper) await aliScraper.close()
    }
}

export const scrapeSearchCommand = new Command("search")
    .alias("find")
    .description("Pesquisa produtos com paginação interativa e seleção para gerar link de afiliado")
    .argument("<platform>", "Plataforma (amazon, mercado-livre, aliexpress)")
    .argument("<query>", "Termo de busca do produto")
    .option("-p, --page <number>", "Página inicial da pesquisa", "1")
    .option("-l, --limit <number>", "Quantidade de produtos por página", "10")
    .option("-j, --json", "Retorna os resultados em formato JSON sem menu interativo")
    .action(async (platform: string, query: string, options: { page?: string; limit?: string; json?: boolean }) => {
        try {
            await scrapeSearch(platform, query, options)
        } catch (err: any) {
            logError("Erro ao pesquisar produtos", err)
            process.exit(1)
        }
    })
