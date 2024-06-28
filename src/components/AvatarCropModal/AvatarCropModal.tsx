import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import type {LayoutChangeEvent} from 'react-native';
import {Gesture, GestureHandlerRootView} from 'react-native-gesture-handler';
import type {GestureUpdateEvent, PanGestureChangeEventPayload, PanGestureHandlerEventPayload} from 'react-native-gesture-handler';
import ImageSize from 'react-native-image-size';
import {interpolate, runOnUI, useSharedValue, useWorkletCallback} from 'react-native-reanimated';
import Button from '@components/Button';
import HeaderGap from '@components/HeaderGap';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import Modal from '@components/Modal';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import cropOrRotateImage from '@libs/cropOrRotateImage';
import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import ImageCropView from './ImageCropView';
import Slider from './Slider';

type AvatarCropModalProps = {
    /** Link to image for cropping */
    imageUri?: string;

    /** Name of the image */
    imageName?: string;

    /** Type of the image file */
    imageType?: string;

    /** Callback to be called when user closes the modal */
    onClose?: () => void;

    /** Callback to be called when user saves the image */
    onSave?: (newImage: File | CustomRNImageManipulatorResult) => void;

    /** Modal visibility */
    isVisible: boolean;

    /** Image crop vector mask */
    maskImage?: IconAsset;
};

