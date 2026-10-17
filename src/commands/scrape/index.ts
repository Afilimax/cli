import { Command } from "commander"

import { scrapeProductByUrl, scrapeProductCommand } from "./product"
import { scrapeSearchCommand } from "./search"

export const scrapeCommand = new Command("scrape")
    .description("Realiza scraping de produtos específicos ou pesquisa com paginação e geração de link de afiliado")
    .argument("[url]", "URL do produto para extração direta de detalhes (atalho para 'scrape product <url>')")
    .option("-j, --json", "Retorna os dados em formato JSON")
    .option("-a, --affiliate", "Gera o link de afiliado automaticamente")
    .action(async (url?: string, options?: { json?: boolean; affiliate?: boolean }) => {
        if (!url) {
            scrapeCommand.help()
            return
        }

        await scrapeProductByUrl(url, options)
    })
    .addCommand(scrapeProductCommand)
    .addCommand(scrapeSearchCommand)

export { scrapeProductCommand } from "./product"
export { scrapeSearchCommand } from "./search"
