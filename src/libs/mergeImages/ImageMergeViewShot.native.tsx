import React, {useEffect, useRef} from 'react';
import {Image, StyleSheet} from 'react-native';
import ViewShot from 'react-native-view-shot';
import type {FileObject} from '@src/types/utils/Attachment';

type ImageMergeViewShotProps = {
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
};

/**
 * Helper component that renders two images side by side (horizontal) or stacked (vertical)
 * and uses ViewShot to capture the merged result.
 * This is the native implementation that uses react-native-view-shot.
 */
function ImageMergeViewShot({startImageUri, endImageUri, isHorizontal, scaledWidth1, scaledWidth2, scaledHeight, totalWidth, totalHeight, onCapture, onError}: ImageMergeViewShotProps) {
    const styles = StyleSheet.create({
        container: {
            position: 'absolute',
            left: -9999,
            top: -9999,
            opacity: 0,
        },
        image: {
            backgroundColor: 'transparent',
        },
    });

    const viewShotRef = useRef<ViewShot>(null);
    const [imagesLoaded, setImagesLoaded] = React.useState({start: false, end: false});

    const handleImageLoad = React.useCallback((imageType: 'start' | 'end') => {
        setImagesLoaded((prev) => ({...prev, [imageType]: true}));
    }, []);

    const captureMergedImage = React.useCallback(() => {
        if (!imagesLoaded.start || !imagesLoaded.end) {
            return;
        }

        // Small delay to ensure rendering is complete
        const timer = setTimeout(() => {
            viewShotRef.current
                ?.capture?.()
                .then((uri) => {
                    // Get file size
                    import('react-native-blob-util').then((RNFetchBlob) => {
                        RNFetchBlob.default.fs
                            .stat(uri.replace('file://', ''))
                            .then(({size}) => {
                                onCapture({
                                    uri,
                                    name: 'odometer-merged.png',
                                    type: 'image/png',
                                    size,
                                    width: totalWidth,
                                    height: totalHeight,
                                });
                            })
                            .catch((error: unknown) => {
                                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                                onError(new Error(`Failed to get file size: ${errorMessage}`));
                            });
                    });
                })
                .catch((error: unknown) => {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    onError(new Error(`Failed to capture merged image: ${errorMessage}`));
                });
        }, 200);

        return () => clearTimeout(timer);
    }, [imagesLoaded.start, imagesLoaded.end, onCapture, onError, totalWidth, totalHeight]);

    useEffect(() => {
        if (!imagesLoaded.start || !imagesLoaded.end) {
            return;
        }
        return captureMergedImage();
    }, [imagesLoaded.start, imagesLoaded.end, captureMergedImage]);

    return (
        <ViewShot
            ref={viewShotRef}
            options={{
                fileName: 'odometer-merged',
                format: 'png',
                quality: 1.0,
                width: totalWidth,
                height: totalHeight,
            }}
            style={[
                styles.container,
                {
                    width: totalWidth,
                    height: totalHeight,
                    flexDirection: isHorizontal ? 'row' : 'column',
                },
            ]}
        >
            <Image
                source={{uri: startImageUri}}
                style={[
                    styles.image,
                    {
                        width: isHorizontal ? scaledWidth1 : totalWidth,
                        height: scaledHeight,
                    },
                ]}
                resizeMode="contain"
                onLoad={() => handleImageLoad('start')}
                onError={() => onError(new Error('Failed to load start image'))}
            />
            <Image
                source={{uri: endImageUri}}
                style={[
                    styles.image,
                    {
                        width: isHorizontal ? scaledWidth2 : totalWidth,
                        height: isHorizontal ? scaledHeight : totalHeight - scaledHeight,
                    },
                ]}
                resizeMode="contain"
                onLoad={() => handleImageLoad('end')}
                onError={() => onError(new Error('Failed to load end image'))}
            />
        </ViewShot>
    );
}

export default ImageMergeViewShot;
