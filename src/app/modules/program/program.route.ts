import { Router } from "express";
import { Role } from "../../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { programControllers } from "./program.controller";
import { ProgramValidation } from "./program.validation";

const router = Router();

router.post(
	"/create-program",
	auth(Role.SUPER_ADMIN, Role.HOD),
	validateRequest(ProgramValidation.createProgramZodSchema),
	programControllers.createProgram,
);

export const ProgramRoutes = router;
