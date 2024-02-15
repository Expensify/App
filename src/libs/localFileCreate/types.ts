type LocalFileCreate = (fileName: string, textContent: string) => Promise<{path: string; newFileName: string; size: number}>;

export default LocalFileCreate;
