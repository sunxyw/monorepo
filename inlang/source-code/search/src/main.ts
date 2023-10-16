import algoliasearch, { type AlgoliaSearchOptions, type SearchClient } from "algoliasearch"
import { registry } from "@inlang/marketplace-registry"
import express from "express"

const algolia = algoliasearch as unknown as (
	appId: string,
	apiKey: string,
	options?: AlgoliaSearchOptions
) => SearchClient

const client = algolia("8FJ6M1RWYO", process.env.ALGOLIA_API_KEY)
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

const searchCategory = async (query: string) => {
	const data = await index.search(query)
	return data.hits
}

const app = express()

app.get("/", (_: any, response: { send: (arg0: string) => void }) => {
	response.send("Hello world")
})

app.get("/search", (request: { query: { q: string } }, response: { send: (arg0: any) => void }) => {
	const query = request.query.q
	searchCategory(query).then((results) => {
		response.send(results)
	})
})

app.listen(3000, () => {
	console.info("Server is listening")
})
