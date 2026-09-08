import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest";
import { userControllers } from "./test.controller";
import { createUserValidationSchema } from "./test.validation";

const router = Router();

router.post(
	"/create-user",
	validateRequest(createUserValidationSchema),
	userControllers.createUser,
);

export const testRoutes = router;
