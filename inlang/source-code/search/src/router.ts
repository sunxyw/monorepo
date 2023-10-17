import express, { Router } from "express"
import { searchCategory, searchRegistry } from "./main.js"

export const router: Router = express.Router()

router.get(
	"/search",
	(
		request: { query: { category?: string; term?: string } },
		response: { send: (arg0: any) => void }
	) => {
		if (request.query.category) {
			searchCategory(request.query.category).then((results) => {
				response.send(results.hits)
			})
		} else if (request.query.term) {
			searchRegistry(request.query.term).then((results) => {
				response.send(results.hits)
			})
		}
	}
)
