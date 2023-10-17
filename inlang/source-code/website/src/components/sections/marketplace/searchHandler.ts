import type { MarketplaceManifest } from "@inlang/marketplace-manifest"
import type { Category, SubCategory } from "./index.jsx"
import { registry } from "@inlang/marketplace-registry"

// export const searchHandler = async (
// 	selectedSubCategories: SubCategory[],
// 	searchValue: string,
// 	selectedCategory?: string
// ) => {
// 	const searchResults = await fetch(
// 		`http://localhost:3000/search-orama?category=${selectedCategory}`
// 	)
// 		.then((res) => res.json())
// 		.then((data) => data)

// 	const filteredItems = searchResults.map((result: Record<string, any>) => {
// 		const item = result.document

// 		item.id = item.slug
// 		delete item.slug

// 		return item as MarketplaceManifest
// 	})

// 	return filteredItems
// }

export const searchHandler = async (
	selectedSubCategories: SubCategory[],
	searchValue: string,
	selectedCategory?: string
) => {
	const searchResults = await fetch(
		`http://localhost:3000/search-algolia?category=${selectedCategory}`
	)
		.then((res) => res.json())
		.then((data) => data)

	const filteredItems = searchResults.map((item: Record<string, any>) => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { objectID, _highlightResult, ...rest } = item

		return { id: objectID, ...rest } as MarketplaceManifest
	})

	return filteredItems
}
