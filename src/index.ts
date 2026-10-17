import { Command } from "commander"

import { description, name, version } from "../package.json"
import { configCommand, createCommand, scrapeCommand } from "./commands/index"
import { cliBanner } from "./helpers/cli-banner.helper"

export function createProgram(): Command {
    const program = new Command()

    program.name(name).version(version).description(description).addHelpText("before", cliBanner)

    program.addCommand(createCommand)
    program.addCommand(configCommand)
    program.addCommand(scrapeCommand)

    return program
}

export function main(argv: string[] = process.argv): void {
    const program = createProgram()
    program.parse(argv)
}
