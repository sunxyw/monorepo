import algoliasearch, { type AlgoliaSearchOptions, type SearchClient } from "algoliasearch"
import { registry } from "@inlang/marketplace-registry"
import express from "express"

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

		const text = await fetch((readme as { en: string }).en).then((res) => res.text())

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

const searchRegistry = async (query: string) => {
	const data = await index.search(query)
	return data.hits
}

const listCategory = async (category: string) => {
	index.setSettings({
		searchableAttributes: ["keywords"],
	})
	const data = await index.search(category)
	return data.hits
}

const app = express()

app.get("/", (_: any, response: { send: (arg0: string) => void }) => {
	response.send("Hello world")
})

app.get(
	"/m",
	(request: { query: { category: string } }, response: { send: (arg0: any) => void }) => {
		const category = request.query.category
		listCategory(category).then((results) => {
			response.send(results)
		})
	}
)

app.get("/m", (request: { query: { search: string } }, response: { send: (arg0: any) => void }) => {
	const query = request.query.search
	searchRegistry(query).then((results) => {
		response.send(results)
	})
})
