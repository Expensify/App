import type {FileObject} from '@pages/media/AttachmentModalScreen/types';

function isFileUploadable(file: FileObject | undefined): boolean {
    return file instanceof Blob;
}

export default isFileUploadable;
