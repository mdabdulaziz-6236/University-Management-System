import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import { AccountStatus, Role } from "../../../generated/prisma/enums";
import config from "../config";
import { prisma } from "../lib/prisma";
import { AppError } from "./AppError";

export const seedSuperAdmin = async () => {
	try {
		const isSuperAdminExist = await prisma.user.findFirst({
			where: {
				role: Role.SUPER_ADMIN,
			},
		});

		if (isSuperAdminExist) {
			console.log("Super Admin Already Exists!");
			return;
		}

		const fullName = config.super_admin_name;
		const email = config.super_admin_email;
		const password = config.super_admin_password;

		if (!fullName || !email || !password) {
			throw new AppError(
				httpStatus.INTERNAL_SERVER_ERROR,
				"Super Admin Name, Email, or Password is not defined in .env file",
			);
		}

		const hashedPassword = await bcrypt.hash(
			password,
			Number(config.bcrypt_salt_rounds),
		);

		// 2. Prisma Nested Writes
		const superAdminUser = await prisma.user.create({
			data: {
				email,
				password: hashedPassword,
				role: Role.SUPER_ADMIN,
				status: AccountStatus.ACTIVE,
				isEmailVerified: true,

				superAdmin: {
					create: {
						fullName: fullName,
						designation: "System Owner",
						isSystemOwner: true,
					},
				},
			},
			include: {
				superAdmin: true,
			},
		});

		console.log("Super Admin Created Successfully: ", superAdminUser.email);
	} catch (error) {
		console.error("Error Seeding Super Admin: ", error);
	}
};

export const seedAdmin = async () => {
	try {
		const name = config.tester_admin_name;
		const email = config.tester_admin_email;
		const password = config.tester_admin_password;
		if (!name || !email || !password) {
			throw new AppError(
				httpStatus.INTERNAL_SERVER_ERROR,
				"Tester Admin Name, Email or Password is not defined in .env file",
			);
		}
		const isAdminExist = await prisma.user.findUnique({
			where: {
				email: email,
			},
		});
		if (isAdminExist) {
			console.log("Admin Already Exist!");
			return;
		}

		const hashedPassword = await bcrypt.hash(
			password,
			Number(config.bcrypt_salt_rounds),
		);

		const admin = await prisma.user.create({
			data: {
				name,
				email,
				role: Role.ADMIN,
				password: hashedPassword,
				needPasswordChange: false,
				emailVerified: true,
			},
		});
		console.log("Tester Admin Created :", admin);
	} catch (error) {
		console.log("Error Seeding Admin : ", error);
		if (config.tester_admin_email) {
			await prisma.user.delete({
				where: {
					email: config.tester_admin_email,
				},
			});
		}
	}
};
