import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { teacherServices } from "./teacher.service";

const createTeacher = catchAsync(async (req: Request, res: Response) => {
	const result = await teacherServices.createTeacher(req.body);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Teacher registered successfully",
		data: result,
	});
});

export const teacherControllers = {
	createTeacher,
};
