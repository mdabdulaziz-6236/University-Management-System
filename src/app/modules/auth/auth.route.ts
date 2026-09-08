import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest";
import { AuthController } from "./auth.controller";
import { UserValidation } from "./auth.validation";

const router = Router();

router.post(
	"/login",
	validateRequest(UserValidation.LoginZodSchema),
	AuthController.loginUser,
);

router.post(
	"/refresh-token",
	validateRequest(UserValidation.RefreshTokenZodSchema),
	AuthController.refreshToken,
);

export const AuthRoutes = router;
