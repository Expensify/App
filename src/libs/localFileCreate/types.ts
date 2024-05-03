import type {FileType} from '@libs/FileTypes';

type LocalFileCreate = (fileName: string, textContent: string, fileType?: FileType) => Promise<{path: string; newFileName: string; size: number}>;

export default LocalFileCreate;
