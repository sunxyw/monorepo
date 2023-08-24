import type { InlangProject } from "../api.js"
import { observable, type from as solidFrom } from "../solid.js"
import type { MessageQueryApi } from "@inlang/app"

export const solidAdapter = (
	project: InlangProject,
	args: {
		from: typeof solidFrom
	},
): InlangProjectWithSolidAdapter => {
	const convert = <T>(signal: () => T): (() => T) => {
		return args.from(observable(signal)) as () => T
	}

	return {
		appSpecificApi: convert(project.appSpecificApi),
		config: convert(project.config),
		errors: convert(project.errors),
		lint: {
			init: project.lint.init,
			reports: convert(project.lint.reports),
		},
		installed: {
			lintRules: convert(project.installed.lintRules),
			plugins: convert(project.installed.plugins),
		},
		setConfig: project.setConfig,
		query: {
			messages: {
				create: project.query.messages.create,
				update: project.query.messages.update,
				delete: project.query.messages.delete,
				upsert: project.query.messages.upsert,
				get: project.query.messages.get,
				getAll: convert(project.query.messages.getAll),
			},
		},
	} satisfies InlangProjectWithSolidAdapter
}

export type InlangProjectWithSolidAdapter = {
	appSpecificApi: () => ReturnType<InlangProject["appSpecificApi"]>
	installed: {
		plugins: () => ReturnType<InlangProject["installed"]["plugins"]>
		lintRules: () => ReturnType<InlangProject["installed"]["lintRules"]>
	}
	errors: () => ReturnType<InlangProject["errors"]>
	config: () => ReturnType<InlangProject["config"]>
	setConfig: InlangProject["setConfig"]
	query: {
		messages: {
			create: MessageQueryApi["create"]
			update: MessageQueryApi["update"]
			delete: MessageQueryApi["delete"]
			upsert: MessageQueryApi["upsert"]
			get: MessageQueryApi["get"]
			getAll: () => ReturnType<MessageQueryApi["getAll"]>
		}
	}
	lint: {
		/**
		 * Initialize lint.
		 */
		init: () => ReturnType<InlangProject["lint"]["init"]>
		// for now, only simply array that can be improved in the future
		// see https://github.com/inlang/inlang/issues/1098
		reports: () => ReturnType<InlangProject["lint"]["reports"]>
	}
}