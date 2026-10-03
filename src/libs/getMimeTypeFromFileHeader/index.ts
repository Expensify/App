import type {FileObject} from '@src/types/utils/Attachment';

import getMimeTypeFromHeaderBytes, {FILE_HEADER_LENGTH} from './getMimeTypeFromHeaderBytes';

/**
 * Reads only the first bytes of a web File and identifies its MIME type from them.
 * Resolves undefined when the file can't be read or no known signature matches.
 */
async function getMimeTypeFromFileHeader(file: FileObject): Promise<string | undefined> {
    if (!(file instanceof Blob)) {
        return undefined;
    }
    try {
        const header = await file.slice(0, FILE_HEADER_LENGTH).arrayBuffer();
        return getMimeTypeFromHeaderBytes(new Uint8Array(header));
    } catch {
        return undefined;
    }
}

export default getMimeTypeFromFileHeader;
