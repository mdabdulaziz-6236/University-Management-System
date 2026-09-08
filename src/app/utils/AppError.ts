export class AppError extends Error {
	public statusCode: number;

	constructor(statusCode: number, message: string, staK = "") {
		super(message); // throw new Eroor(message)

		this.statusCode = statusCode;

		if (staK) {
			this.stack = staK;
		} else {
			Error.captureStackTrace(this, this.constructor);
		}
	}
}
