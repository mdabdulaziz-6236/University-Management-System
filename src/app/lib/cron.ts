import cron from "node-cron";

export const Cron = async () => {
	cron.schedule("*/100 * * * * *", async () => {
		console.log("cron schedule (ervery 10 seconds) is running");
	});
};
