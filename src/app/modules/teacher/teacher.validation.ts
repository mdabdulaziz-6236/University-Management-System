import { z } from "zod";

const createTeacherZodSchema = z.object({
	body: z.object({
		email: z.email("Invalid email address"),
		password: z
			.string()
			.min(6, "Password must be at least 6 characters long")
			.max(32, "Password must be at most 32 characters long")
			.regex(/[a-z]/, "Password must contain at least one lowercase letter")
			.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
			.regex(/[0-9]/, "Password must contain at least one number")
			.regex(/[^A-Za-z0-9]/, {
				message: "Password must contain at least one special character",
			}),
		fullName: z.string().trim().min(1, "Full name cannot be empty"),
		designation: z.string().trim().min(1, "Designation cannot be empty"),
		departmentId: z.uuid("Invalid Department ID format"),
	}),
});

export const TeacherValidation = {
	createTeacherZodSchema,
};
