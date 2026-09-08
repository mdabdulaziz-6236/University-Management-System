import type { Request, Response } from "express";
import httpStatus from "http-status";
import config from "../../config";
import { AppError } from "../../utils/AppError";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { authServices } from "./auth.service";

const loginUser = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const result = await authServices.loginUser(payload);
	const { accessToken, refreshToken, user } = result;
	const isProduction = config.node_env === "production";

	res.cookie("accessToken", accessToken, {
		httpOnly: true,
		secure: isProduction,
		sameSite: isProduction ? "none" : "lax",
		maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
	});
	res.cookie("refreshToken", refreshToken, {
		httpOnly: true,
		secure: isProduction,
		sameSite: isProduction ? "none" : "lax",
		maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
	});

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User logged in successfully",
		data: {
			accessToken,
			user,
		},
	});
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
	const token = req.cookies.refreshToken;
	if (!token) {
		throw new AppError(
			httpStatus.UNAUTHORIZED,
			"Refresh token is missing. Please log in again.",
		);
	}
	const { accessToken, refreshToken } = await authServices.refreshToken(token);

	const isProduction = config.node_env === "production";

	res.cookie("accessToken", accessToken, {
		httpOnly: true,
		secure: isProduction,
		sameSite: isProduction ? "none" : "lax",
		maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
	});
	res.cookie("refreshToken", refreshToken, {
		httpOnly: true,
		secure: isProduction,
		sameSite: isProduction ? "none" : "lax",
		maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
	});

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Access token generated successfully",
		data: {
			accessToken,
		},
	});
});

export const AuthController = {
	loginUser,
	refreshToken,
};
