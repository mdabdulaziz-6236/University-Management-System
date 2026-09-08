import { Router } from "express";
import { Role } from "../../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { departmentControllers } from "./department.controller";
import { DepartmentValidation } from "./department.validation";

const router = Router();

router.post(
	"/create-department",
	auth(Role.SUPER_ADMIN),
	validateRequest(DepartmentValidation.createDepartmentZodSchema),
	departmentControllers.createDepartment,
);

export const DepartmentRoutes = router;
