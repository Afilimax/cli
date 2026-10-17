import { Command } from "commander"

import { detectPlatform, generateAffiliateUrl } from "../../helpers/affiliate.helper"
import { logError, logInfo, logSuccess } from "../../helpers/logger.helper"
import { createAliExpressCommand } from "./aliexpress"
import { createAmazonCommand } from "./amazon"
import { createMagazineLuizaCommand } from "./magazine-luiza"
import { createMercadoLivreCommand } from "./mercado-livre"
import { createShopeeCommand } from "./shopee"

async function autoCreateAffiliateUrl(url: string): Promise<void> {
    const platform = detectPlatform(url)

    if (!platform) {
        logError(
            `Não foi possível detectar a plataforma para: ${url}\n  Tente: afilimax create amazon|mercado-livre|shopee|aliexpress|magazine-luiza <url>`,
        )
        process.exit(1)
    }

    logInfo(`Plataforma detectada: ${platform}`)
    logInfo("Gerando link de afiliado...")

    try {
        const affiliateUrl = await generateAffiliateUrl(url, platform)
        logSuccess("Link gerado com sucesso!")
        console.log(`\n  🔗 ${affiliateUrl}\n`)
    } catch (err: any) {
        logError(err.message || "Erro ao gerar link de afiliado")
        process.exit(1)
    }
}

export const createCommand = new Command("create")
    .description("Gera um link de afiliado. Detecta a plataforma automaticamente, ou use um subcomando específico.")
    .argument("[url]", "URL do produto (Amazon, Mercado Livre, Shopee, AliExpress ou Magazine Luiza)")
    .action(async (url?: string) => {
        if (!url) {
            createCommand.help()
            return
        }

        try {
            await autoCreateAffiliateUrl(url)
        } catch (err) {
            logError("Erro inesperado ao gerar link", err)
            process.exit(1)
        }
    })
    .addCommand(createAmazonCommand)
    .addCommand(createMercadoLivreCommand)
    .addCommand(createShopeeCommand)
    .addCommand(createAliExpressCommand)
    .addCommand(createMagazineLuizaCommand)
