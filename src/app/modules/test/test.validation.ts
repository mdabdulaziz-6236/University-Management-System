import { z } from "zod";

export const createUserValidationSchema = z.object({
	body: z.object({
		name: z.string({
			message: "Name is required",
		}),
		email: z.email("Invalid email format"),
		password: z.string().min(6, "Password must be at least 6 characters"),
	}),
});
