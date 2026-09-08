import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest";
import { AuthController } from "./auth.controller";
import { UserValidation } from "./auth.validation";
import { Role } from "../../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";

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

router.post(
	"/change-password",
	auth(Role.STUDENT, Role.FACULTY, Role.ADMIN, Role.SUPER_ADMIN),
	validateRequest(UserValidation.ChangePasswordZodSchema),
	AuthController.changePassword,
);

export const AuthRoutes = router;
