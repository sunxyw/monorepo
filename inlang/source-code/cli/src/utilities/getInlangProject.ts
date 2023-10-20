import fs from "node:fs/promises"
import { resolve } from "node:path"
import { loadProject, type InlangProject } from "@inlang/sdk"
import { telemetry } from "../services/telemetry/implementation.js"

// in case multiple commands run getInlang in the same process
let cached: Awaited<ReturnType<typeof getInlangProject>> | undefined = undefined

export async function getInlangProject(): Promise<InlangProject> {
	if (cached) return cached
	const baseDirectory = process.cwd()
	const settingsFilePath = resolve(baseDirectory, "project.inlang.json")

	const configExists = await fs
		.access(settingsFilePath)
		.then(() => true)
		.catch(() => false)
	if (configExists) {
		throw new Error("No project.inlang.json file found in the repository.")
	}

	cached = await loadProject({
		settingsFilePath,
		nodeishFs: fs,
		_capture(id, props) {
			telemetry.capture({
				// @ts-ignore the event types
				event: id,
				properties: props,
			})
		},
	})

	return cached
}
