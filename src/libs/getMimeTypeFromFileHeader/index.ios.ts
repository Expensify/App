import fileURIToPath from '@libs/fileURIToPath';
import Log from '@libs/Log';
import {rand64} from '@libs/NumberUtils';

import type {FileObject} from '@src/types/utils/Attachment';

import {Buffer} from 'buffer';
import ReactNativeBlobUtil from 'react-native-blob-util';

import getMimeTypeFromHeaderBytes, {FILE_HEADER_LENGTH} from './getMimeTypeFromHeaderBytes';

/**
 * Reads only the first bytes of a picked file from its URI and identifies its MIME type from them.
 * RNFS.read resolves an empty string on iOS, so the header range is copied into a temp file and read back instead.
 * Resolves undefined when the file can't be read or no known signature matches.
 */
async function getMimeTypeFromFileHeader(file: FileObject): Promise<string | undefined> {
    if (typeof file.uri !== 'string') {
        return undefined;
    }
    const tempPath = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/mime-sniff-head-${rand64()}`;
    try {
        // blob-util rejects file:// URIs on iOS, so it needs the bare path
        await ReactNativeBlobUtil.fs.slice(fileURIToPath(file.uri), tempPath, 0, FILE_HEADER_LENGTH);
        const header: unknown = await ReactNativeBlobUtil.fs.readFile(tempPath, 'base64');
        if (typeof header !== 'string') {
            return undefined;
        }
        return getMimeTypeFromHeaderBytes(Buffer.from(header, 'base64'));
    } catch (error) {
        Log.warn('[getMimeTypeFromFileHeader] Could not read file header', {error: error instanceof Error ? error.message : String(error)});
        return undefined;
    } finally {
        ReactNativeBlobUtil.fs.unlink(tempPath).catch((error: unknown) => {
            Log.warn('[getMimeTypeFromFileHeader] Could not delete temp header file', {error: error instanceof Error ? error.message : String(error)});
        });
    }
}

export default getMimeTypeFromFileHeader;
