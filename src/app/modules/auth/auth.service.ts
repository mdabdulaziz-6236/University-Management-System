import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import type { JwtPayload, SignOptions } from "jsonwebtoken";
import { AccountStatus } from "../../../../generated/prisma/enums";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { jwtUtils } from "../../utils/jwt";
import type {
	IChangePasswordPayload,
	ILoginUserPayload,
} from "./auth.interface";

const loginUser = async (payload: ILoginUserPayload) => {
	const { password } = payload;
	const email = payload.email.trim().toLowerCase();

	const user = await prisma.user.findUnique({
		where: { email },
	});

	// Security: OWASP
	if (!user || user.isDeleted || user.status === AccountStatus.DELETED) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
	}

	if (user.status === AccountStatus.BLOCKED) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"Your account is blocked. Please contact the administration.",
		);
	}

	if (user.status === AccountStatus.SUSPENDED) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"Your account is temporarily suspended.",
		);
	}

	if (!user.password && user.googleId) {
		throw new AppError(
			httpStatus.CONFLICT,
			"This email is registered with Google. Please use 'Login with Google'.",
		);
	}

	const isPasswordMatched = await bcrypt.compare(
		password,
		user.password as string,
	);

	// Security: OWASP
	if (!isPasswordMatched) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
	}

	const accessTokenPayload = {
		userId: user.id,
		role: user.role,
		email: user.email,
	};

	const accessToken = jwtUtils.createToken(
		accessTokenPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);

	const refreshTokenPayload = {
		userId: user.id,
	};

	const refreshToken = jwtUtils.createToken(
		refreshTokenPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions,
	);

	// Security & Auditing:
	await prisma.user.update({
		where: { id: user.id },
		data: {
			lastLoginAt: new Date(),
			refreshToken: refreshToken,
		},
	});

	return {
		accessToken,
		refreshToken,
		user: {
			id: user.id,
			email: user.email,
			role: user.role,
			isEmailVerified: user.isEmailVerified,
		},
	};
};

const refreshToken = async (token: string) => {
	const verifiedRefreshToken = jwtUtils.verifyToken(
		token,
		config.jwt_refresh_secret,
	);

	if (!verifiedRefreshToken.success || !verifiedRefreshToken.data) {
		throw new AppError(
			httpStatus.UNAUTHORIZED,
			config.node_env === "development"
				? verifiedRefreshToken.error
				: "Invalid refresh token",
		);
	}

	const data = verifiedRefreshToken.data as JwtPayload;

	const user = await prisma.user.findUnique({
		where: { id: data.userId },
	});

	if (!user || user.isDeleted || user.status !== AccountStatus.ACTIVE) {
		throw new AppError(
			httpStatus.UNAUTHORIZED,
			"User is inactive or not found",
		);
	}

	if (user.refreshToken !== token) {
		throw new AppError(
			httpStatus.UNAUTHORIZED,
			"Session expired or token compromised. Please log in again.",
		);
	}

	const accessTokenPayload = {
		userId: user.id,
		role: user.role,
		email: user.email,
	};

	const newAccessToken = jwtUtils.createToken(
		accessTokenPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);

	const refreshTokenPayload = {
		userId: user.id,
	};

	const newRefreshToken = jwtUtils.createToken(
		refreshTokenPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions,
	);
	await prisma.user.update({
		where: { id: user.id },
		data: {
			refreshToken: newRefreshToken,
		},
	});

	return {
		accessToken: newAccessToken,
		refreshToken: newRefreshToken,
	};
};

const changePassword = async (
	userId: string,
	payload: IChangePasswordPayload,
) => {
	const user = await prisma.user.findUnique({
		where: { id: userId },
	});

	if (!user || user.isDeleted || user.status !== "ACTIVE") {
		throw new AppError(httpStatus.UNAUTHORIZED, "User not found or inactive");
	}

	if (!user.password && user.googleId) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"You registered with Google. You cannot change your password here.",
		);
	}
	const isPasswordMatched = await bcrypt.compare(
		payload.oldPassword,
		user.password as string,
	);

	if (!isPasswordMatched) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Incorrect old password");
	}
	const hashedNewPassword = await bcrypt.hash(
		payload.newPassword,
		Number(config.bcrypt_salt_rounds),
	);

	await prisma.user.update({
		where: { id: userId },
		data: {
			password: hashedNewPassword,
			passwordChangedAt: new Date(),
		},
	});

	return null;
};

export const authServices = {
	loginUser,
	refreshToken,
	changePassword,
};
