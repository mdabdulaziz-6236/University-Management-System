import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import type { ZodType } from "zod";
import { AppError } from "../utils/AppError";
import { catchAsync } from "../utils/catchAsync";

type RequestValidation = {
	body?: unknown;
	query?: unknown;
	params?: unknown;
	cookies?: unknown;
};

export const validateRequest = (zodSchema: ZodType<RequestValidation>) => {
	return catchAsync(
		async (req: Request, _res: Response, next: NextFunction) => {
			if (req.body && typeof req.body.data === "string") {
				try {
					req.body = JSON.parse(req.body.data);
				} catch {
					throw new AppError(
						httpStatus.BAD_REQUEST,
						"Invalid JSON data in 'data' field",
					);
				}
			}

			const validationData: RequestValidation = {
				body: req.body,
				query: req.query,
				params: req.params,
				cookies: req.cookies,
			};

			const result = await zodSchema.safeParseAsync(validationData);

			if (!result.success) {
				const firstIssue = result.error.issues[0];
				let errorMessage = firstIssue.message;

				const technicalErrors = [
					"Required",
					"expected string",
					"Invalid input",
					"Expected",
				];
				const isTechnical = technicalErrors.some((err) =>
					errorMessage.includes(err),
				);

				if (isTechnical) {
					const fieldPath = firstIssue.path.filter(
						(p) =>
							p !== "body" &&
							p !== "query" &&
							p !== "params" &&
							p !== "cookies",
					);
					const fieldName = fieldPath.join(".");

					errorMessage = fieldName
						? `${fieldName} is required or invalid`
						: "Required validation fields are missing";
				}

				throw new AppError(httpStatus.BAD_REQUEST, errorMessage);
			}

			if (result.data.body !== undefined) {
				req.body = result.data.body;
			}
			if (result.data.query !== undefined) {
				req.query = result.data.query as any;
			}
			if (result.data.params !== undefined) {
				req.params = result.data.params as any;
			}
			if (result.data.cookies !== undefined) {
				req.cookies = result.data.cookies as any;
			}

			next();
		},
	);
};
