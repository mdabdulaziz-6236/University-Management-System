import { Router } from "express";
import { Role } from "../../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { teacherControllers } from "./teacher.controller";
import { TeacherValidation } from "./teacher.validation";

const router = Router();

router.post(
	"/create-teacher",
	auth(Role.SUPER_ADMIN),
	validateRequest(TeacherValidation.createTeacherZodSchema),
	teacherControllers.createTeacher,
);

export const TeacherRoutes = router;
