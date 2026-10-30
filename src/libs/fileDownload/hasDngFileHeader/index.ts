import {isLabelledTiff, matchesFileSignature} from '@libs/fileDownload/FileUtils';
import Log from '@libs/Log';

import CONST from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';

/** Every entry of `CONST.TIFF_SIGNATURES` is 4 bytes long. */
const TIFF_SIGNATURE_LENGTH = 4;

/**
 * Whether a file carries the TIFF header a DNG starts with although it isn't labelled as a TIFF, e.g. a ProRAW renamed
 * to `.jpg` or picked without an extension. Reads only the leading bytes, so a 75 MB ProRAW isn't loaded into memory.
 */
async function hasDngFileHeader(file: FileObject): Promise<boolean> {
    if (!(file instanceof Blob) || isLabelledTiff(file)) {
        return false;
    }

    try {
        const headerBytes = new Uint8Array(await file.slice(0, CONST.TIFF_SIGNATURE_OFFSET + TIFF_SIGNATURE_LENGTH).arrayBuffer());
        const headerHex = Array.from(headerBytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
        return matchesFileSignature(headerHex, CONST.TIFF_SIGNATURES, CONST.TIFF_SIGNATURE_OFFSET);
    } catch (error) {
        Log.warn('[hasDngFileHeader] Could not read file header', {error: error instanceof Error ? error.message : String(error)});
        return false;
    }
}

export default hasDngFileHeader;
