import fs from "node:fs/promises"
import { resolve } from "node:path"
import { openInlangProject, InlangProject, Result, tryCatch } from "@inlang/app"

// in case multiple commands run getInlang in the same process
let cached: Awaited<ReturnType<typeof getInlangProject>> | undefined = undefined

export async function getInlangProject(): Promise<Result<InlangProject, Error>> {
	if (cached) return cached

	const baseDirectory = process.cwd()
	const configPath = resolve(baseDirectory, "inlang.config.json")

	const configExists = await fs
		.access(configPath)
		.then(() => true)
		.catch(() => false)

	if (configExists === false) {
		return { error: new Error("No inlang.config.json file found in the repository.") }
	}

	cached = await tryCatch(() =>
		openInlangProject({
			configPath,
			nodeishFs: fs,
		}),
	)

	return cached
}