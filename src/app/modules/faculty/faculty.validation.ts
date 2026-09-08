import { z } from "zod";

const createFacultyZodSchema = z.object({
	body: z.object({
		name: z
			.string("Faculty name is required")
			.trim()
			.min(1, "Faculty name cannot be empty"),
		shortName: z
			.string("Short name is required")
			.trim()
			.min(1, "Short name cannot be empty"),
		description: z.string().optional(),
	}),
});

export const FacultyValidation = {
	createFacultyZodSchema,
};
