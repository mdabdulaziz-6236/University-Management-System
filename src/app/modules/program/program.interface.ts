import type { DegreeLevel } from "../../../../generated/prisma/enums";

export interface IProgram {
	name: string;
	shortName: string;
	degreeLevel: DegreeLevel;
	durationYears: number;
	totalCredits: number;
	departmentId: string;
}
