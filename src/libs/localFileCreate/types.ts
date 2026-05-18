type LocalFileCreate = (fileName: string, textContent: string, appendTimestamp?: boolean) => Promise<{path: string; newFileName: string; size: number}>;

export default LocalFileCreate;
