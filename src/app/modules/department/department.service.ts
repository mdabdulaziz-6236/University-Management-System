import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import type { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import { generateEntityCode } from "../../utils/generateCode";
import type { IDepartmentCreate } from "./department.interface";

const createDepartment = async (
	payload: IDepartmentCreate,
	user: RequestUser,
) => {
	const facultyExist = await prisma.faculty.findUnique({
		where: { id: payload.facultyId },
	});

	if (!facultyExist) {
		throw new AppError(
			httpStatus.NOT_FOUND,
			"The specified Academic Faculty does not exist.",
		);
	}
	const generatedCode = generateEntityCode("DEPT", payload.shortName);
	const isDepartmentExist = await prisma.department.findFirst({
		where: {
			OR: [
				{ name: payload.name },
				{ shortName: payload.shortName },
				{ code: generatedCode },
			],
		},
	});

	if (isDepartmentExist) {
		throw new AppError(
			httpStatus.CONFLICT,
			"A Department with this Name, Short Name, or Code already exists!",
		);
	}

	const result = await prisma.department.create({
		data: {
			name: payload.name,
			shortName: payload.shortName,
			description: payload.description,
			code: generatedCode,
			createdById: user.userId,
			facultyId: payload.facultyId,
		},
		include: {
			faculty: true,
		},
	});

	return result;
};

export const departmentServices = {
	createDepartment,
};
