import fileURIToPath from '@libs/fileURIToPath';
import Log from '@libs/Log';

import type {FileObject} from '@src/types/utils/Attachment';

import {Buffer} from 'buffer';
import RNFS from 'react-native-fs';

import getMimeTypeFromHeaderBytes, {FILE_HEADER_LENGTH} from './getMimeTypeFromHeaderBytes';

/**
 * Reads only the first bytes of a picked file from its URI and identifies its MIME type from them.
 * RNFS reads just the requested byte range, so this stays cheap for large videos.
 * Resolves undefined when the file can't be read or no known signature matches.
 */
async function getMimeTypeFromFileHeader(file: FileObject): Promise<string | undefined> {
    if (typeof file.uri !== 'string') {
        return undefined;
    }
    try {
        const header = await RNFS.read(fileURIToPath(file.uri), FILE_HEADER_LENGTH, 0, 'base64');
        return getMimeTypeFromHeaderBytes(Buffer.from(header, 'base64'));
    } catch (error) {
        Log.warn('[getMimeTypeFromFileHeader] Could not read file header', {error: error instanceof Error ? error.message : String(error)});
        return undefined;
    }
}

export default getMimeTypeFromFileHeader;
