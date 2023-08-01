import type { PluginOptions } from "./plugin.js"

/**
 * Throws an error if the options are invalid.
 *
 * Not using zod becaue it's not worth the bundle size (2kb vs 14kb).
 */
export function throwIfInvalidOptions(options: PluginOptions) {
	if (typeof options.pathPattern === "string") {
		if (options.pathPattern.includes("{language}") === false) {
			throw new Error(
				"The pathPattern setting must be defined and include the {language} placeholder. An example would be './resources/{language}.json'.",
			)
		} else if (options.pathPattern.endsWith(".json") === false) {
			throw new Error(
				"The pathPattern setting must end with '.json'. An example would be './resources/{language}.json'.",
			)
		} else if (options.pathPattern.includes("*")) {
			throw new Error(
				"The pathPattern includes a '*' wildcard. This was depricated in version 3.0.0. Check https://github.com/inlang/inlang/tree/main/source-code/plugins/i18next/ for how to use PluginSettings",
			)
		}
	} else {
		for (const [prefix, path] of Object.entries(options.pathPattern)) {
			if (path === undefined || path.includes("{language}") === false) {
				throw new Error(
					"The pathPattern setting must be defined and include the {language} placeholder. An example would be './resources/{language}.json'.",
				)
			} else if (path.endsWith(".json") === false) {
				throw new Error(
					"The pathPattern setting must end with '.json'. An example would be './resources/{language}.json'.",
				)
			} else if (prefix.includes(".")) {
				throw new Error(
					"A prefix of pathPattern includes an '.'. Use a string without dot notations. An example would be 'common'.",
				)
			}
		}
	}
}
