import httpStatus from "http-status";
import config from "../config";
import { AppError } from "../utils/AppError";
import { redisClient } from "./redis";

const ID_TOKEN_KEY = "bkash-ums:idToken";
const REFRESH_TOKEN_KEY = "bkash-ums:refreshToken";
const MIN_VALID_TTL_SECONDS = 600; // 10 minutes
const ID_TOKEN_EXPIRY = 60 * 60; // 1 hour
const REFRESH_TOKEN_EXPIRY = 60 * 60 * 24 * 28; // 28 days

const getBkashHeaders = () => ({
	"Content-Type": "application/json",
	Accept: "application/json",
	username: config.bkash_username as string,
	password: config.bkash_password as string,
});

export const getBkashIdToken = async () => {
	try {
		const bkashIdToken = await redisClient.get(ID_TOKEN_KEY);
		const idTokenTTL = await redisClient.ttl(ID_TOKEN_KEY);

		// ১. যদি ID Token থাকে এবং সেটির মেয়াদ ১০ মিনিটের বেশি থাকে।
		if (bkashIdToken && idTokenTTL > MIN_VALID_TTL_SECONDS) {
			return bkashIdToken;
		}

		const bkashRefreshToken = await redisClient.get(REFRESH_TOKEN_KEY);
		const refreshTokenTTL = await redisClient.ttl(REFRESH_TOKEN_KEY);

		// ২. Refresh Token ভ্যালিড থাকলে রিফ্রেশ করার চেষ্টা করবে
		if (bkashRefreshToken && refreshTokenTTL > MIN_VALID_TTL_SECONDS) {
			try {
				return await refreshBkashToken(bkashRefreshToken);
			} catch {
				// Warning: রিফ্রেশ ফেইল করলে আটকে না থেকে Fallback হিসেবে নতুন টোকেন গ্র্যান্ট করবে
				console.warn(
					"bKash Refresh Token failed, falling back to Grant New Token...",
				);
			}
		}

		// ৩. কোনো টোকেন না থাকলে বা রিফ্রেশ ফেইল করলে নতুন টোকেন জেনারেট করবে
		return await grantNewBkashToken();
	} catch (error: any) {
		if (error instanceof AppError) throw error;

		throw new AppError(
			httpStatus.INTERNAL_SERVER_ERROR,
			error.message || "Failed to get bKash token",
		);
	}
};

// --- Helper Functions ---

// JSON পার্স করার জন্য একটি সেইফ (Safe) ফাংশন
const parseJSON = async (response: Response) => {
	try {
		return await response.json();
	} catch (error) {
		throw new AppError(
			httpStatus.BAD_GATEWAY,
			"Invalid response from bKash API (Not a JSON)",
		);
	}
};

const refreshBkashToken = async (refreshToken: string) => {
	const response = await fetch(
		`${config.bkash_base_url}/tokenized/checkout/token/refresh`,
		{
			method: "POST",
			headers: getBkashHeaders(),
			body: JSON.stringify({
				app_key: config.bkash_app_key,
				app_secret: config.bkash_app_secret,
				refresh_token: refreshToken,
			}),
		},
	);

	const data = await parseJSON(response); // Safe Parsing

	if (!response.ok || data.statusCode !== "0000") {
		throw new AppError(
			httpStatus.UNAUTHORIZED,
			data.statusMessage || "Bkash Refresh Token Grant Failed",
		);
	}

	await Promise.all([
		redisClient.set(ID_TOKEN_KEY, data.id_token, { EX: ID_TOKEN_EXPIRY }),
		redisClient.set(REFRESH_TOKEN_KEY, data.refresh_token, {
			EX: REFRESH_TOKEN_EXPIRY,
		}),
	]);

	return data.id_token as string;
};

const grantNewBkashToken = async () => {
	const response = await fetch(
		`${config.bkash_base_url}/tokenized/checkout/token/grant`,
		{
			method: "POST",
			headers: getBkashHeaders(),
			body: JSON.stringify({
				app_key: config.bkash_app_key,
				app_secret: config.bkash_app_secret,
			}),
		},
	);

	const data = await parseJSON(response); // Safe Parsing

	if (!response.ok || data.statusCode !== "0000") {
		throw new AppError(
			httpStatus.UNAUTHORIZED,
			data.statusMessage || "Bkash Access Token Grant Failed",
		);
	}

	await Promise.all([
		redisClient.set(ID_TOKEN_KEY, data.id_token, { EX: ID_TOKEN_EXPIRY }),
		redisClient.set(REFRESH_TOKEN_KEY, data.refresh_token, {
			EX: REFRESH_TOKEN_EXPIRY,
		}),
	]);

	return data.id_token as string;
};
