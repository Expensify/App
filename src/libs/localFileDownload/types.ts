import type {FileType} from '@libs/FileTypes';

type LocalFileDownload = (fileName: string, textContent: string, fileType?: FileType) => void;

export default LocalFileDownload;
