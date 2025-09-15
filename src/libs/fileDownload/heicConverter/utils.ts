// TODO move variables to  CONST file
import CONST from '@src/CONST';

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

            return CONST.HEIC_SIGNATURES.some((signature) => hex.startsWith(signature));
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

            return CONST.JPEG_SIGNATURES.some((signature) => hex.startsWith(signature));
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

            return hex === CONST.PNG_SIGNATURE;
        })
        .catch((error) => {
            console.error('Error verifying PNG format:', error);
            return false;
        });
};

export {verifyHeicFormat, verifyJpegFormat, verifyPngFormat};
