import { describe, it, expect } from "vitest"
import { createReactiveQuery } from './createReactiveQuery.js'
import { createEffect, createRoot } from './solid.js'
import type { Message, Text } from '@inlang/plugin'

const createChangeListener = async (cb: () => void) => createEffect(cb)

describe("get", () => {
	it("should react to `create`", async () => {
		await createRoot(async () => {
			const query = createReactiveQuery(() => [])

			// eslint-disable-next-line unicorn/no-null
			let message: Message | undefined | null = null
			await createChangeListener(() =>
				message = query.get({ where: { id: "1" } })
			)
			expect(message).toBeUndefined()

			query.create({ data: { id: "1", selectors: [], body: {} } })

			expect(message).toBeDefined()

			const anotherMessage = query.get({ where: { id: "1" } })
			expect(anotherMessage).toBeDefined()
			expect(message).toStrictEqual(anotherMessage)
		})
	})

	it("should react to `update`", async () => {
		await createRoot(async () => {
			const query = createReactiveQuery(() => [])
			query.create({
				// TODO: use `createMessage` utility
				data: {
					id: "1", selectors: [], body: {
						en: [
							{
								match: {},
								pattern: [
									{
										type: "Text",
										value: "before",
									},
								],
							},
						],
					}
				}
			})

			let message: Message | undefined
			await createChangeListener(() =>
				message = query.get({ where: { id: "1" } })
			)

			expect(message).toBeDefined()
			expect((message!.body.en![0]!.pattern[0]! as Text).value).toBe('before')
			query.update({
				// TODO: use `createMessage` utility
				where: { id: "1" }, data: {
					body: {
						en: [
							{
								match: {},
								pattern: [
									{
										type: "Text",
										value: "after",
									},
								],
							},
						],
					}
				}
			})

			expect((message!.body.en![0]!.pattern[0]! as Text).value).toBe('after')
		})
	})
})