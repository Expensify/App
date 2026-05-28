import type {FileObject} from '@src/types/utils/Attachment';

/**
 * Returns a source URI for the given file.
 * On native, files have a `uri` property; on web, we create a blob URL.
 */
function getFileSource(file: FileObject): string {
    return file.uri ?? URL.createObjectURL(file as Blob);
}

export default getFileSource;
