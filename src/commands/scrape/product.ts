import { AliExpressScraper } from "@afilimax/aliexpress-scraper"
import { AmazonScraper } from "@afilimax/amazon-scraper"
import { ScrapedProduct } from "@afilimax/core"
import { MercadoLivreScraper } from "@afilimax/mercado-livre-scraper"
import { Command } from "commander"
import readlineSync from "readline-sync"

import { detectPlatform, generateAffiliateUrl } from "../../helpers/affiliate.helper"
import { openInBrowser } from "../../helpers/browser.helper"
import { logError, logInfo, logJson, logSuccess } from "../../helpers/logger.helper"

const reset = "\x1b[0m"
const bold = "\x1b[1m"
const cyan = "\x1b[38;2;80;200;240m"
const gold = "\x1b[38;2;255;200;0m"
const gray = "\x1b[38;2;140;140;140m"
const green = "\x1b[38;2;80;200;120m"
const red = "\x1b[38;2;255;100;100m"

export function formatPrice(val: number | null | undefined): string {
    if (val == null || isNaN(val)) return "N/A"
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val)
}

export function displayProductCard(product: ScrapedProduct): void {
    console.log(`\n  ${bold}${gold}📦 [${product.marketplace.toUpperCase()}] ${product.title}${reset}\n`)

    const priceCurrent = formatPrice(product.price.value)
    let priceLine = `  ${bold}${green}${priceCurrent}${reset}`

    if (product.price.originalValue && product.price.originalValue > product.price.value) {
        const discountPct = Math.round(
            ((product.price.originalValue - product.price.value) / product.price.originalValue) * 100,
        )
        priceLine += ` ${gray}(De: ${formatPrice(product.price.originalValue)} • ${bold}${cyan}${discountPct}% OFF${reset}${gray})${reset}`
    }
    console.log(`  💰 Preço: ${priceLine}`)

    if (product.price.installment) {
        console.log(
            `  💳 Parcelamento: ${gray}${product.price.installment.count}x de ${formatPrice(product.price.installment.value)}${reset}`,
        )
    }

    if (product.rating && product.rating.average > 0) {
        const stars = "★".repeat(Math.round(product.rating.average)).padEnd(5, "☆")
        const reviewText = product.rating.totalReviews != null ? ` (${product.rating.totalReviews} avaliações)` : ""
        console.log(
            `  ⭐ Avaliação: ${gold}${stars} ${product.rating.average.toFixed(1)}${reset}${gray}${reviewText}${reset}`,
        )
    }

    if (product.shipping) {
        let shippingText = product.shipping.freeShipping
            ? `${green}Frete Grátis${reset}`
            : `${gray}Calculado no checkout${reset}`
        if (product.shipping.full) {
            shippingText += ` ${bold}${gold}⚡ FULL${reset}`
        }
        if (product.shipping.prime) {
            shippingText += ` ${bold}${cyan}Prime${reset}`
        }
        console.log(`  🚚 Frete: ${shippingText}`)
    }

    const stockText = product.availability?.inStock ? `${green}Em estoque${reset}` : `${red}Indisponível${reset}`
    console.log(`  📦 Disponibilidade: ${stockText}`)

    if (product.brand) {
        console.log(`  🏷️  Marca/Vendedor: ${cyan}${product.brand}${reset}`)
    }

    if (product.externalId) {
        console.log(`  🆔 ID Externo: ${gray}${product.externalId}${reset}`)
    }

    if (product.images && product.images.length > 0) {
        console.log(`  🖼️  Imagens (${product.images.length}):`)
        for (const img of product.images.slice(0, 3)) {
            console.log(`     ${gray}• ${img}${reset}`)
        }
        if (product.images.length > 3) {
            console.log(`     ${gray}... e mais ${product.images.length - 3} imagens${reset}`)
        }
    }

    console.log()
}

export async function scrapeProductByUrl(
    url: string,
    options: { json?: boolean; affiliate?: boolean } = {},
): Promise<void> {
    const platform = detectPlatform(url)

    if (!platform || (platform !== "amazon" && platform !== "mercadoLivre" && platform !== "aliexpress")) {
        logError(
            `Plataforma não suportada para scraping direto: ${url}\n  Plataformas suportadas: Amazon, Mercado Livre e AliExpress.`,
        )
        process.exit(1)
    }

    if (!options.json) {
        logInfo(`Extraindo produto de ${platform}...`)
    }

    let product: ScrapedProduct | null = null

    switch (platform) {
        case "amazon": {
            const scraper = new AmazonScraper({ quiet: true })
            try {
                product = await scraper.getProduct({ url })
            } finally {
                await scraper.close()
            }
            break
        }

        case "mercadoLivre": {
            const scraper = new MercadoLivreScraper()
            try {
                product = await scraper.getProduct({ url })
            } finally {
                await scraper.close()
            }
            break
        }

        case "aliexpress": {
            const scraper = new AliExpressScraper({ quiet: true })
            try {
                product = await scraper.getProduct({ url })
            } finally {
                await scraper.close()
            }
            break
        }
    }

    if (!product) {
        logError("Não foi possível extrair as informações do produto.")
        process.exit(1)
    }

    if (options.json) {
        logJson(product)
        return
    }

    displayProductCard(product)

    // Opção de gerar link de afiliado
    let shouldGenerateAffiliate = options.affiliate

    if (!shouldGenerateAffiliate && process.stdout.isTTY) {
        const answer = readlineSync.question(`  🔗 Deseja gerar o link de afiliado para este produto? [s/N]: `)
        shouldGenerateAffiliate = answer.trim().toLowerCase() === "s" || answer.trim().toLowerCase() === "sim"
    }

    if (shouldGenerateAffiliate) {
        logInfo("Gerando link de afiliado...")
        try {
            const affiliateUrl = await generateAffiliateUrl(url, platform)
            logSuccess("Link gerado com sucesso!")
            console.log(`\n  🔗 ${bold}${cyan}${affiliateUrl}${reset}\n`)

            if (process.stdout.isTTY) {
                const openAnswer = readlineSync.question(`  🌐 Deseja abrir o link no navegador? [s/N]: `)
                if (openAnswer.trim().toLowerCase() === "s" || openAnswer.trim().toLowerCase() === "sim") {
                    openInBrowser(affiliateUrl)
                }
            }
        } catch (err: any) {
            logError(err.message || "Erro ao gerar link de afiliado")
        }
    }
}

export const scrapeProductCommand = new Command("product")
    .alias("item")
    .description("Faz scraping dos dados completos de um produto específico através da sua URL")
    .argument("<url>", "URL do produto (Amazon, Mercado Livre ou AliExpress)")
    .option("-j, --json", "Retorna os dados em formato JSON")
    .option("-a, --affiliate", "Gera o link de afiliado automaticamente")
    .action(async (url: string, options: { json?: boolean; affiliate?: boolean }) => {
        try {
            await scrapeProductByUrl(url, options)
        } catch (err: any) {
            logError("Erro ao processar produto", err)
            process.exit(1)
        }
    })
