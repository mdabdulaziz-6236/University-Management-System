import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { programServices } from "./program.service";

const createProgram = catchAsync(async (req: Request, res: Response) => {
	const adminId = req.user!;
	const result = await programServices.createProgram(req.body, adminId);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Program created successfully",
		data: result,
	});
});

export const programControllers = {
	createProgram,
};
