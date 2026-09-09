import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import type { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import { generateEntityCode } from "../../utils/generateCode";
import type { IDepartmentCreate } from "./department.interface";
import { Role } from "../../../../generated/prisma/enums";

/* Create Department */
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

/* Create Department Head */
const assignHod = async (departmentId: string, teacherId: string) => {
	const transactionResult = await prisma.$transaction(async (tx) => {
		const department = await tx.department.findUnique({
			where: { id: departmentId },
		});

		if (!department) {
			throw new AppError(httpStatus.NOT_FOUND, "Department not found!");
		}

		const teacher = await tx.teacher.findUnique({
			where: { id: teacherId },
		});

		if (!teacher) {
			throw new AppError(httpStatus.NOT_FOUND, "Teacher not found!");
		}

		if (teacher.departmentId !== departmentId) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				`This teacher belongs to another department. You cannot make him/her the HOD of ${department.name}.`,
			);
		}

		if (department.headOfDeptId === teacher.id) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				`This teacher is already assigned as the Head of Department.`,
			);
		}

		await tx.user.update({
			where: { id: teacher.userId },
			data: {
				role: Role.HOD,
			},
		});

		const result = await tx.department.update({
			where: { id: departmentId },
			data: {
				headOfDeptId: teacherId,
			},
			include: {
				headOfDept: true,
			},
		});

		return result;
	});
	return transactionResult;
};

export const departmentServices = {
	createDepartment,
	assignHod,
};
