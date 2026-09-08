import { Router } from "express";
import { Role } from "../../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { facultyControllers } from "./faculty.controller";
import { FacultyValidation } from "./faculty.validation";

const router = Router();

router.post(
	"/create-faculty",
	auth(Role.SUPER_ADMIN),
	validateRequest(FacultyValidation.createFacultyZodSchema),
	facultyControllers.createFaculty,
);

export const FacultyRoutes = router;
