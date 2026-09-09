import { z } from "zod";
import { DegreeLevel } from "../../../../generated/prisma/enums";

const createProgramZodSchema = z.object({
	body: z.object({
		name: z
			.string({ message: "Program name is required" })
			.trim()
			.min(1, "Program name cannot be empty"),

		shortName: z
			.string({ message: "Short name is required" })
			.trim()
			.min(1, "Short name cannot be empty"),

		degreeLevel: z.enum(DegreeLevel, {
			message:
				"Invalid degree level. Must be UNDERGRADUATE, POSTGRADUATE, DIPLOMA, PHD, or CERTIFICATE",
		}),

		durationYears: z
			.number({ message: "Duration years is required" })
			.positive("Duration must be a positive number")
			.min(1, "Duration must be at least 1 year"),

		totalCredits: z
			.number({ message: "Total credits is required" })
			.positive("Total credits must be a positive number")
			.min(1, "Total credits cannot be 0"),

		departmentId: z.uuid("Invalid Department ID format"),
	}),
});

export const ProgramValidation = {
	createProgramZodSchema,
};
