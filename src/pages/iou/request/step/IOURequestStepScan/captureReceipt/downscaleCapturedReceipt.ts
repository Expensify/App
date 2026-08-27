import getImageManipulator from '@libs/fileDownload/getImageManipulator';
import fileURIToPath from '@libs/fileURIToPath';
import Log from '@libs/Log';

import CONST from '@src/CONST';

import RNFS from 'react-native-fs';
import ImageSize from 'react-native-image-size';

/**
 * Bounds a freshly captured receipt to `CONST.MAX_IMAGE_DIMENSION` before anything else touches it.
 *
 * vision-camera writes the frame at the sensor's native resolution — 12MP and up on current iPhones,
 * which lands as an 11-19MB JPEG. Every stage after capture then works against that full-resolution
 * file: durable storage, the confirmation preview, the multi-scan preview list, and the multipart
 * upload. Decoding it repeatedly is the single largest contributor to the iOS watchdog terminations
 * tracked in Sentry APP-4X, and SmartScan gains nothing from resolution beyond MAX_IMAGE_DIMENSION,
 * so the cap is applied once here at the source.
 *
 * Returns the path to carry forward. Any failure resolves with the original path, so a capture is
 * never lost because the downscale could not run.
 */
async function downscaleCapturedReceipt(capturedPath: string): Promise<string> {
    try {
        const uri = capturedPath.startsWith('file://') ? capturedPath : `file://${capturedPath}`;
        const {width, height} = await ImageSize.getSize(uri);
        const longestSide = Math.max(width, height);

        // Already within budget. Skip the re-encode rather than pay for it and lose quality for nothing.
        if (!longestSide || longestSide <= CONST.MAX_IMAGE_DIMENSION) {
            return capturedPath;
        }

        const scaleFactor = CONST.MAX_IMAGE_DIMENSION / longestSide;
        const resized = await getImageManipulator({
            fileUri: uri,
            width: Math.max(1, Math.round(width * scaleFactor)),
            height: Math.max(1, Math.round(height * scaleFactor)),
            fileName: capturedPath.split('/').pop() ?? '',
            type: 'image/jpeg',
            compress: CONST.RECEIPT_CAMERA.DOWNSCALED_QUALITY,
        });

        if (!resized?.uri) {
            return capturedPath;
        }

        // The manipulator wrote its output to the cache directory, so the full-resolution original is
        // now a second copy of the same receipt. Drop it instead of leaving it on disk until logout.
        RNFS.unlink(fileURIToPath(capturedPath)).catch((error: unknown) => {
            Log.warn('[downscaleCapturedReceipt] could not remove the full-resolution capture', {error});
        });

        return resized.uri;
    } catch (error) {
        Log.warn('[downscaleCapturedReceipt] falling back to the full-resolution capture', {error});
        return capturedPath;
    }
}

export default downscaleCapturedReceipt;
