import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
	type Application,
	type Request,
	type Response,
} from "express";
import httpStatus from "http-status";
import config from "./app/config";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import { AuthRoutes } from "./app/modules/auth/auth.route";
import { DepartmentRoutes } from "./app/modules/department/department.route";
import { FacultyRoutes } from "./app/modules/faculty/faculty.route";
import { testRoutes } from "./app/modules/test/test.route";

const app: Application = express();

app.use(
	cors({
		origin: config.frontend_url,
		credentials: true,
	}),
);

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/faculty", FacultyRoutes);
app.use("/api/v1/department", DepartmentRoutes);

// test route
app.use("/api/test", testRoutes);

// Basic route
app.get("/", async (req: Request, res: Response) => {
	res.status(httpStatus.OK).json({
		success: true,
		message: "Welcome to University Management System Backend",
	});
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
