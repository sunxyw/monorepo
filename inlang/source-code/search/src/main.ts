import { create, insert, search } from "@orama/orama"
import { registry } from "@inlang/marketplace-registry"
import express from "express"

interface DatabaseSchema {
	icon: string
	gallery: string[]
	displayName: {
		en: string
	}
	description: {
		en: string
	}
	readme: {
		en: string
	}
	keywords: string[]
	publisherName: string
	publisherIcon: string
	license: string
}

const db = await create<DatabaseSchema>({
	schema: {
		icon: "string",
		gallery: "string[]" as unknown as string[],
		displayName: {
			en: "string",
		},
		description: {
			en: "string",
		},
		readme: {
			en: "string",
		},
		keywords: "string[]" as unknown as string[],
		publisherName: "string",
		publisherIcon: "string",
		license: "string",
	},
})

const indexedItems = await Promise.all(
	[...registry.values()].map(async (value) => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { id, $schema, readme, ...rest } = value

		const text = { en: await fetch((readme as { en: string }).en).then((res) => res.text()) }

		return { ...rest, readme: text }
	})
)

// @ts-ignore
for (const item of indexedItems) await insert(db, item)

const app = express()

app.get(
	"/api/search",
	(
		request: { query: { category?: string; term?: string } },
		response: { send: (arg0: any) => void }
	) => {
		const category = request.query.category
		const term = request.query.term

		if (category) {
			search(db, { term: category, properties: ["keywords"] }).then((results) => {
				response.send(results.hits)
			})
		} else if (term) {
			search(db, { term }).then((results) => {
				response.send(results.hits)
			})
		}
	}
)
