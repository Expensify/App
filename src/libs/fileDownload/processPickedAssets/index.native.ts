import {getFileName, isLabelledTiff, verifyFileFormat} from '@libs/fileDownload/FileUtils';
import Log from '@libs/Log';

import CONST from '@src/CONST';

import type {Asset} from 'react-native-image-picker';
import type {TupleToUnion} from 'type-fest';

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
 * Image formats that the picker hands over under a misleading `.jpg` name and that we transcode to a real
 * JPEG before upload. Ordered so the more specific check runs first.
 */
const TRANSCODED_FORMATS = [
    {name: 'HEIC', formatSignatures: CONST.HEIC_SIGNATURES, signatureOffset: CONST.HEIC_SIGNATURE_OFFSET},
    // A DNG (iPhone ProRAW) is a TIFF container, so plain TIFFs are caught by the same signature. Neither is
    // supported by the backend or renderable on web, and react-native-image-picker labels both as JPEG.
    {name: 'TIFF/DNG', formatSignatures: CONST.TIFF_SIGNATURES, signatureOffset: CONST.TIFF_SIGNATURE_OFFSET},
] as const;

type TranscodedFormat = TupleToUnion<typeof TRANSCODED_FORMATS>;

const TIFF_FORMAT = TRANSCODED_FORMATS[1];

/**
 * Returns the entry of `TRANSCODED_FORMATS` the asset should be transcoded from, or `undefined` for anything
 * else (e.g. a real JPEG or PNG), which is passed through untouched.
 *
 * A TIFF/DNG label (what Android's picker and the document picker provide) is trusted without reading the
 * file, so those picks don't depend on the header read succeeding. Everything else, including the `.jpg`
 * that iOS relabels a ProRAW to, is sniffed from its magic bytes.
 */
async function detectFormatToTranscode(asset: Asset & {uri: string}): Promise<TranscodedFormat | undefined> {
    if (isLabelledTiff({name: asset.fileName ?? getFileName(asset.uri), type: asset.type})) {
        return TIFF_FORMAT;
    }

    const uri = asset.uri;
    for (const format of TRANSCODED_FORMATS) {
        // eslint-disable-next-line no-await-in-loop -- each check reads a handful of bytes and the second one only runs if the first fails to match
        const isMatch = await verifyFileFormat({fileUri: uri, formatSignatures: format.formatSignatures, signatureOffset: format.signatureOffset});
        if (isMatch) {
            return format;
        }
    }
    return undefined;
}

/**
 * Transcodes a single HEIC or TIFF/DNG image to JPEG, returning `undefined` if the conversion fails.
 *
 * The native context and the rendered bitmap are released as soon as they are no longer needed rather
 * than waiting for the garbage collector, which has no visibility into the native memory they retain.
 *
 * This repeats the manipulate/render/save sequence from `heicConverter` rather than calling it, because
 * that helper decides what to convert from the `.heic`/`.heif` extension. react-native-image-picker
 * relabels the extension without transcoding, so this path has to detect the format from the file
 * signature instead and cannot go through `convertHeicImage`.
 *
 * Decoding is left to the OS image loader (ImageIO on iOS, BitmapFactory/ImageDecoder on Android), which
 * handles DNG on current OS versions; where it doesn't, the render fails and the asset is skipped.
 */
async function convertToJpeg(uri: string, formatName: TranscodedFormat['name']): Promise<Asset | undefined> {
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
        Log.warn(`Failed to convert ${formatName} image, skipping asset`, {error: getErrorMessage(error, 'An unknown error occurred')});
        return undefined;
    } finally {
        releaseQuietly(imageManipulatorContext);
    }
}

/**
 * Convert the picked assets one at a time, transcoding any HEIC or TIFF/DNG images to JPEG.
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

        // Android's MIME map doesn't know DNG on every device, in which case the picker reports `type: null` for a
        // file that is still named `.dng`, so the extension is consulted before treating the asset as a non-image.
        const isImage = !!asset.type?.startsWith('image') || isLabelledTiff({name: asset.fileName ?? getFileName(asset.uri), type: asset.type});
        if (!isImage) {
            // Ensure the asset has proper fileName and type
            processedAssets.push(processAssetWithFallbacks(asset));
            continue;
        }

        try {
            // eslint-disable-next-line no-await-in-loop -- converting one image at a time is the point, see the doc comment above
            const formatToTranscode = await detectFormatToTranscode({...asset, uri: asset.uri});

            if (!formatToTranscode) {
                // Ensure the asset has proper fileName and type for images that need no transcoding
                processedAssets.push(processAssetWithFallbacks(asset));
                continue;
            }

            // react-native-image-picker sniffs only the first byte and labels anything it doesn't recognize as JPEG without
            // transcoding it. HEIC and TIFF/DNG both end up as a broken `<uuid>.jpg`, so we transcode them for real here.
            // eslint-disable-next-line no-await-in-loop -- converting one image at a time is the point, see the doc comment above
            const convertedAsset = await convertToJpeg(asset.uri, formatToTranscode.name);

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
