import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import type { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import { generateEntityCode } from "../../utils/generateCode";
import type { IFacultySchool } from "./faculty.interface";

const createFaculty = async (payload: IFacultySchool, user: RequestUser) => {
	const generatedCode = generateEntityCode("FAC", payload.shortName);

	const isFacultyExist = await prisma.faculty.findFirst({
		where: {
			OR: [
				{ name: payload.name },
				{ shortName: payload.shortName },
				{ code: generatedCode },
			],
		},
	});

	if (isFacultyExist) {
		throw new AppError(
			httpStatus.CONFLICT,
			"A Faculty with this Name, Short Name, or Code already exists!",
		);
	}

	const result = await prisma.faculty.create({
		data: {
			name: payload.name,
			shortName: payload.shortName,
			description: payload.description,
			code: generatedCode,
			createdById: user.userId,
		},
	});

	return result;
};

export const facultyServices = {
	createFaculty,
};
