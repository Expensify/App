import React, {useCallback, useMemo, useState} from 'react';
import {Platform, Image as RNImage} from 'react-native';
import {shouldUseTransactionDraft} from '@libs/IOUUtils';
import Log from '@libs/Log';
import mergeImages from '@libs/mergeImages';
import type {FileObject} from '@src/types/utils/Attachment';

type MergeConfig = {
    startImageUri: string;
    endImageUri: string;
    isHorizontal: boolean;
    scaledWidth1: number;
    scaledWidth2: number;
    scaledHeight: number;
    totalWidth: number;
    totalHeight: number;
    transactionID: string;
    action?: string;
    iouType?: string;
} | null;

type UseOdometerImageMergingResult = {
    mergeOdometerImages: (startImage: File | string, endImage: File | string, transactionID: string, action?: string, iouType?: string) => Promise<void>;
    isMerging: boolean;
    mergeError: Error | null;
    mergeViewShotComponent: React.ReactElement | null;
};

/**
 * Hook for managing odometer image merging process.
 * Provides a function to merge start and end odometer images into a single receipt image.
 *
 * @returns Object containing mergeOdometerImages function, isMerging state, and mergeError state
 */
function useOdometerImageMerging(): UseOdometerImageMergingResult {
    const [isMerging, setIsMerging] = useState(false);
    const [mergeError, setMergeError] = useState<Error | null>(null);
    const [mergeConfig, setMergeConfig] = useState<MergeConfig>(null);

    /**
     * Converts an image source (File, string URI, or object with uri property) to a File object
     */
    const convertToFile = async (image: File | string | {uri?: string}): Promise<File> => {
        // If it's already a File, return it
        if (image instanceof File) {
            return image;
        }

        // Get the URI from the image
        let uri: string;
        if (typeof image === 'string') {
            uri = image;
        } else if (image && typeof image === 'object' && 'uri' in image && image.uri) {
            uri = image.uri;
        } else {
            throw new Error('Invalid image source');
        }

        // Fetch the image and convert to File
        const response = await fetch(uri);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        const blob = await response.blob();
        const fileName = uri.split('/').pop() ?? 'odometer-image.png';
        const file = new File([blob], fileName, {type: blob.type ?? 'image/png'});
        return file;
    };

    const mergeOdometerImages = useCallback(
        async (startImage: File | string | {uri?: string}, endImage: File | string | {uri?: string}, transactionID: string, action?: string, iouType?: string) => {
            if (!startImage || !endImage) {
                const error = new Error('Both start and end images are required');
                setMergeError(error);
                return;
            }

            setIsMerging(true);
            setMergeError(null);

            try {
                let mergedImage: File | FileObject;

                if (Platform.OS === 'web') {
                    // On web, convert to File objects and merge
                    const startFile = await convertToFile(startImage);
                    const endFile = await convertToFile(endImage);

                    mergedImage = await mergeImages(startFile, endFile);
                } else {
                    // On native, use ViewShot approach
                    let startUri: string;
                    let endUri: string;

                    if (typeof startImage === 'string') {
                        startUri = startImage;
                    } else if (startImage && typeof startImage === 'object' && 'uri' in startImage && startImage.uri) {
                        startUri = startImage.uri;
                    } else {
                        throw new Error('Invalid start image source for native');
                    }

                    if (typeof endImage === 'string') {
                        endUri = endImage;
                    } else if (endImage && typeof endImage === 'object' && 'uri' in endImage && endImage.uri) {
                        endUri = endImage.uri;
                    } else {
                        throw new Error('Invalid end image source for native');
                    }

                    // Get image dimensions and prepare merge config
                    const getImageSize = (uri: string): Promise<{width: number; height: number}> => {
                        return new Promise((resolveSize, rejectSize) => {
                            RNImage.getSize(
                                uri,
                                (width, height) => {
                                    resolveSize({width, height});
                                },
                                (error) => {
                                    rejectSize(error);
                                },
                            );
                        });
                    };

                    const [size1, size2] = await Promise.all([getImageSize(startUri), getImageSize(endUri)]);
                    const {width: width1, height: height1} = size1;
                    const {width: width2, height: height2} = size2;

                    // Determine merge direction
                    const isHorizontal = width1 <= height1 && width2 <= height2;

                    let scaledWidth1: number;
                    let scaledWidth2: number;
                    let scaledHeight: number;
                    let totalWidth: number;
                    let totalHeight: number;

                    if (isHorizontal) {
                        // Scale all images to the maximum height, maintaining aspect ratio
                        const maxHeight = Math.max(height1, height2);
                        const scale1 = maxHeight / height1;
                        const scale2 = maxHeight / height2;
                        scaledWidth1 = Math.round(width1 * scale1);
                        scaledWidth2 = Math.round(width2 * scale2);
                        scaledHeight = maxHeight;
                        totalWidth = scaledWidth1 + scaledWidth2;
                        totalHeight = scaledHeight;
                    } else {
                        // Scale all images to the maximum width, maintaining aspect ratio
                        const maxWidth = Math.max(width1, width2);
                        const scale1 = maxWidth / width1;
                        const scale2 = maxWidth / width2;
                        const scaledHeight1 = Math.round(height1 * scale1);
                        const scaledHeight2 = Math.round(height2 * scale2);
                        scaledWidth1 = maxWidth;
                        scaledWidth2 = maxWidth;
                        scaledHeight = scaledHeight1;
                        totalWidth = maxWidth;
                        totalHeight = scaledHeight1 + scaledHeight2;
                    }

                    // Resize both images first
                    const {ImageManipulator, SaveFormat} = await import('expo-image-manipulator');
                    const scaledHeight2 = isHorizontal ? scaledHeight : totalHeight - scaledHeight;
                    const [resized1, resized2] = await Promise.all([
                        ImageManipulator.manipulate(startUri)
                            .resize({width: scaledWidth1, height: scaledHeight})
                            .renderAsync()
                            .then((manipulatedImage) => manipulatedImage.saveAsync({format: SaveFormat.PNG})),
                        ImageManipulator.manipulate(endUri)
                            .resize({width: scaledWidth2, height: scaledHeight2})
                            .renderAsync()
                            .then((manipulatedImage) => manipulatedImage.saveAsync({format: SaveFormat.PNG})),
                    ]);

                    // Set merge config to trigger ViewShot rendering
                    setMergeConfig({
                        startImageUri: resized1.uri,
                        endImageUri: resized2.uri,
                        isHorizontal,
                        scaledWidth1,
                        scaledWidth2,
                        scaledHeight,
                        totalWidth,
                        totalHeight,
                        transactionID,
                        action,
                        iouType,
                    });

                    // Wait for ViewShot to capture (handled in mergeViewShotComponent)
                    return;
                }

                // Determine if this is a draft transaction
                const isDraft = shouldUseTransactionDraft(action, iouType);

                // Get the source URI and filename
                // Web: mergedImage is a File object with uri property
                // Native: mergedImage is a FileObject with uri property
                let source = '';
                let filename = 'odometer-merged.png';
                let type = 'image/png';

                if (typeof mergedImage === 'string') {
                    source = mergedImage;
                } else if ('uri' in mergedImage && mergedImage.uri) {
                    // Native: FileObject
                    source = mergedImage.uri;
                    filename = mergedImage.name ?? filename;
                    type = mergedImage.type ?? type;
                } else if (mergedImage instanceof File) {
                    // Web: File object - check if uri property exists, otherwise create blob URL
                    const fileWithUri = mergedImage as File & {uri?: string};
                    if (fileWithUri.uri) {
                        source = fileWithUri.uri;
                    } else {
                        // Create blob URL from the File object
                        source = URL.createObjectURL(mergedImage);
                    }
                    filename = mergedImage.name ?? filename;
                    type = mergedImage.type ?? type;
                }

                if (!source) {
                    throw new Error('Failed to get merged image source');
                }

                // Store merged image in transaction.receipt
                // Use require() to avoid circular dependency
                const {setMoneyRequestReceipt} = require('@libs/actions/IOU') as {
                    setMoneyRequestReceipt: (transactionID: string, source: string, filename: string, isDraft: boolean, type: string) => void;
                };
                setMoneyRequestReceipt(transactionID, source, filename, isDraft, type);

                // Clear original odometer images from transaction.comment after successful merge
                const {detachOdometerStartImage, detachOdometerEndImage} = require('@libs/actions/IOU') as {
                    detachOdometerStartImage: (transactionID: string, isDraft: boolean) => void;
                    detachOdometerEndImage: (transactionID: string, isDraft: boolean) => void;
                };
                detachOdometerStartImage(transactionID, isDraft);
                detachOdometerEndImage(transactionID, isDraft);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to merge odometer images';
                Log.warn('[useOdometerImageMerging] Error merging images:', errorMessage);
                setMergeError(error instanceof Error ? error : new Error(errorMessage));
            } finally {
                setIsMerging(false);
            }
        },
        [],
    );

    // Handle merge completion from ViewShot
    const handleMergeCapture = useCallback(
        (fileObject: FileObject) => {
            if (!mergeConfig) {
                return;
            }

            const {transactionID, action, iouType} = mergeConfig;
            const isDraft = shouldUseTransactionDraft(action, iouType);

            // Use require() to avoid circular dependency
            const {setMoneyRequestReceipt, detachOdometerStartImage, detachOdometerEndImage} = require('@libs/actions/IOU') as {
                setMoneyRequestReceipt: (transactionID: string, source: string, filename: string, isDraft: boolean, type: string) => void;
                detachOdometerStartImage: (transactionID: string, isDraft: boolean) => void;
                detachOdometerEndImage: (transactionID: string, isDraft: boolean) => void;
            };

            // Store merged image in transaction.receipt
            setMoneyRequestReceipt(transactionID, fileObject.uri, fileObject.name, isDraft, fileObject.type);

            // Clear original odometer images
            detachOdometerStartImage(transactionID, isDraft);
            detachOdometerEndImage(transactionID, isDraft);

            // Reset state
            setMergeConfig(null);
            setIsMerging(false);
        },
        [mergeConfig],
    );

    const handleMergeError = useCallback((error: Error) => {
        Log.warn('[useOdometerImageMerging] Error merging images:', error.message);
        setMergeError(error);
        setMergeConfig(null);
        setIsMerging(false);
    }, []);

    // Create ViewShot component when mergeConfig is set
    const mergeViewShotComponent = useMemo(() => {
        if (!mergeConfig || Platform.OS === 'web') {
            return null;
        }

        // Lazy import ImageMergeViewShot to avoid importing react-native-view-shot on web
        const ImageMergeViewShot = (
            require('@libs/mergeImages/ImageMergeViewShot') as {
                default: React.ComponentType<{
                    startImageUri: string;
                    endImageUri: string;
                    isHorizontal: boolean;
                    scaledWidth1: number;
                    scaledWidth2: number;
                    scaledHeight: number;
                    totalWidth: number;
                    totalHeight: number;
                    onCapture: (fileObject: FileObject) => void;
                    onError: (error: Error) => void;
                }>;
            }
        ).default;

        return React.createElement(ImageMergeViewShot, {
            startImageUri: mergeConfig.startImageUri,
            endImageUri: mergeConfig.endImageUri,
            isHorizontal: mergeConfig.isHorizontal,
            scaledWidth1: mergeConfig.scaledWidth1,
            scaledWidth2: mergeConfig.scaledWidth2,
            scaledHeight: mergeConfig.scaledHeight,
            totalWidth: mergeConfig.totalWidth,
            totalHeight: mergeConfig.totalHeight,
            onCapture: handleMergeCapture,
            onError: handleMergeError,
        });
    }, [mergeConfig, handleMergeCapture, handleMergeError]);

    return {
        mergeOdometerImages,
        isMerging,
        mergeError,
        mergeViewShotComponent,
    };
}

export default useOdometerImageMerging;
