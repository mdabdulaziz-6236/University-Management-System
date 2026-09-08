export const generateTeacherId = () => {
	const timestamp = Date.now().toString().slice(-6);
	return `TCH-${timestamp}`;
};
