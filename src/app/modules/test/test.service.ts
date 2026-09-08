import type { ICreateUser } from "./test.interface";

const createUserService = async (payload: ICreateUser) => {
	return {
		...payload,
		createdAt: new Date(),
	};
};

export const userServices = {
	createUserService,
};
