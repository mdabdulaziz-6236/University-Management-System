import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { departmentServices } from "./department.service";

const createDepartment = catchAsync(async (req: Request, res: Response) => {
	const adminId = req.user!;
	const result = await departmentServices.createDepartment(req.body, adminId);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Department created successfully",
		data: result,
	});
});

/* Create Department Head */
const assignHod = catchAsync(async (req: Request, res: Response) => {
	const departmentId = req.params.departmentId as string;
	const { teacherId } = req.body;

	const result = await departmentServices.assignHod(departmentId, teacherId);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Head of Department assigned successfully",
		data: result,
	});
});

export const departmentControllers = {
	createDepartment,
	assignHod,
};
