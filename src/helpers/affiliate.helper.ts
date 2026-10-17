import { AliExpressProvider } from "@afilimax/aliexpress-provider"
import { AmazonBrowserProvider } from "@afilimax/amazon-browser-provider"
import { MagazineLuizaProvider } from "@afilimax/magazine-luiza-provider"
import { MercadoLivreProvider } from "@afilimax/mercado-livre-provider"
import { ShopeeProvider } from "@afilimax/shopee-provider"

import { areCookiesValid, getCookiesEarliestExpiry, loadConfig } from "./config.helper"

export type AffiliatePlatform = "amazon" | "mercadoLivre" | "shopee" | "aliexpress" | "magazineLuiza"

export const platformDomains: Record<AffiliatePlatform, string[]> = {
    amazon: ["amazon.com.br", "a.co", "amzn.to"],
    mercadoLivre: ["mercadolivre.com.br", "mercadolibre.com", "meli.la"],
    shopee: ["shopee.com.br", "shopee.com", "sho.pe", "shp.ee"],
    aliexpress: ["aliexpress.com", "pt.aliexpress.com"],
    magazineLuiza: ["magazineluiza.com.br", "magalu.com.br", "mglu.is", "parceiromagalu.com.br"],
}

export function detectPlatform(url: string): AffiliatePlatform | null {
    try {
        const hostname = new URL(url).hostname.toLowerCase()

        for (const [platform, domains] of Object.entries(platformDomains) as [AffiliatePlatform, string[]][]) {
            if (domains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`))) {
                return platform
            }
        }
    } catch {
        // invalid URL
    }

    return null
}

export async function generateAffiliateUrl(url: string, platformOverride?: AffiliatePlatform): Promise<string> {
    const platform = platformOverride ?? detectPlatform(url)

    if (!platform) {
        throw new Error(`Não foi possível detectar a plataforma suportada para o link: ${url}`)
    }

    const config = loadConfig()

    switch (platform) {
        case "amazon": {
            if (!config.amazon?.cookies?.length) {
                throw new Error("Amazon não configurado. Execute: afilimax config amazon")
            }
            if (!areCookiesValid(config.amazon.cookies, "amazon")) {
                const expiry = getCookiesEarliestExpiry(config.amazon.cookies, "amazon")
                throw new Error(
                    `Cookies da Amazon expirados${expiry ? ` (desde ${expiry.toLocaleDateString("pt-BR")})` : ""}. Execute: afilimax config amazon`,
                )
            }
            const amazonProvider = new AmazonBrowserProvider({
                cookies: config.amazon.cookies,
                puppeteer: { headless: true },
            })
            return await amazonProvider.createAffiliateUrl(url)
        }

        case "mercadoLivre": {
            if (!config.mercadoLivre?.cookies?.length) {
                throw new Error("Mercado Livre não configurado. Execute: afilimax config mercado-livre")
            }
            if (!areCookiesValid(config.mercadoLivre.cookies, "mercadoLivre")) {
                const expiry = getCookiesEarliestExpiry(config.mercadoLivre.cookies, "mercadoLivre")
                throw new Error(
                    `Cookies do Mercado Livre expirados${expiry ? ` (desde ${expiry.toLocaleDateString("pt-BR")})` : ""}. Execute: afilimax config mercado-livre`,
                )
            }
            const mlProvider = new MercadoLivreProvider({
                tag: config.mercadoLivre.tag,
                cookies: config.mercadoLivre.cookies,
            })
            return await mlProvider.createAffiliateUrl(url)
        }

        case "shopee": {
            if (!config.shopee?.appId || !config.shopee?.appSecret) {
                throw new Error("Shopee não configurado. Execute: afilimax config shopee --app-id ... --app-secret ...")
            }
            const shopeeProvider = new ShopeeProvider({
                appId: config.shopee.appId,
                appSecret: config.shopee.appSecret,
                subIds: config.shopee.subIds ?? [],
            })
            return await shopeeProvider.createAffiliateUrl(url)
        }

        case "aliexpress": {
            if (!config.aliexpress?.appKey || !config.aliexpress?.appSecret || !config.aliexpress?.trackingId) {
                throw new Error(
                    "AliExpress não configurado. Execute: afilimax config aliexpress --app-key ... --app-secret ... --tracking-id ...",
                )
            }
            const aliProvider = new AliExpressProvider({
                appKey: config.aliexpress.appKey,
                appSecret: config.aliexpress.appSecret,
                trackingId: config.aliexpress.trackingId,
            })
            return await aliProvider.createAffiliateUrl(url)
        }

        case "magazineLuiza": {
            if (!config.magazineLuiza?.cookies?.length) {
                throw new Error("Magazine Luiza não configurado. Execute: afilimax config magazine-luiza")
            }
            if (!areCookiesValid(config.magazineLuiza.cookies, "magazineLuiza")) {
                const expiry = getCookiesEarliestExpiry(config.magazineLuiza.cookies, "magazineLuiza")
                throw new Error(
                    `Cookies do Magazine Luiza expirados${expiry ? ` (desde ${expiry.toLocaleDateString("pt-BR")})` : ""}. Execute: afilimax config magazine-luiza`,
                )
            }
            const magaluProvider = new MagazineLuizaProvider({
                affiliateSlug: config.magazineLuiza.affiliateSlug,
                cookies: config.magazineLuiza.cookies as any,
            })
            return await magaluProvider.createAffiliateUrl(url)
        }
    }
}
