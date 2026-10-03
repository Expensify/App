// cspell:ignore ftyp heix heim heis hevc hevx avis

/** Number of leading bytes read from a file, enough to cover every signature below. */
const FILE_HEADER_LENGTH = 32;

/**
 * ISO base media brands that are images rather than videos. HEIC/HEIF must keep its extensionless name so
 * the HEIC conversion flow isn't bypassed, and AVIF shares the `ftyp` box with MP4.
 */
const IMAGE_FTYP_BRANDS = new Set(['heic', 'heix', 'heim', 'heis', 'hevc', 'hevx', 'mif1', 'msf1', 'avif', 'avis']);

const AUDIO_FTYP_BRANDS = new Set(['M4A ', 'M4B ']);

function hasBytes(bytes: Uint8Array, signature: number[], offset = 0): boolean {
    return signature.every((byte, index) => bytes[offset + index] === byte);
}

function readASCII(bytes: Uint8Array, offset: number, length: number): string {
    return String.fromCharCode(...bytes.subarray(offset, offset + length));
}

function getMimeTypeFromFtypBrand(brand: string): string | undefined {
    if (IMAGE_FTYP_BRANDS.has(brand)) {
        return undefined;
    }
    if (AUDIO_FTYP_BRANDS.has(brand)) {
        return 'audio/mp4';
    }
    if (brand === 'qt  ') {
        return 'video/quicktime';
    }
    if (brand.startsWith('3gp')) {
        return 'video/3gpp';
    }
    return 'video/mp4';
}

/**
 * Identifies a file's MIME type from its leading bytes. Used when a file has neither an extension nor a
 * meaningful MIME type, such as an extensionless file picked through the Android document picker.
 * Returns undefined when no known signature matches.
 */
function getMimeTypeFromHeaderBytes(bytes: Uint8Array): string | undefined {
    if (readASCII(bytes, 4, 4) === 'ftyp') {
        return getMimeTypeFromFtypBrand(readASCII(bytes, 8, 4));
    }
    if (hasBytes(bytes, [0x1a, 0x45, 0xdf, 0xa3])) {
        return 'video/webm';
    }
    if (hasBytes(bytes, [0xff, 0xd8, 0xff])) {
        return 'image/jpeg';
    }
    if (hasBytes(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
        return 'image/png';
    }
    if (readASCII(bytes, 0, 4) === 'GIF8') {
        return 'image/gif';
    }
    if (readASCII(bytes, 0, 4) === '%PDF') {
        return 'application/pdf';
    }
    if (readASCII(bytes, 0, 4) === 'RIFF' && readASCII(bytes, 8, 4) === 'WEBP') {
        return 'image/webp';
    }
    return undefined;
}

export default getMimeTypeFromHeaderBytes;
export {FILE_HEADER_LENGTH};
