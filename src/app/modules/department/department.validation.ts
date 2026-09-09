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

const assignHodZodSchema = z.object({
	params: z.object({
		departmentId: z.uuid("Invalid Department ID format"),
	}),
	body: z.object({
		teacherId: z.uuid("Invalid Teacher ID format"),
	}),
});

export const DepartmentValidation = {
	createDepartmentZodSchema,
	assignHodZodSchema,
};
