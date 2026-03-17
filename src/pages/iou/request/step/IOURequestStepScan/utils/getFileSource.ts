import type {FileObject} from '@src/types/utils/Attachment';

function getFileSource(file: FileObject): string {
    return file.uri ?? URL.createObjectURL(file as Blob);
}

export default getFileSource;
