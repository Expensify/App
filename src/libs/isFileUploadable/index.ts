import type {FileObject} from '@src/types/utils/Attachment';

function isFileUploadable(file: FileObject | undefined): boolean {
    return file instanceof Blob;
}

export default isFileUploadable;
