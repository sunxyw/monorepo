import { context } from "esbuild"
import { globPlugin } from "esbuild-plugin-glob"
import { dtsPlugin } from "esbuild-plugin-d.ts"
import { definePublicEnvVariables, getPrivateEnvVariables } from "./env.js"

// can't use import from ./env.js. must avoid circular dependency.
const isDevelopment = process.env.DEV ? true : false

// @ts-expect-error - esbuild plugin types are wrong
const ctx = await context({
	entryPoints: ["./lib/**/*.ts", "env.ts"],
	plugins: [globPlugin({ ignore: ["**/*.test.ts"] }), dtsPlugin()],
	outdir: "./dist",
	bundle: false,
	platform: "neutral",
	format: "esm",
	sourcemap: isDevelopment,
	define: await definePublicEnvVariables(await getPrivateEnvVariables()),
})

if (isDevelopment) {
	await ctx.watch()
	console.info("👀 watching for changes...")
} else {
	await ctx.rebuild()
	await ctx.dispose()
	console.info("✅ build complete")
}