// This component can't be written using class since reanimated API uses hooks.
function AvatarCropModal({imageUri = '', imageName = '', imageType = '', onClose, onSave, isVisible, maskImage}: AvatarCropModalProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const originalImageWidth = useSharedValue<number>(CONST.AVATAR_CROP_MODAL.INITIAL_SIZE);
    const originalImageHeight = useSharedValue<number>(CONST.AVATAR_CROP_MODAL.INITIAL_SIZE);
    const translateY = useSharedValue(0);
    const translateX = useSharedValue(0);
    const scale = useSharedValue<number>(CONST.AVATAR_CROP_MODAL.MIN_SCALE);
    const rotation = useSharedValue(0);
    const translateSlider = useSharedValue(0);
    const isPressableEnabled = useSharedValue(true);

    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    // Check if image cropping, saving or uploading is in progress
    const isLoading = useSharedValue(false);

    // The previous offset values are maintained to recalculate the offset value in proportion
    // to the container size, especially when the window size is first decreased and then increased
    const prevMaxOffsetX = useSharedValue(0);
    const prevMaxOffsetY = useSharedValue(0);

    const [imageContainerSize, setImageContainerSize] = useState<number>(CONST.AVATAR_CROP_MODAL.INITIAL_SIZE);
    const [sliderContainerSize, setSliderContainerSize] = useState<number>(CONST.AVATAR_CROP_MODAL.INITIAL_SIZE);
    const [isImageContainerInitialized, setIsImageContainerInitialized] = useState(false);
    const [isImageInitialized, setIsImageInitialized] = useState(false);

    // An onLayout callback, that initializes the image container, for proper render of an image
    const initializeImageContainer = useCallback((event: LayoutChangeEvent) => {
        setIsImageContainerInitialized(true);
        const {height, width} = event.nativeEvent.layout;

        // Even if the browser height is reduced too much, the relative height should not be negative
        const relativeHeight = Math.max(height, CONST.AVATAR_CROP_MODAL.INITIAL_SIZE);
        setImageContainerSize(Math.floor(Math.min(relativeHeight, width)));
    }, []);

    // An onLayout callback, that initializes the slider container size, for proper render of a slider
    const initializeSliderContainer = useCallback((event: LayoutChangeEvent) => {
        setSliderContainerSize(event.nativeEvent.layout.width);
    }, []);

    // Changes the modal state values to initial
    const resetState = useCallback(() => {
        originalImageWidth.value = CONST.AVATAR_CROP_MODAL.INITIAL_SIZE;
        originalImageHeight.value = CONST.AVATAR_CROP_MODAL.INITIAL_SIZE;
        translateY.value = 0;
        translateX.value = 0;
        scale.value = CONST.AVATAR_CROP_MODAL.MIN_SCALE;
        rotation.value = 0;
        translateSlider.value = 0;
        prevMaxOffsetX.value = 0;
        prevMaxOffsetY.value = 0;
        isLoading.value = false;
        setImageContainerSize(CONST.AVATAR_CROP_MODAL.INITIAL_SIZE);
        setSliderContainerSize(CONST.AVATAR_CROP_MODAL.INITIAL_SIZE);
        setIsImageContainerInitialized(false);
        setIsImageInitialized(false);
    }, [originalImageHeight, originalImageWidth, prevMaxOffsetX, prevMaxOffsetY, rotation, scale, translateSlider, translateX, translateY, isLoading]);

    // In order to calculate proper image position/size/animation, we have to know its size.
    // And we have to update image size if image url changes.
    useEffect(() => {
        if (!imageUri) {
            return;
        }
        // We need to have image sizes in shared values to properly calculate position/size/animation
        ImageSize.getSize(imageUri).then(({width, height, rotation: orginalRotation}) => {
            // On Android devices ImageSize library returns also rotation parameter.
            if (orginalRotation === 90 || orginalRotation === 270) {
                // eslint-disable-next-line react-compiler/react-compiler
                originalImageHeight.value = width;
                originalImageWidth.value = height;
            } else {
                originalImageHeight.value = height;
                originalImageWidth.value = width;
            }

            setIsImageInitialized(true);

            // Because the reanimated library has some internal optimizations,
            // sometimes when the modal is hidden styles of the image and slider might not be updated.
            // To trigger the update we need to slightly change the following values:
            translateSlider.value += 0.01;
            rotation.value += 360;
        });
    }, [imageUri, originalImageHeight, originalImageWidth, rotation, translateSlider]);

    /**
     * Validates that value is within the provided mix/max range.
     */
    const clamp = useWorkletCallback((value: number, [min, max]) => interpolate(value, [min, max], [min, max], 'clamp'), []);

    /**
     * Returns current image size taking into account scale and rotation.
     */
    const getDisplayedImageSize = useWorkletCallback(() => {
        let height = imageContainerSize * scale.value;
        let width = imageContainerSize * scale.value;

        // Since the smaller side will be always equal to the imageContainerSize multiplied by scale,
        // another side can be calculated with aspect ratio.
        if (originalImageWidth.value > originalImageHeight.value) {
            width *= originalImageWidth.value / originalImageHeight.value;
        } else {
            height *= originalImageHeight.value / originalImageWidth.value;
        }

        return {height, width};
    }, [imageContainerSize, scale]);

    /**
     * Validates the offset to prevent overflow, and updates the image offset.
     */
    const updateImageOffset = useWorkletCallback(
        (offsetX: number, offsetY: number) => {
            const {height, width} = getDisplayedImageSize();
            const maxOffsetX = (width - imageContainerSize) / 2;
            const maxOffsetY = (height - imageContainerSize) / 2;
            translateX.value = clamp(offsetX, [maxOffsetX * -1, maxOffsetX]);
            translateY.value = clamp(offsetY, [maxOffsetY * -1, maxOffsetY]);
            prevMaxOffsetX.value = maxOffsetX;
            prevMaxOffsetY.value = maxOffsetY;
        },
        [imageContainerSize, scale, clamp],
    );

    const newScaleValue = useWorkletCallback((newSliderValue: number, containerSize: number) => {
        const {MAX_SCALE, MIN_SCALE} = CONST.AVATAR_CROP_MODAL;
        return (newSliderValue / containerSize) * (MAX_SCALE - MIN_SCALE) + MIN_SCALE;
    });

    /**
     * Calculates new x & y image translate value on image panning
     * and updates image's offset.
     */
    const panGesture = Gesture.Pan().onChange((event) => {
        const newX = translateX.value + event.changeX;
        const newY = translateY.value + event.changeY;

        updateImageOffset(newX, newY);
    });

    // This effect is needed to recalculate the maximum offset values
    // when the browser window is resized.
    useEffect(() => {
        // If no panning has happened and the value is 0, do an early return.
        if (!prevMaxOffsetX.value && !prevMaxOffsetY.value) {
            return;
        }
        const {height, width} = getDisplayedImageSize();
        const maxOffsetX = (width - imageContainerSize) / 2;
        const maxOffsetY = (height - imageContainerSize) / 2;

        // Since interpolation is expensive, we only want to do it if
        // image has been panned across X or Y axis by the user.
        if (prevMaxOffsetX) {
            translateX.value = interpolate(translateX.value, [prevMaxOffsetX.value * -1, prevMaxOffsetX.value], [maxOffsetX * -1, maxOffsetX]);
        }

        if (prevMaxOffsetY) {
            translateY.value = interpolate(translateY.value, [prevMaxOffsetY.value * -1, prevMaxOffsetY.value], [maxOffsetY * -1, maxOffsetY]);
        }
        prevMaxOffsetX.value = maxOffsetX;
        prevMaxOffsetY.value = maxOffsetY;
    }, [getDisplayedImageSize, imageContainerSize, prevMaxOffsetX, prevMaxOffsetY, translateX, translateY]);

    /**
     * Calculates new scale value and updates images offset to ensure
     * that image stays in the center of the container after changing scale.
     */
    const sliderPanGestureCallbacks = {
        onBegin: () => {
            'worklet';

            isPressableEnabled.value = false;
        },
        onChange: (event: GestureUpdateEvent<PanGestureHandlerEventPayload & PanGestureChangeEventPayload>) => {
            'worklet';

            const newSliderValue = clamp(translateSlider.value + event.changeX, [0, sliderContainerSize]);
            const newScale = newScaleValue(newSliderValue, sliderContainerSize);

            const differential = newScale / scale.value;

            scale.value = newScale;
            translateSlider.value = newSliderValue;

            const newX = translateX.value * differential;
            const newY = translateY.value * differential;
            updateImageOffset(newX, newY);
        },
        onFinalize: () => {
            'worklet';

            isPressableEnabled.value = true;
        },
    };

    // This effect is needed to prevent the incorrect position of
    // the slider's knob when the window's layout changes
    useEffect(() => {
        translateSlider.value = interpolate(scale.value, [CONST.AVATAR_CROP_MODAL.MIN_SCALE, CONST.AVATAR_CROP_MODAL.MAX_SCALE], [0, sliderContainerSize]);
    }, [scale.value, sliderContainerSize, translateSlider]);

    // Rotates the image by changing the rotation value by 90 degrees
    // and updating the position so the image remains in the same place after rotation
    const rotateImage = useCallback(() => {
        rotation.value -= 90;

        // Rotating 2d coordinates by applying the formula (x, y) → (-y, x).
        [translateX.value, translateY.value] = [translateY.value, translateX.value * -1];

        // Since we rotated the image by 90 degrees, now width becomes height and vice versa.
        [originalImageHeight.value, originalImageWidth.value] = [originalImageWidth.value, originalImageHeight.value];
    }, [originalImageHeight.value, originalImageWidth.value, rotation, translateX.value, translateY.value]);

    // Crops an image that was provided in the imageUri prop, using the current position/scale
    // then calls onSave and onClose callbacks
    const cropAndSaveImage = useCallback(() => {
        if (isLoading.value) {
            return;
        }
        isLoading.value = true;
        const smallerSize = Math.min(originalImageHeight.value, originalImageWidth.value);
        const size = smallerSize / scale.value;
        const imageCenterX = originalImageWidth.value / 2;
        const imageCenterY = originalImageHeight.value / 2;
        const apothem = size / 2; // apothem for squares is equals to half of it size

        // Since the translate value is only a distance from the image center, we are able to calculate
        // the originX and the originY - start coordinates of cropping view.
        const originX = imageCenterX - apothem - (translateX.value / imageContainerSize / scale.value) * smallerSize;
        const originY = imageCenterY - apothem - (translateY.value / imageContainerSize / scale.value) * smallerSize;

        const crop = {
            height: size,
            width: size,
            originX,
            originY,
        };

        // Svg images are converted to a png blob to preserve transparency, so we need to update the
        // image name and type accordingly.
        const isSvg = imageType.includes('image/svg');
        const name = isSvg ? 'fileName.png' : imageName;
        const type = isSvg ? 'image/png' : imageType;

        cropOrRotateImage(imageUri, [{rotate: rotation.value % 360}, {crop}], {compress: 1, name, type})
            .then((newImage) => {
                onClose?.();
                onSave?.(newImage);
            })
            .catch(() => {
                isLoading.value = false;
            });
    }, [
        imageUri,
        imageName,
        imageType,
        onClose,
        onSave,
        originalImageHeight.value,
        originalImageWidth.value,
        scale.value,
        translateX.value,
        imageContainerSize,
        translateY.value,
        rotation.value,
        isLoading,
    ]);

    const sliderOnPress = (locationX: number) => {
        // We are using the worklet directive here and running on the UI thread to ensure the Reanimated
        // shared values are updated synchronously, as they update asynchronously on the JS thread.

        'worklet';

        if (!locationX || !isPressableEnabled.value) {
            return;
        }
        const newSliderValue = clamp(locationX, [0, sliderContainerSize]);
        const newScale = newScaleValue(newSliderValue, sliderContainerSize);
        translateSlider.value = newSliderValue;
        const differential = newScale / scale.value;
        scale.value = newScale;
        const newX = translateX.value * differential;
        const newY = translateY.value * differential;
        updateImageOffset(newX, newY);
    };

    return (
        <Modal
            onClose={() => onClose?.()}
            isVisible={isVisible}
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            onModalHide={resetState}
            shouldUseCustomBackdrop
        >
            <ScreenWrapper
                style={[styles.pb0]}
                includePaddingTop={false}
                includeSafeAreaPaddingBottom={false}
                testID={AvatarCropModal.displayName}
            >
                {shouldUseNarrowLayout && <HeaderGap />}
                <HeaderWithBackButton
                    title={translate('avatarCropModal.title')}
                    onBackButtonPress={onClose}
                />
                <Text style={[styles.mh5]}>{translate('avatarCropModal.description')}</Text>
                <GestureHandlerRootView
                    onLayout={initializeImageContainer}
                    style={[styles.alignSelfStretch, styles.m5, styles.flex1, styles.alignItemsCenter]}
                >
                    {/* To avoid layout shift we should hide this component until the image container & image is initialized */}
                    {!isImageInitialized || !isImageContainerInitialized ? (
                        <ActivityIndicator
                            color={theme.spinner}
                            style={[styles.flex1]}
                            size="large"
                        />
                    ) : (
                        <>
                            <ImageCropView
                                imageUri={imageUri}
                                containerSize={imageContainerSize}
                                panGesture={panGesture}
                                originalImageHeight={originalImageHeight}
                                originalImageWidth={originalImageWidth}
                                scale={scale}
                                translateY={translateY}
                                translateX={translateX}
                                rotation={rotation}
                                maskImage={maskImage}
                            />
                            <View style={[styles.mt5, styles.justifyContentBetween, styles.alignItemsCenter, styles.flexRow, StyleUtils.getWidthStyle(imageContainerSize)]}>
                                <Icon
                                    src={Expensicons.Zoom}
                                    fill={theme.icon}
                                />

                                <PressableWithoutFeedback
                                    style={[styles.mh5, styles.flex1]}
                                    onLayout={initializeSliderContainer}
                                    onPressIn={(e) => runOnUI(sliderOnPress)(e.nativeEvent.locationX)}
                                    accessibilityLabel="slider"
                                    role={CONST.ROLE.SLIDER}
                                >
                                    <Slider
                                        sliderValue={translateSlider}
                                        gestureCallbacks={sliderPanGestureCallbacks}
                                    />
                                </PressableWithoutFeedback>
                                <Tooltip
                                    text={translate('common.rotate')}
                                    shiftVertical={-2}
                                >
                                    <View>
                                        <Button
                                            icon={Expensicons.Rotate}
                                            iconFill={theme.icon}
                                            onPress={rotateImage}
                                        />
                                    </View>
                                </Tooltip>
                            </View>
                        </>
                    )}
                </GestureHandlerRootView>
                <Button
                    success
                    style={[styles.m5]}
                    onPress={cropAndSaveImage}
                    pressOnEnter
                    large
                    text={translate('common.save')}
                />
            </ScreenWrapper>
        </Modal>
    );
}

AvatarCropModal.displayName = 'AvatarCropModal';

export default AvatarCropModal;
