import z from "zod";

const LoginZodSchema = z.object({
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
	}),
});

const RefreshTokenZodSchema = z.object({
	cookies: z.object({
		refreshToken: z.jwt({ message: "Invalid JWT structure" }),
	}),
});

const ChangePasswordZodSchema = z.object({
	body: z
		.object({
			oldPassword: z.string("Old password is required"),
			newPassword: z
				.string()
				.min(6, "Password must be at least 6 characters long")
				.max(32, "Password must be at most 32 characters long")
				.regex(/[a-z]/, "Password must contain at least one lowercase letter")
				.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
				.regex(/[0-9]/, "Password must contain at least one number")
				.regex(/[^A-Za-z0-9]/, {
					message: "Password must contain at least one special character",
				}),
		})
		.refine((data) => data.oldPassword !== data.newPassword, {
			message: "New password cannot be the same as the old password",
			path: ["newPassword"],
		}),
});

export const UserValidation = {
	LoginZodSchema,
	RefreshTokenZodSchema,
	ChangePasswordZodSchema,
};
