// TODO move variables to  CONST file
/**
 * HEIC file signatures that should be present in the ftyp box
 */
const HEIC_SIGNATURES = [
    '6674797068656963', // 'ftypheic' - Indicates standard HEIC file
    '6674797068656978', // 'ftypheix' - Indicates a variation of HEIC
    '6674797068657631', // 'ftyphevc' - Typically for HEVC encoded media (common in HEIF)
    '667479706d696631', // 'ftypmif1' - Multi-Image Format part of HEIF, broader usage
];

/**
 * JPEG file signatures - JPEG files start with these byte patterns
 */
const JPEG_SIGNATURES = [
    'ffd8ffe0', // JFIF format
    'ffd8ffe1', // EXIF format
    'ffd8ffe2', // Canon EXIF
    'ffd8ffe3', // Samsung EXIF
    'ffd8ffe8', // SPIFF format
    'ffd8ffdb', // Samsung JPEG
];

/**
 * PNG file signature - PNG files always start with this exact signature
 */
const PNG_SIGNATURE = '89504e470d0a1a0a';

/**
 * Verify if a blob contains HEIC format by checking the ftyp box signatures
 */
const verifyHeicFormat = (blob: Blob): Promise<boolean> => {
    // Read first 16 bytes to check for ftyp box and signatures
    return blob
        .slice(0, 16)
        .arrayBuffer()
        .then((arrayBuffer) => {
            const bytes = new Uint8Array(arrayBuffer);

            if (bytes.length < 16) {
                return false;
            }

            // Convert bytes 4-16 to hex string (this is where the ftyp signature is)
            const startOffset = 4;
            const bytesToRead = 12;
            const endOffset = startOffset + bytesToRead;

            if (bytes.length < endOffset) {
                return false;
            }

            const hex = Array.from(bytes.slice(startOffset, endOffset))
                .map((b) => b.toString(16).padStart(2, '0'))
                .join('');

            return HEIC_SIGNATURES.some((signature) => hex.startsWith(signature));
        })
        .catch((error) => {
            console.error('Error verifying HEIC format:', error);
            return false;
        });
};

/**
 * Verify if a blob contains JPEG format by checking the file signatures
 */
const verifyJpegFormat = (blob: Blob): Promise<boolean> => {
    return blob
        .slice(0, 4)
        .arrayBuffer()
        .then((arrayBuffer) => {
            const bytes = new Uint8Array(arrayBuffer);

            if (bytes.length < 4) {
                return false;
            }

            const hex = Array.from(bytes)
                .map((b) => b.toString(16).padStart(2, '0'))
                .join('');

            return JPEG_SIGNATURES.some((signature) => hex.startsWith(signature));
        })
        .catch((error) => {
            console.error('Error verifying JPEG format:', error);
            return false;
        });
};

/**
 * Verify if a blob contains PNG format by checking the file signature
 */
const verifyPngFormat = (blob: Blob): Promise<boolean> => {
    return blob
        .slice(0, 8)
        .arrayBuffer()
        .then((arrayBuffer) => {
            const bytes = new Uint8Array(arrayBuffer);

            if (bytes.length < 8) {
                return false;
            }

            const hex = Array.from(bytes)
                .map((b) => b.toString(16).padStart(2, '0'))
                .join('');

            return hex === PNG_SIGNATURE;
        })
        .catch((error) => {
            console.error('Error verifying PNG format:', error);
            return false;
        });
};

export {verifyHeicFormat, verifyJpegFormat, verifyPngFormat};
