import { compileMessage } from "./compileMessage.js"
import { ProjectSettings, type Message } from "@inlang/sdk"
import ts from "typescript"

/**
 * A compile function takes a list of messages and project settings and returns
 * a map of file names to file contents.
 *
 * @example
 *   const output = compile({ messages, settings })
 *   console.log(output)
 *   >> { "messages.js": "...", "runtime.js": "..." }
 */
export const compile = (args: {
	messages: Readonly<Message[]>
	settings: ProjectSettings
}): Record<string, string> => {
	const compiledMessages = args.messages.map(compileMessage).join("\n\n")

	return withTsDeclarations({
		"messages.js": `
import { languageTag } from "./runtime.js"

${compiledMessages}
`,
		"runtime.js": `
/** @type {((tag: AvailableLanguageTag) => void) | undefined} */ 
let _onSetLanguageTag

/**
 * The project's source language tag.
 * 
 * @example
 *   if (newlySelectedLanguageTag === sourceLanguageTag){
 *     // do nothing as the source language tag is the default language
 *     return
 *   }
 */
export const sourceLanguageTag = "${args.settings.sourceLanguageTag}"

/**
 * The project's available language tags.
 * 
 * @example 
 *   if (availableLanguageTags.includes(userSelectedLanguageTag) === false){
 *     throw new Error("Language tag not available")
 *   }
 */
export const availableLanguageTags = /** @type {const} */ (${JSON.stringify(
			args.settings.languageTags
		)})

/**
 * Get the current language tag.
 * 
 * @example
 *   if (languageTag() === "de"){
 *     console.log("Germany 🇩🇪")
 *   } else if (languageTag() === "nl"){
 *     console.log("Netherlands 🇳🇱")
 *   }
 * 
 * @type {() => AvailableLanguageTag}
 */
export let languageTag = () => sourceLanguageTag

/**
 * Set the language tag.
 * 
 * @example 
 * 
 *   // changing to language 
 *   setLanguageTag("en")
 * 
 *   // passing a getter function also works. 
 *   // 
 *   // a getter function is useful for resolving a language tag 
 *   // on the server where every request has a different language tag
 *   setLanguageTag(() => {
 *     return request.langaugeTag
 *   }) 
 *
 * @param {AvailableLanguageTag | (() => AvailableLanguageTag)} tag
 */
export const setLanguageTag = (tag) => {
	if (typeof tag === "function") {
		languageTag = tag
	} else {
		languageTag = () => tag
	}
	// call the callback function if it has been defined
	if (_onSetLanguageTag !== undefined) {
		_onSetLanguageTag(languageTag())
	}
}

/**
 * Set the \`onSetLanguageTag()\` callback function.
 *
 * The function can be used to trigger client-side side-effects such as 
 * making a new request to the server with the updated language tag, 
 * or re-rendering the UI on the client (SPA apps).  
 * 
 * - Don't use this function on the server (!).
 *   Triggering a side-effect is only useful on the client because a server-side
 *   environment doesn't need to re-render the UI. 
 *     
 * - The \`onSetLanguageTag()\` callback can only be defined once to avoid unexpected behavior.
 * 
 * @example
 *   // if you use inlang paraglide on the server, make sure 
 *   // to not call \`onSetLanguageTag()\` on the server
 *   if (isServer === false) {
 *     onSetLanguageTag((tag) => {
 *       // (for example) make a new request to the 
 *       // server with the updated language tag
 *       window.location.href = \`/\${tag}/\${window.location.pathname}\`
 *     })
 *   }
 *
 * @param {(languageTag: AvailableLanguageTag) => void} fn
 */
export const onSetLanguageTag = (fn) => {
	if (_onSetLanguageTag !== undefined) {
		throw new Error("@inlang/paraglide-js: The \`onSetLanguageTag()\` callback has already been defined.\\n\\nThe \`onSetLanguageTag()\` callback can only be defined once to avoid unexpected behavior.\\n\\n 1) Try searching for \`onSetLanguageTag()\` in your codebase for potential duplicated.\\n 2) It might be that your framework is calling \`onSetLanguageTag()\` multiple times. Try to move the \`onSetLanguageTag()\` out of the rendering scope like a React component.")
	}
	_onSetLanguageTag = fn
}

// ------ TYPES ------

/**
 * A language tag that is available in the project.
 * 
 * @example
 *   setLanguageTag(request.languageTag as AvailableLanguageTag)
 * 
 * @typedef {typeof availableLanguageTags[number]} AvailableLanguageTag
 */
`,
	})
}

/**
 * Compiles JavaScript with JSDoc type annotations into
 * JavaScript with TypeScript declaration files.
 *
 * This step is required to make typesafety work across
 * editors. TypeScript does not resolve NPM packages with
 * JSDoc type annotations.
 *
 * In the future, this step might be removed when TypeScript
 * supports resolving JS with JSDoc type annotations from
 * NPM packages.
 *
 * see https://github.com/microsoft/TypeScript/issues/33136#issuecomment-1764428377
 */
const withTsDeclarations = (files: Record<string, string>): Record<string, string> => {
	const options: ts.CompilerOptions = {
		// forcing typescript to "fake" compile the JS files
		// to ensure correct output (otherwise comments and more are stripped!)
		declaration: true,
		emitDeclarationOnly: true,
		allowJs: true,
		removeComments: false,
	}
	const host = ts.createCompilerHost(options)
	host.readFile = (path) => {
		// resolve the fake TS files as JS files
		return files[path.replace(".ts", ".js")]
	}
	host.writeFile = (path, text) => {
		files[path] = text
	}
	const program = ts.createProgram(Object.keys(files), options, host)
	program.emit()
	return files
}
