import express, { Router } from "express"
import { searchCategory, searchRegistry } from "./main.js"

export const router: Router = express.Router()

router.get(
	"/search-algolia",
	(
		request: { query: { category?: string; term?: string } },
		response: { send: (arg0: any) => void }
	) => {
		if (request.query.category) {
			searchCategory(request.query.category).then((results) => {
				// @ts-expect-error because it is an unknown type
				response.send(results.hits)
			})
		} else if (request.query.term) {
			searchRegistry(request.query.term).then((results) => {
				// @ts-expect-error because it is an unknown type
				response.send(results.hits)
			})
		}
	}
)
