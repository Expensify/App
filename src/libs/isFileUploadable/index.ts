import type {FileObject} from '@components/AttachmentModal';

function isFileUploadable(file: FileObject | undefined): boolean {
    return file instanceof Blob;
}

export default isFileUploadable;
