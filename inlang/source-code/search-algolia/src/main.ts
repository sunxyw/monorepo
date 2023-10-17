import algoliasearch, { type AlgoliaSearchOptions, type SearchClient } from "algoliasearch"
import { registry } from "@inlang/marketplace-registry"

const algolia = algoliasearch as unknown as (
	appId: string,
	apiKey: string,
	options?: AlgoliaSearchOptions
) => SearchClient

const client = algolia("8FJ6M1RWYO", "")
const index = client.initIndex("registry")

const objects = await Promise.all(
	[...registry.values()].map(async (value) => {
		const { id, readme, ...rest } = value

		const text = { en: await fetch((readme as { en: string }).en).then((res) => res.text()) }

		return { objectID: id, ...rest, readme: text }
	})
)

index
	.saveObjects(objects)
	.then(() => {
		console.info("Successfully uploaded registry to Algolia index")
	})
	.catch((err: any) => {
		console.error(err)
	})

export async function searchCategory(category: string): Promise<ReturnType<typeof index.search>> {
	index.setSettings({
		searchableAttributes: ["keywords"],
	})
	const data = await index.search(category)
	return data
}

export async function searchRegistry(query: string): Promise<ReturnType<typeof index.search>> {
	const data = await index.search(query)
	return data
}
