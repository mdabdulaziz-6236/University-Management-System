import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import { Role } from "../../../../generated/prisma/enums";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { generateTeacherId } from "../../utils/generateTeacherId";
import type { ICreateTeacherRequest } from "./teacher.interface";

const createTeacher = async (payload: ICreateTeacherRequest) => {
	const isDepartmentExist = await prisma.department.findUnique({
		where: { id: payload.departmentId },
	});

	if (!isDepartmentExist) {
		throw new AppError(
			httpStatus.NOT_FOUND,
			"The specified Department does not exist.",
		);
	}

	const isUserExist = await prisma.user.findUnique({
		where: { email: payload.email },
	});

	if (isUserExist) {
		throw new AppError(
			httpStatus.CONFLICT,
			"A user with this email already exists.",
		);
	}

	const hashedPassword = await bcrypt.hash(
		payload.password,
		Number(config.bcrypt_salt_rounds),
	);

	const employeeId = generateTeacherId();

	const result = await prisma.user.create({
		data: {
			email: payload.email,
			password: hashedPassword,
			role: Role.TEACHER,
			teachers: {
				create: {
					fullName: payload.fullName,
					designation: payload.designation,
					employeeId: employeeId,
					departmentId: payload.departmentId,
					joiningDate: new Date(),
				},
			},
		},
		include: {
			teachers: {
				include: {
					department: true,
				},
			},
		},
		omit: {
			password: true,
		},
	});

	return result;
};

export const teacherServices = {
	createTeacher,
};
