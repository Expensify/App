import type {FileObject} from '@components/AttachmentModal';

function isFileUploadable(file: File | FileObject | undefined): boolean {
    return file instanceof Blob;
}

export default isFileUploadable;
