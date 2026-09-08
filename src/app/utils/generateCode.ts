export const generateEntityCode = (prefix: string, shortName: string) => {
	const formattedShortName = shortName.replace(/\s+/g, "").toUpperCase();
	return `${prefix.toUpperCase()}-${formattedShortName}`;
};
