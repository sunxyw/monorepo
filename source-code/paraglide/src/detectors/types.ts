import type { LanguageTag } from "@inlang/app"

type MaybePromise<T> = T | Promise<T>

export type Detector<Parameters extends unknown[] = never[]> = (
	...parameters: Parameters
) => MaybePromise<LanguageTag[]>

export type DetectorInitializer<Parameters extends unknown[] = never[]> = (
	...parameters: Parameters
) => Detector<Parameters>