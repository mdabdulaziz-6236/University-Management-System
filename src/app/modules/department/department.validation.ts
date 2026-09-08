import { z } from "zod";

const createDepartmentZodSchema = z.object({
	body: z.object({
		name: z
			.string("Department name is required")
			.trim()
			.min(1, "Department name cannot be empty"),
		shortName: z
			.string("Short name is required")
			.trim()
			.min(1, "Short name cannot be empty"),
		facultyId: z.uuid("Invalid Academic Faculty ID format"),
		description: z.string().optional(),
	}),
});

export const DepartmentValidation = {
	createDepartmentZodSchema,
};
