import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { facultyServices } from "./faculty.service";

const createFaculty = catchAsync(async (req: Request, res: Response) => {
	const adminId = req.user!;
	const result = await facultyServices.createFaculty(req.body, adminId);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Faculty created successfully",
		data: result,
	});
});

export const facultyControllers = {
	createFaculty,
};
