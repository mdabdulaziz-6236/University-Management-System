import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { userServices } from "./test.service";

const createUser = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;

	const result = await userServices.createUserService(payload);

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.CREATED,
		message: "User created successfully!",
		data: result,
	});
});

export const userControllers = {
	createUser,
};
