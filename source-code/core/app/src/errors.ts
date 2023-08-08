export class InvalidConfigError extends Error {
	constructor(message: string, options: ErrorOptions) {
		super(message, options)
		this.name = "InvalidConfigError"
	}
}