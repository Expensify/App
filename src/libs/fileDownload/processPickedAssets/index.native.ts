import {getDownscaledSize} from '@libs/cameraCapture/downscalePhoto';
import {getConvertedJpegFileName, getFileName, isLabelledDng, isLabelledTiff, JPEG_QUALITY, matchesFileSignature, readFileHeaderHex} from '@libs/fileDownload/FileUtils';
import Log from '@libs/Log';

import CONST from '@src/CONST';

import type {ImageRef, ImageResult} from 'expo-image-manipulator';
import type {Asset} from 'react-native-image-picker';
import type {TupleToUnion} from 'type-fest';

import {ImageManipulator, SaveFormat} from 'expo-image-manipulator';
import {Platform} from 'react-native';

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
    // A DNG (iPhone ProRAW) is a TIFF container, so the signature can't tell the two apart. That is fine here: this entry
    // only matches files the picker relabelled `.jpg`, which are broken either way. Correctly labelled TIFFs never reach
    // the signature check (see `detectFormatToTranscode`).
    {name: 'TIFF/DNG', formatSignatures: CONST.TIFF_SIGNATURES, signatureOffset: CONST.TIFF_SIGNATURE_OFFSET},
] as const;

type TranscodedFormat = TupleToUnion<typeof TRANSCODED_FORMATS>;

const TIFF_CONTAINER_FORMAT = TRANSCODED_FORMATS[1];

/**
 * Returns the entry of `TRANSCODED_FORMATS` the asset should be transcoded from, or `undefined` for anything
 * else (e.g. a real JPEG, PNG or TIFF), which is passed through untouched.
 *
 * Labels (what Android's picker and the document picker provide) are trusted without reading the file:
 * - a DNG label is transcoded, so those picks don't depend on the header read succeeding;
 * - a plain TIFF label is passed through, since TIFF is an accepted receipt format and transcoding would keep
 *   only the first page of a multi-page scan.
 * Everything else, including the `.jpg` that iOS relabels a ProRAW to, is sniffed from its magic bytes, which
 * are read once and matched against every format.
 *
 * A failed header read (a native filesystem error such as ENOENT/EACCES) says nothing about the format, so the asset
 * is passed through as picked rather than dropped: a good JPEG that hits a transient read error still uploads, as it
 * did before read errors were surfaced. A relabelled HEIC or DNG that slips through this way fails later with the
 * image corruption alert, which is what happened to it before this detection existed.
 */
async function detectFormatToTranscode(asset: Asset & {uri: string}): Promise<TranscodedFormat | undefined> {
    const label = {name: asset.fileName ?? getFileName(asset.uri), type: asset.type};
    if (isLabelledDng(label)) {
        return TIFF_CONTAINER_FORMAT;
    }
    if (isLabelledTiff(label)) {
        return undefined;
    }

    let headerHex: string;
    try {
        headerHex = await readFileHeaderHex(asset.uri);
    } catch (error) {
        Log.warn('Failed to read picked asset header, passing the asset through unconverted', {error: getErrorMessage(error, 'An unknown error occurred')});
        return undefined;
    }
    return TRANSCODED_FORMATS.find((format) => matchesFileSignature(headerHex, format.formatSignatures, format.signatureOffset));
}

/**
 * The size to shrink a picked photo to so its long edge is no longer than the 2880 × 2160 the receipt camera asks for
 * (see `useReceiptPhotoOutput`), or `undefined` when it already fits. A size the picker left out counts as fitting, since
 * nothing is decoded just to find out.
 *
 * The camera treats that size only as a request: iPhones return the nearest size they support, mostly 2592 or 3264 px on
 * the long edge, so a capped gallery photo stays within the range of receipts scanned in the app.
 */
function getCappedSize(width: number | undefined, height: number | undefined) {
    if (!width || !height) {
        return undefined;
    }
    return getDownscaledSize({width, height});
}

/**
 * Shrinks a decoded image to the receipt camera's size (see `getCappedSize`) and saves it as a JPEG, or returns `undefined`
 * when it already fits.
 *
 * Gallery photos used to keep their full resolution (12–48 MP on current iPhones), and every screen that later showed
 * them, or made a thumbnail of them, had to decode that full-size bitmap again. Capping them here, while the image is
 * decoded anyway and one at a time, makes every later decode a fraction of the size.
 *
 * Sized from the decoded bitmap, which already has the file's orientation applied, as `downscalePhoto` does. Saved at
 * `JPEG_QUALITY`, as `downscalePhoto` and the receipt thumbnails are: at quality 1 the smaller copy comes out two to three
 * times larger than the full-size original, close to the receipt upload limit.
 */
async function saveCappedJpeg(decoded: ImageRef): Promise<ImageResult | undefined> {
    const size = getCappedSize(decoded.width, decoded.height);
    if (!size) {
        return undefined;
    }

    const resizeContext = ImageManipulator.manipulate(decoded).resize(size);
    try {
        const resized = await resizeContext.renderAsync();
        try {
            return await resized.saveAsync({compress: JPEG_QUALITY, format: SaveFormat.JPEG});
        } finally {
            releaseQuietly(resized);
        }
    } finally {
        releaseQuietly(resizeContext);
    }
}

