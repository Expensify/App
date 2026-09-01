import type {LocaleContextProps} from '@components/LocaleContextProvider';

import Log from '@libs/Log';

import CONST from '@src/CONST';

import type {Asset} from 'react-native-image-picker';

import {ImageManipulator, SaveFormat} from 'expo-image-manipulator';

import {verifyFileFormat} from './FileUtils';

/**
 * Ensures asset has proper fileName and type properties
 */
const processAssetWithFallbacks = (asset: Asset): Asset => {
    // Generate fallback name: extract from URI if available, otherwise use timestamped default
    const fallbackName = asset.uri
        ? asset.uri
              .substring(asset.uri.lastIndexOf('/') + 1)
              .split('?')
              .at(0)
        : `image_${Date.now()}.jpeg`;
    const fileName = asset.fileName ?? fallbackName;
    return {
        ...asset,
        fileName,
        // Default to JPEG if no type specified
        type: asset.type ?? 'image/jpeg',
    };
};

const getErrorMessage = (error: unknown, fallback: string): string => (error instanceof Error && error.message ? error.message : fallback);

/**
 * Convert the picked assets one at a time, transcoding any HEIC images to JPEG.
 *
 * The conversion is deliberately sequential: `ImageManipulator` decodes each image into a full-size
 * bitmap in native memory, so converting a whole selection at once (the picker allows up to
 * `CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT` files) holds every bitmap simultaneously and the
 * OS terminates the app for exceeding its memory limit. Processing one image at a time keeps the peak
 * at a single bitmap regardless of how many files were picked.
 */
const processPickedAssetsSequentially = async (assets: Asset[], showGeneralAlert: (message?: string) => void, translate: LocaleContextProps['translate']): Promise<Asset[] | undefined> => {
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
            const imageManipulatorContext = ImageManipulator.manipulate(asset.uri);
            try {
                // eslint-disable-next-line no-await-in-loop -- converting one image at a time is the point, see the doc comment above
                const manipulatedImage = await imageManipulatorContext.renderAsync();
                try {
                    // eslint-disable-next-line no-await-in-loop -- converting one image at a time is the point, see the doc comment above
                    const manipulationResult = await manipulatedImage.saveAsync({format: SaveFormat.JPEG});
                    const uri = manipulationResult.uri;
                    const fileName =
                        uri
                            .substring(uri.lastIndexOf('/') + 1)
                            .split('?')
                            .at(0) ?? '';
                    const convertedAsset: Asset = {
                        uri,
                        fileName,
                        type: 'image/jpeg',
                        width: manipulationResult.width,
                        height: manipulationResult.height,
                    };
                    processedAssets.push(convertedAsset);
                } finally {
                    manipulatedImage.release();
                }
            } catch (error) {
                Log.warn('Failed to convert HEIC image, skipping asset', {error: getErrorMessage(error, 'An unknown error occurred')});
                failureMessages.add(translate('attachmentPicker.errorWhileConvertingHeic'));
            } finally {
                imageManipulatorContext.release();
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
