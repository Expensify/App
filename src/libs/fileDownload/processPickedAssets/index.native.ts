import {getFileName, verifyFileFormat} from '@libs/fileDownload/FileUtils';
import Log from '@libs/Log';

import CONST from '@src/CONST';

import type {Asset} from 'react-native-image-picker';

import {ImageManipulator, SaveFormat} from 'expo-image-manipulator';

import type ProcessPickedAssetsFunction from './types';

/**
 * Ensures asset has proper fileName and type properties. Callers only pass assets that have a `uri`.
 */
function processAssetWithFallbacks(asset: Asset): Asset {
    return {
        ...asset,
        fileName: asset.fileName ?? getFileName(asset.uri ?? ''),
        // Default to JPEG if no type specified
        type: asset.type ?? 'image/jpeg',
    };
}

function getErrorMessage(error: unknown, fallback: string): string {
    return error instanceof Error && error.message ? error.message : fallback;
}

/**
 * Frees a native image resource. Releasing is best-effort cleanup, so a failure here must never change
 * whether the converted asset is kept.
 */
function releaseQuietly(releasable: {release: () => void}) {
    try {
        releasable.release();
    } catch (error) {
        Log.warn('Failed to release native image resource', {error: getErrorMessage(error, 'An unknown error occurred')});
    }
}

/**
 * Transcodes a single HEIC image to JPEG, returning `undefined` if the conversion fails.
 *
 * The native context and the rendered bitmap are released as soon as they are no longer needed rather
 * than waiting for the garbage collector, which has no visibility into the native memory they retain.
 */
async function convertHeicToJpeg(uri: string): Promise<Asset | undefined> {
    const imageManipulatorContext = ImageManipulator.manipulate(uri);
    try {
        const manipulatedImage = await imageManipulatorContext.renderAsync();
        try {
            const manipulationResult = await manipulatedImage.saveAsync({format: SaveFormat.JPEG});
            return {
                uri: manipulationResult.uri,
                fileName: getFileName(manipulationResult.uri),
                type: 'image/jpeg',
                width: manipulationResult.width,
                height: manipulationResult.height,
            };
        } finally {
            releaseQuietly(manipulatedImage);
        }
    } catch (error) {
        Log.warn('Failed to convert HEIC image, skipping asset', {error: getErrorMessage(error, 'An unknown error occurred')});
        return undefined;
    } finally {
        releaseQuietly(imageManipulatorContext);
    }
}

/**
 * Convert the picked assets one at a time, transcoding any HEIC images to JPEG.
 *
 * The conversion is deliberately sequential: `ImageManipulator` decodes each image into a full-size
 * bitmap in native memory, so converting a whole selection at once (the picker allows up to
 * `CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT` files) holds every bitmap simultaneously and the
 * OS terminates the app for exceeding its memory limit. Processing one image at a time keeps the peak
 * at a single bitmap regardless of how many files were picked.
 */
const processPickedAssetsSequentially: ProcessPickedAssetsFunction = async (assets, showGeneralAlert, translate) => {
    const processedAssets: Asset[] = [];
    // Collected instead of alerted inline so the whole selection produces a single alert: alerting per
    // asset would leave the user dismissing one native modal after another.
    const failureMessages = new Set<string>();

    for (const asset of assets) {
        if (!asset.uri) {
            continue;
        }

        if (!asset.type?.startsWith('image')) {
            // Ensure the asset has proper fileName and type
            processedAssets.push(processAssetWithFallbacks(asset));
            continue;
        }

        try {
            // eslint-disable-next-line no-await-in-loop -- converting one image at a time is the point, see the doc comment above
            const isHEIC = await verifyFileFormat({fileUri: asset.uri, formatSignatures: CONST.HEIC_SIGNATURES});

            if (!isHEIC) {
                // Ensure the asset has proper fileName and type for non-HEIC images
                processedAssets.push(processAssetWithFallbacks(asset));
                continue;
            }

            // react-native-image-picker incorrectly changes file extension without transcoding the HEIC file, so we are doing it manually if we detect HEIC signature
            // eslint-disable-next-line no-await-in-loop -- converting one image at a time is the point, see the doc comment above
            const convertedAsset = await convertHeicToJpeg(asset.uri);

            if (convertedAsset) {
                processedAssets.push(convertedAsset);
            } else {
                failureMessages.add(translate('attachmentPicker.errorWhileConvertingHeic'));
            }
        } catch (error) {
            failureMessages.add(getErrorMessage(error, translate('attachmentPicker.errorWhileSelectingAttachment')));
        }
    }

    if (failureMessages.size > 0) {
        showGeneralAlert([...failureMessages].join('\n'));
    }

    return processedAssets.length > 0 ? processedAssets : undefined;
};

export default processPickedAssetsSequentially;