function isJpegAsset({type, fileName, uri}: Asset): boolean {
    if (type) {
        return type === 'image/jpeg' || type === 'image/jpg';
    }
    const extension = getFileName(fileName ?? uri ?? '')
        .split('.')
        .pop()
        ?.toLowerCase();
    return extension === 'jpg' || extension === 'jpeg';
}

/**
 * Shrinks a picked JPEG that is larger than the receipt camera's size, or returns `undefined` to keep the asset as picked:
 * when it already fits, when it isn't a JPEG (re-encoding a PNG, GIF or WebP would lose transparency or animation), or
 * when shrinking fails, since this is only an optimization.
 *
 * iOS only. There, every later display of a local receipt decodes the full-size photo anyway, so decoding it once here
 * just moves that cost earlier and makes the rest cheaper. Android's image loader samples large photos down while it
 * decodes them, so a full-size decode here would add a peak that Android never had.
 */
async function downscaleOversizedJpeg(asset: Asset & {uri: string}): Promise<Asset | undefined> {
    if (Platform.OS !== 'ios' || !isJpegAsset(asset) || !getCappedSize(asset.width, asset.height)) {
        return undefined;
    }

    const decodeContext = ImageManipulator.manipulate(asset.uri);
    try {
        const decoded = await decodeContext.renderAsync();
        try {
            const result = await saveCappedJpeg(decoded);
            if (!result) {
                return undefined;
            }
            Log.info('[processPickedAssets] shrank an oversized gallery photo', false, {source: `${decoded.width}x${decoded.height}`, result: `${result.width}x${result.height}`});
            return {
                uri: result.uri,
                fileName: asset.fileName ?? getFileName(asset.uri),
                type: 'image/jpeg',
                width: result.width,
                height: result.height,
            };
        } finally {
            releaseQuietly(decoded);
        }
    } catch (error) {
        Log.warn('Failed to shrink an oversized gallery photo, keeping it as picked', {error: getErrorMessage(error, 'An unknown error occurred')});
        return undefined;
    } finally {
        releaseQuietly(decodeContext);
    }
}

/**
 * Transcodes a single HEIC or DNG image to JPEG, returning `undefined` if the conversion fails.
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
 * handles DNG on current OS versions. Where it doesn't, the render fails and the asset is skipped.
 *
 * The image is already decoded in full here on both platforms, so it is also capped to the receipt camera's size before
 * it is saved, which costs only the smaller bitmap on top. The cap is only an optimization, so when it fails the full-size
 * JPEG is saved instead, as it was before the cap existed.
 */
async function convertToJpeg(uri: string, formatName: TranscodedFormat['name'], originalFileName: string | undefined): Promise<Asset | undefined> {
    const imageManipulatorContext = ImageManipulator.manipulate(uri);
    try {
        const manipulatedImage = await imageManipulatorContext.renderAsync();
        try {
            const cappedResult = await saveCappedJpeg(manipulatedImage).catch((error: unknown) => {
                Log.warn(`Failed to shrink a converted ${formatName} image, saving it at full size`, {error: getErrorMessage(error, 'An unknown error occurred')});
                return undefined;
            });
            const manipulationResult = cappedResult ?? (await manipulatedImage.saveAsync({format: SaveFormat.JPEG}));
            return {
                uri: manipulationResult.uri,
                fileName: getConvertedJpegFileName(originalFileName, getFileName(manipulationResult.uri)),
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
 * Convert the picked assets one at a time, transcoding any HEIC or DNG images (and TIFF-headed files the picker relabelled `.jpg`) to JPEG.
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
        const isImage = !!asset.type?.startsWith('image') || isLabelledDng({name: asset.fileName ?? getFileName(asset.uri), type: asset.type});
        if (!isImage) {
            // Ensure the asset has proper fileName and type
            processedAssets.push(processAssetWithFallbacks(asset));
            continue;
        }

        // eslint-disable-next-line no-await-in-loop -- converting one image at a time is the point, see the doc comment above
        const formatToTranscode = await detectFormatToTranscode({...asset, uri: asset.uri});

        if (!formatToTranscode) {
            // eslint-disable-next-line no-await-in-loop -- shrinking one image at a time is the point, see the doc comment above
            const downscaledAsset = await downscaleOversizedJpeg({...asset, uri: asset.uri});
            // Ensure the asset has proper fileName and type for images that need no transcoding
            processedAssets.push(downscaledAsset ?? processAssetWithFallbacks(asset));
            continue;
        }

        // react-native-image-picker sniffs only the first byte and labels anything it doesn't recognize as JPEG without
        // transcoding it. HEIC and TIFF/DNG both end up as a broken `<uuid>.jpg`, so we transcode them for real here.
        // eslint-disable-next-line no-await-in-loop -- converting one image at a time is the point, see the doc comment above
        const convertedAsset = await convertToJpeg(asset.uri, formatToTranscode.name, asset.fileName);

        if (convertedAsset) {
            processedAssets.push(convertedAsset);
        } else {
            failureMessages.add(translate('attachmentPicker.errorWhileConvertingImage'));
        }
    }

    if (failureMessages.size > 0) {
        showGeneralAlert([...failureMessages].join('\n'));
    }

    return processedAssets.length > 0 ? processedAssets : undefined;
};

export default processPickedAssetsSequentially;
