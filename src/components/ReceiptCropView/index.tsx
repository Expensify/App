import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import {View} from 'react-native';
import {Gesture, GestureDetector, GestureHandlerRootView} from 'react-native-gesture-handler';
import type {GestureUpdateEvent, PanGestureChangeEventPayload, PanGestureHandlerEventPayload} from 'react-native-gesture-handler';
import Animated, {useAnimatedStyle, useSharedValue} from 'react-native-reanimated';
import Image from '@components/Image';
import RESIZE_MODES from '@components/Image/resizeModes';
import LoadingIndicator from '@components/LoadingIndicator';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import ControlSelection from '@libs/ControlSelection';
import variables from '@styles/variables';
import type {Dimensions} from '@src/types/utils/Layout';

type CropRect = {
    x: number;
    y: number;
    width: number;
    height: number;
};

type ReceiptCropViewProps = {
    /** URI of the image to crop */
    imageUri: string;

    /** Callback when crop rectangle changes */
    onCropChange?: (crop: CropRect) => void;

    /** Initial crop rectangle (optional) */
    initialCrop?: CropRect;

    isAuthTokenRequired?: boolean;
};

type CornerPosition = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
type EdgePosition = 'top' | 'bottom' | 'left' | 'right';

function ReceiptCropView({imageUri, onCropChange, initialCrop, isAuthTokenRequired}: ReceiptCropViewProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    // Image dimensions
    const [imageSize, setImageSize] = useState<Dimensions>({width: 0, height: 0});
    const [hasImageDimensions, setHasImageDimensions] = useState(false);

    // Container dimensions (using shared values for worklet access)
    const containerWidthSV = useSharedValue(0);
    const containerHeightSV = useSharedValue(0);
    const displayWidthSV = useSharedValue(0);
    const displayHeightSV = useSharedValue(0);
    const imageOffsetXSV = useSharedValue(0);
    const imageOffsetYSV = useSharedValue(0);
    const [containerSize, setContainerSize] = useState<Dimensions>({width: 0, height: 0});

    // Crop rectangle in display coordinates (relative to container)
    const cropX = useSharedValue(0);
    const cropY = useSharedValue(0);
    const cropWidth = useSharedValue(0);
    const cropHeight = useSharedValue(0);

    // Track previous values to detect changes and recalculate crop on resize
    const prevDisplayValuesRef = useRef<{
        displayWidth: number;
        displayHeight: number;
        scaleX: number;
        scaleY: number;
        imageOffsetX: number;
        imageOffsetY: number;
    } | null>(null);

    const isCropInitialized = imageSize.width > 0 && imageSize.height > 0 && containerSize.width > 0 && containerSize.height > 0;

    // Calculate scale factors to convert display coordinates to image coordinates
    const {scaleX, scaleY, displayWidth, displayHeight, imageOffsetX, imageOffsetY} = useMemo(() => {
        if (!containerSize.width || !containerSize.height || !imageSize.width || !imageSize.height) {
            return {scaleX: 1, scaleY: 1, displayWidth: 0, displayHeight: 0, imageOffsetX: 0, imageOffsetY: 0};
        }

        // Calculate how the image is scaled to fit the container
        const imageAspectRatio = imageSize.width / imageSize.height;
        const containerAspectRatio = containerSize.width / containerSize.height;

        let calculatedDisplayWidth: number;
        let calculatedDisplayHeight: number;

        if (imageAspectRatio > containerAspectRatio) {
            // Image is wider - fit to width
            calculatedDisplayWidth = containerSize.width;
            calculatedDisplayHeight = containerSize.width / imageAspectRatio;
        } else {
            // Image is taller - fit to height
            calculatedDisplayHeight = containerSize.height;
            calculatedDisplayWidth = containerSize.height * imageAspectRatio;
        }

        // Calculate the image's offset within the container (centered)
        const calculatedImageOffsetX = (containerSize.width - calculatedDisplayWidth) / 2;
        const calculatedImageOffsetY = (containerSize.height - calculatedDisplayHeight) / 2;

        // Calculate scale factors to convert display coordinates to image coordinates
        const calculatedScaleX = imageSize.width / calculatedDisplayWidth;
        const calculatedScaleY = imageSize.height / calculatedDisplayHeight;

        // Update shared values for worklet access
        displayWidthSV.set(calculatedDisplayWidth);
        displayHeightSV.set(calculatedDisplayHeight);
        imageOffsetXSV.set(calculatedImageOffsetX);
        imageOffsetYSV.set(calculatedImageOffsetY);

        return {
            scaleX: calculatedScaleX,
            scaleY: calculatedScaleY,
            displayWidth: calculatedDisplayWidth,
            displayHeight: calculatedDisplayHeight,
            imageOffsetX: calculatedImageOffsetX,
            imageOffsetY: calculatedImageOffsetY,
        };
    }, [containerSize.width, containerSize.height, imageSize.width, imageSize.height, displayWidthSV, displayHeightSV, imageOffsetXSV, imageOffsetYSV]);

    // Initialize crop rectangle when dimensions are available
    useEffect(() => {
        if (!displayWidth || !displayHeight || !scaleX || !scaleY) {
            return;
        }

        // Only initialize if crop values are still at 0 (not yet initialized)
        if (cropWidth.get() === 0 && cropHeight.get() === 0) {
            if (initialCrop) {
                // Convert image coordinates to display coordinates and add image offset
                cropX.set(imageOffsetX + initialCrop.x / scaleX);
                cropY.set(imageOffsetY + initialCrop.y / scaleY);
                cropWidth.set(initialCrop.width / scaleX);
                cropHeight.set(initialCrop.height / scaleY);
            } else {
                // Default: crop the entire image area (no padding)
                // Crop rectangle is relative to the image position (centered in container)
                cropX.set(imageOffsetX);
                cropY.set(imageOffsetY);
                cropWidth.set(displayWidth);
                cropHeight.set(displayHeight);
            }
            // Store initial values
            prevDisplayValuesRef.current = {
                displayWidth,
                displayHeight,
                scaleX,
                scaleY,
                imageOffsetX,
                imageOffsetY,
            };
        }
    }, [displayWidth, displayHeight, scaleX, scaleY, imageOffsetX, imageOffsetY, initialCrop, cropX, cropY, cropWidth, cropHeight]);

    // Update crop rectangle when container/image dimensions change (e.g., window resize)
    useEffect(() => {
        if (!displayWidth || !displayHeight || !scaleX || !scaleY) {
            return;
        }

        // Only update if crop is already initialized and dimensions have changed
        if (cropWidth.get() === 0 && cropHeight.get() === 0) {
            return;
        }

        const prev = prevDisplayValuesRef.current;
        if (!prev) {
            return;
        }

        // Check if dimensions actually changed
        const hasChanged =
            prev.displayWidth !== displayWidth ||
            prev.displayHeight !== displayHeight ||
            prev.scaleX !== scaleX ||
            prev.scaleY !== scaleY ||
            prev.imageOffsetX !== imageOffsetX ||
            prev.imageOffsetY !== imageOffsetY;

        if (!hasChanged) {
            return;
        }

        // Get current crop rectangle in display coordinates
        const currentCropX = cropX.get();
        const currentCropY = cropY.get();
        const currentCropWidth = cropWidth.get();
        const currentCropHeight = cropHeight.get();

        // Convert current crop from old display coordinates to image coordinates
        const imageX = (currentCropX - prev.imageOffsetX) * prev.scaleX;
        const imageY = (currentCropY - prev.imageOffsetY) * prev.scaleY;
        const imageWidth = currentCropWidth * prev.scaleX;
        const imageHeight = currentCropHeight * prev.scaleY;

        // Convert back to new display coordinates
        const newCropX = imageOffsetX + imageX / scaleX;
        const newCropY = imageOffsetY + imageY / scaleY;
        const newCropWidth = imageWidth / scaleX;
        const newCropHeight = imageHeight / scaleY;

        // Update crop rectangle
        cropX.set(newCropX);
        cropY.set(newCropY);
        cropWidth.set(newCropWidth);
        cropHeight.set(newCropHeight);

        // Update stored values
        prevDisplayValuesRef.current = {
            displayWidth,
            displayHeight,
            scaleX,
            scaleY,
            imageOffsetX,
            imageOffsetY,
        };

        // Notify parent of the updated crop (in image coordinates)
        const crop: CropRect = {
            x: imageX,
            y: imageY,
            width: imageWidth,
            height: imageHeight,
        };
        onCropChange?.(crop);
    }, [displayWidth, displayHeight, scaleX, scaleY, imageOffsetX, imageOffsetY, cropX, cropY, cropWidth, cropHeight, onCropChange]);

    const onContainerLayout = useCallback(
        (event: LayoutChangeEvent) => {
            const {width, height} = event.nativeEvent.layout;
            setContainerSize({width, height});
            containerWidthSV.set(width);
            containerHeightSV.set(height);
        },
        [containerWidthSV, containerHeightSV],
    );

    const onImageLoad = useCallback(
        (event: {nativeEvent: {width: number; height: number}}) => {
            const {width, height} = event.nativeEvent;
            if (!width || !height || (imageSize.width === width && imageSize.height === height)) {
                return;
            }
            if (!hasImageDimensions) {
                setHasImageDimensions(true);
            }
            setImageSize({width, height});
        },
        [hasImageDimensions, imageSize.width, imageSize.height],
    );

    /**
     * Clamp a value between min and max
     */
    const clamp = useCallback((value: number, min: number, max: number) => {
        'worklet';

        return Math.max(min, Math.min(max, value));
    }, []);

    const applyCropBoundsAndNotify = useCallback(
        (newX: number, newY: number, newWidth: number, newHeight: number, imageLeft: number, imageRight: number, imageTop: number, imageBottom: number) => {
            // clamp to image bounds
            let x = newX;
            let y = newY;
            let w = newWidth;
            let h = newHeight;

            if (x < imageLeft) {
                const diff = imageLeft - x;
                x = imageLeft;
                w -= diff;
            }
            if (x + w > imageRight) {
                w = imageRight - x;
            }
            if (y < imageTop) {
                const diff = imageTop - y;
                y = imageTop;
                h -= diff;
            }
            if (y + h > imageBottom) {
                h = imageBottom - y;
            }

            cropX.set(x);
            cropY.set(y);
            cropWidth.set(w);
            cropHeight.set(h);

            onCropChange?.({
                x: (x - imageOffsetX) * scaleX,
                y: (y - imageOffsetY) * scaleY,
                width: w * scaleX,
                height: h * scaleY,
            });
        },
        [cropX, cropY, cropWidth, cropHeight, imageOffsetX, scaleX, imageOffsetY, scaleY, onCropChange],
    );

    /**
     * Create gesture handler for an edge
     */
    const createEdgeGesture = useCallback(
        (edge: EdgePosition) => {
            return Gesture.Pan()
                .runOnJS(true)
                .onChange((event: GestureUpdateEvent<PanGestureHandlerEventPayload & PanGestureChangeEventPayload>) => {
                    const currentX = cropX.get();
                    const currentY = cropY.get();
                    const currentWidth = cropWidth.get();
                    const currentHeight = cropHeight.get();

                    let newX = currentX;
                    let newY = currentY;
                    let newWidth = currentWidth;
                    let newHeight = currentHeight;

                    const minSize = variables.cornerHandleSize * 2;
                    const imgDisplayWidth = displayWidthSV.get();
                    const imgDisplayHeight = displayHeightSV.get();
                    const imageLeft = imageOffsetXSV.get();
                    const imageRight = imageLeft + imgDisplayWidth;
                    const imageTop = imageOffsetYSV.get();
                    const imageBottom = imageTop + imgDisplayHeight;

                    switch (edge) {
                        case 'top':
                            newY = clamp(currentY + event.changeY, imageTop, currentY + currentHeight - minSize);
                            newHeight = currentHeight - (newY - currentY);
                            break;
                        case 'bottom':
                            newHeight = clamp(currentHeight + event.changeY, minSize, imageBottom - currentY);
                            break;
                        case 'left':
                            newX = clamp(currentX + event.changeX, imageLeft, currentX + currentWidth - minSize);
                            newWidth = currentWidth - (newX - currentX);
                            break;
                        case 'right':
                            newWidth = clamp(currentWidth + event.changeX, minSize, imageRight - currentX);
                            break;
                        default:
                            break;
                    }

                    applyCropBoundsAndNotify(newX, newY, newWidth, newHeight, imageLeft, imageRight, imageTop, imageBottom);
                });
        },
        [cropX, cropY, cropWidth, cropHeight, displayWidthSV, displayHeightSV, imageOffsetXSV, imageOffsetYSV, applyCropBoundsAndNotify, clamp],
    );

    /**
     * Create gesture handler for a corner
     */
    const createCornerGesture = useCallback(
        (corner: CornerPosition) => {
            return Gesture.Pan()
                .runOnJS(true)
                .onChange((event: GestureUpdateEvent<PanGestureHandlerEventPayload & PanGestureChangeEventPayload>) => {
                    const currentX = cropX.get();
                    const currentY = cropY.get();
                    const currentWidth = cropWidth.get();
                    const currentHeight = cropHeight.get();

                    let newX = currentX;
                    let newY = currentY;
                    let newWidth = currentWidth;
                    let newHeight = currentHeight;

                    const minSize = variables.cornerHandleSize * 2;
                    const imgDisplayWidth = displayWidthSV.get();
                    const imgDisplayHeight = displayHeightSV.get();
                    const imageLeft = imageOffsetXSV.get();
                    const imageRight = imageLeft + imgDisplayWidth;
                    const imageTop = imageOffsetYSV.get();
                    const imageBottom = imageTop + imgDisplayHeight;

                    switch (corner) {
                        case 'topLeft':
                            newX = clamp(currentX + event.changeX, imageLeft, currentX + currentWidth - minSize);
                            newY = clamp(currentY + event.changeY, imageTop, currentY + currentHeight - minSize);
                            newWidth = currentWidth - (newX - currentX);
                            newHeight = currentHeight - (newY - currentY);
                            break;
                        case 'topRight':
                            newY = clamp(currentY + event.changeY, imageTop, currentY + currentHeight - minSize);
                            newWidth = clamp(currentWidth + event.changeX, minSize, imageRight - currentX);
                            newHeight = currentHeight - (newY - currentY);
                            break;
                        case 'bottomLeft':
                            newX = clamp(currentX + event.changeX, imageLeft, currentX + currentWidth - minSize);
                            newWidth = currentWidth - (newX - currentX);
                            newHeight = clamp(currentHeight + event.changeY, minSize, imageBottom - currentY);
                            break;
                        case 'bottomRight':
                            newWidth = clamp(currentWidth + event.changeX, minSize, imageRight - currentX);
                            newHeight = clamp(currentHeight + event.changeY, minSize, imageBottom - currentY);
                            break;
                        default:
                            break;
                    }

                    applyCropBoundsAndNotify(newX, newY, newWidth, newHeight, imageLeft, imageRight, imageTop, imageBottom);
                });
        },
        [cropX, cropY, cropWidth, cropHeight, displayWidthSV, displayHeightSV, imageOffsetXSV, imageOffsetYSV, applyCropBoundsAndNotify, clamp],
    );

    const borderStyle = useAnimatedStyle(() => {
        'worklet';

        return StyleUtils.getCropViewStyle('border', {
            cropX: cropX.get(),
            cropY: cropY.get(),
            cropWidth: cropWidth.get(),
            cropHeight: cropHeight.get(),
        });
    });

    const topLeftCornerStyle = useAnimatedStyle(() => {
        'worklet';

        return StyleUtils.getCropViewStyle('cornerTopLeft', {
            cropX: cropX.get(),
            cropY: cropY.get(),
            cropWidth: cropWidth.get(),
            cropHeight: cropHeight.get(),
        });
    });

    const topRightCornerStyle = useAnimatedStyle(() => {
        'worklet';

        return StyleUtils.getCropViewStyle('cornerTopRight', {
            cropX: cropX.get(),
            cropY: cropY.get(),
            cropWidth: cropWidth.get(),
            cropHeight: cropHeight.get(),
        });
    });

    const bottomLeftCornerStyle = useAnimatedStyle(() => {
        'worklet';

        return StyleUtils.getCropViewStyle('cornerBottomLeft', {
            cropX: cropX.get(),
            cropY: cropY.get(),
            cropWidth: cropWidth.get(),
            cropHeight: cropHeight.get(),
        });
    });

    const bottomRightCornerStyle = useAnimatedStyle(() => {
        'worklet';

        return StyleUtils.getCropViewStyle('cornerBottomRight', {
            cropX: cropX.get(),
            cropY: cropY.get(),
            cropWidth: cropWidth.get(),
            cropHeight: cropHeight.get(),
        });
    });

    // Edge handle styles - thicker tap target while keeping visual size
    const topEdgeStyle = useAnimatedStyle(() => {
        'worklet';

        return StyleUtils.getCropViewStyle('edgeTop', {
            cropX: cropX.get(),
            cropY: cropY.get(),
            cropWidth: cropWidth.get(),
            cropHeight: cropHeight.get(),
        });
    });

    const bottomEdgeStyle = useAnimatedStyle(() => {
        'worklet';

        return StyleUtils.getCropViewStyle('edgeBottom', {
            cropX: cropX.get(),
            cropY: cropY.get(),
            cropWidth: cropWidth.get(),
            cropHeight: cropHeight.get(),
        });
    });

    const leftEdgeStyle = useAnimatedStyle(() => {
        'worklet';

        return StyleUtils.getCropViewStyle('edgeLeft', {
            cropX: cropX.get(),
            cropY: cropY.get(),
            cropWidth: cropWidth.get(),
            cropHeight: cropHeight.get(),
        });
    });

    const rightEdgeStyle = useAnimatedStyle(() => {
        'worklet';

        return StyleUtils.getCropViewStyle('edgeRight', {
            cropX: cropX.get(),
            cropY: cropY.get(),
            cropWidth: cropWidth.get(),
            cropHeight: cropHeight.get(),
        });
    });

    const overlayTopStyle = useAnimatedStyle(() => {
        'worklet';

        const imageLeft = imageOffsetXSV.get();
        const imageTop = imageOffsetYSV.get();
        const imgDisplayWidth = displayWidthSV.get();
        const cropTop = cropY.get();

        return StyleUtils.getCropViewStyle('overlayTop', {
            imageLeft,
            imageTop,
            imgDisplayWidth,
            cropTop,
        });
    });

    const overlayBottomStyle = useAnimatedStyle(() => {
        'worklet';

        const imageLeft = imageOffsetXSV.get();
        const imageTop = imageOffsetYSV.get();
        const imgDisplayWidth = displayWidthSV.get();
        const imgDisplayHeight = displayHeightSV.get();
        const cropBottom = cropY.get() + cropHeight.get();
        const imageBottom = imageTop + imgDisplayHeight;

        return StyleUtils.getCropViewStyle('overlayBottom', {
            imageLeft,
            imageTop,
            imgDisplayWidth,
            cropBottom,
            imageBottom,
        });
    });

    const overlayLeftStyle = useAnimatedStyle(() => {
        'worklet';

        const imageLeft = imageOffsetXSV.get();
        const cropLeft = cropX.get();
        const cropTop = cropY.get();
        const cropHeightValue = cropHeight.get();

        return StyleUtils.getCropViewStyle('overlayLeft', {
            imageLeft,
            cropLeft,
            cropTop,
            cropHeight: cropHeightValue,
        });
    });

    const overlayRightStyle = useAnimatedStyle(() => {
        'worklet';

        const imageLeft = imageOffsetXSV.get();
        const imgDisplayWidth = displayWidthSV.get();
        const cropRight = cropX.get() + cropWidth.get();
        const imageRight = imageLeft + imgDisplayWidth;
        const cropTop = cropY.get();
        const cropHeightValue = cropHeight.get();

        return StyleUtils.getCropViewStyle('overlayRight', {
            imageLeft,
            imgDisplayWidth,
            cropRight,
            imageRight,
            cropTop,
            cropHeight: cropHeightValue,
        });
    });

    const cornerVisualStyle = StyleUtils.getCropViewStyle('cornerVisual');

    return (
        <GestureHandlerRootView style={[styles.flex1, styles.w100]}>
            <Animated.View
                style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter, styles.w100]}
                onLayout={onContainerLayout}
                ref={(el: View | null) => ControlSelection.blockElement(el as HTMLElement | null)}
            >
                <View style={[styles.flex1, styles.w100]}>
                    <Image
                        source={{uri: imageUri}}
                        resizeMode={RESIZE_MODES.contain}
                        style={[styles.h100, styles.w100]}
                        onLoad={onImageLoad}
                        isAuthTokenRequired={isAuthTokenRequired}
                    />
                </View>

                {isCropInitialized && (
                    <>
                        <Animated.View
                            style={overlayTopStyle}
                            pointerEvents="none"
                        />
                        <Animated.View
                            style={overlayBottomStyle}
                            pointerEvents="none"
                        />
                        <Animated.View
                            style={overlayLeftStyle}
                            pointerEvents="none"
                        />
                        <Animated.View
                            style={overlayRightStyle}
                            pointerEvents="none"
                        />

                        <Animated.View
                            style={borderStyle}
                            pointerEvents="none"
                        />

                        {/* Edge handles */}
                        <GestureDetector gesture={createEdgeGesture('top')}>
                            <Animated.View style={topEdgeStyle} />
                        </GestureDetector>
                        <GestureDetector gesture={createEdgeGesture('bottom')}>
                            <Animated.View style={bottomEdgeStyle} />
                        </GestureDetector>
                        <GestureDetector gesture={createEdgeGesture('left')}>
                            <Animated.View style={leftEdgeStyle} />
                        </GestureDetector>
                        <GestureDetector gesture={createEdgeGesture('right')}>
                            <Animated.View style={rightEdgeStyle} />
                        </GestureDetector>

                        {/* Corner handles */}
                        <GestureDetector gesture={createCornerGesture('topLeft')}>
                            <Animated.View style={topLeftCornerStyle}>
                                <Animated.View style={cornerVisualStyle} />
                            </Animated.View>
                        </GestureDetector>
                        <GestureDetector gesture={createCornerGesture('topRight')}>
                            <Animated.View style={topRightCornerStyle}>
                                <Animated.View style={cornerVisualStyle} />
                            </Animated.View>
                        </GestureDetector>
                        <GestureDetector gesture={createCornerGesture('bottomLeft')}>
                            <Animated.View style={bottomLeftCornerStyle}>
                                <Animated.View style={cornerVisualStyle} />
                            </Animated.View>
                        </GestureDetector>
                        <GestureDetector gesture={createCornerGesture('bottomRight')}>
                            <Animated.View style={bottomRightCornerStyle}>
                                <Animated.View style={cornerVisualStyle} />
                            </Animated.View>
                        </GestureDetector>
                    </>
                )}
                {!hasImageDimensions && <LoadingIndicator style={[styles.opacity1, styles.bgTransparent]} />}
            </Animated.View>
        </GestureHandlerRootView>
    );
}

ReceiptCropView.displayName = 'ReceiptCropView';

export default ReceiptCropView;
export type {CropRect};
