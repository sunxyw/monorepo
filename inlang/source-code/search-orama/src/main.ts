import { create, insert, search } from "@orama/orama"
import { registry } from "@inlang/marketplace-registry"

interface DatabaseSchema {
	icon: string
	gallery: "string[]"
	displayName: {
		en: string
	}
	description: {
		en: string
	}
	readme: {
		en: string
	}
	keywords: "string[]"
	publisherName: string
	publisherIcon: string
	license: string
}

const db = await create<DatabaseSchema>({
	schema: {
		icon: "string",
		gallery: "string[]",
		displayName: {
			en: "string",
		},
		description: {
			en: "string",
		},
		readme: {
			en: "string",
		},
		keywords: "string[]",
		publisherName: "string",
		publisherIcon: "string",
		license: "string",
	},
})

const indexedItems = await Promise.all(
	[...registry.values()].map(async (value) => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { $schema, readme, id, ...rest } = value

		const text = { en: await fetch((readme as { en: string }).en).then((res) => res.text()) }

		return { ...rest, readme: text, slug: id }
	})
)

// @ts-ignore
for (const item of indexedItems) await insert(db, item)

console.info("Successfully uploaded registry to Orama database")

export function searchCategory(category: string) {
	return search(db, { term: category, properties: ["keywords"] })
}

export function searchRegistry(query: string) {
	return search(db, { term: query })
}
