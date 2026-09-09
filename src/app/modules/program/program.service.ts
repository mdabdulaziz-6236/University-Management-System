import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import type { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import type { IProgram } from "./program.interface";

const createProgram = async (payload: IProgram, user: RequestUser) => {
	const department = await prisma.department.findUnique({
		where: { id: payload.departmentId },
	});

	if (!department) {
		throw new AppError(
			httpStatus.NOT_FOUND,
			"The specified Department does not exist.",
		);
	}

	const formattedProgramShortName = payload.shortName
		.replace(/[^a-zA-Z0-9]/g, "")
		.toUpperCase();
	const generatedCode = `PRG-${formattedProgramShortName}-${department.shortName.toUpperCase()}`;

	const isProgramExist = await prisma.program.findFirst({
		where: {
			OR: [{ name: payload.name }, { code: generatedCode }],
		},
	});

	if (isProgramExist) {
		throw new AppError(
			httpStatus.CONFLICT,
			`A Program with name '${payload.name}' or code '${generatedCode}' already exists!`,
		);
	}

	const result = await prisma.program.create({
		data: {
			...payload,
			code: generatedCode,
			createdById: user.userId,
		},
		include: {
			department: true,
		},
	});

	return result;
};

export const programServices = {
	createProgram,
};
