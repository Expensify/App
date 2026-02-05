import React, {useCallback, useEffect, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import type {LayoutChangeEvent} from 'react-native';
import {Gesture, GestureHandlerRootView} from 'react-native-gesture-handler';
import type {GestureUpdateEvent, PanGestureChangeEventPayload, PanGestureHandlerEventPayload} from 'react-native-gesture-handler';
import ImageSize from 'react-native-image-size';
import {interpolate, useSharedValue} from 'react-native-reanimated';
import {scheduleOnUI} from 'react-native-worklets';
import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import Modal from '@components/Modal';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
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

    /** Custom primary action label text */
    buttonLabel?: string;
};

// This component can't be written using class since reanimated API uses hooks.
function AvatarCropModal({imageUri = '', imageName = '', imageType = '', onClose, onSave, isVisible, maskImage, buttonLabel}: AvatarCropModalProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const icons = useMemoizedLazyExpensifyIcons(['Zoom', 'Rotate'] as const);

    const originalImageWidth = useSharedValue<number>(CONST.AVATAR_CROP_MODAL.INITIAL_SIZE);
    const originalImageHeight = useSharedValue<number>(CONST.AVATAR_CROP_MODAL.INITIAL_SIZE);
    const translateY = useSharedValue(0);
    const translateX = useSharedValue(0);
    const scale = useSharedValue<number>(CONST.AVATAR_CROP_MODAL.MIN_SCALE);
    const rotation = useSharedValue(0);
    const translateSlider = useSharedValue(0);
    const isPressableEnabled = useSharedValue(true);

    const {translate} = useLocalize();
    const buttonText = buttonLabel ?? translate('common.save');

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
        const relativeHeight = Math.max(height - CONST.AVATAR_CROP_MODAL.CONTAINER_VERTICAL_MARGIN, CONST.AVATAR_CROP_MODAL.INITIAL_SIZE);
        setImageContainerSize(Math.floor(Math.min(relativeHeight, width)));
    }, []);

    // An onLayout callback, that initializes the slider container size, for proper render of a slider
    const initializeSliderContainer = useCallback((event: LayoutChangeEvent) => {
        setSliderContainerSize(event.nativeEvent.layout.width);
    }, []);

    // Changes the modal state values to initial
    const resetState = useCallback(() => {
        originalImageWidth.set(CONST.AVATAR_CROP_MODAL.INITIAL_SIZE);
        originalImageHeight.set(CONST.AVATAR_CROP_MODAL.INITIAL_SIZE);
        translateY.set(0);
        translateX.set(0);
        scale.set(CONST.AVATAR_CROP_MODAL.MIN_SCALE);
        rotation.set(0);
        translateSlider.set(0);
        prevMaxOffsetX.set(0);
        prevMaxOffsetY.set(0);
        isLoading.set(false);
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
        ImageSize.getSize(imageUri).then(({width, height, rotation: originalRotation}) => {
            // On Android devices ImageSize library returns also rotation parameter.
            if (originalRotation === 90 || originalRotation === 270) {
                originalImageHeight.set(width);
                originalImageWidth.set(height);
            } else {
                originalImageHeight.set(height);
                originalImageWidth.set(width);
            }

            setIsImageInitialized(true);

            // Because the reanimated library has some internal optimizations,
            // sometimes when the modal is hidden styles of the image and slider might not be updated.
            // To trigger the update we need to slightly change the following values:
            translateSlider.set((value) => value + 0.01);
            rotation.set((value) => value + 360);
        });
    }, [imageUri, originalImageHeight, originalImageWidth, rotation, translateSlider]);

    /**
     * Validates that value is within the provided mix/max range.
     */
    const clamp = useCallback((value: number, [min, max]: [number, number]) => {
        'worklet';

        return interpolate(value, [min, max], [min, max], 'clamp');
    }, []);

    /**
     * Returns current image size taking into account scale and rotation.
     */
    const getDisplayedImageSize = useCallback(() => {
        'worklet';

        let height = imageContainerSize * scale.get();
        let width = imageContainerSize * scale.get();

        // Since the smaller side will be always equal to the imageContainerSize multiplied by scale,
        // another side can be calculated with aspect ratio.
        if (originalImageWidth.get() > originalImageHeight.get()) {
            width *= originalImageWidth.get() / originalImageHeight.get();
        } else {
            height *= originalImageHeight.get() / originalImageWidth.get();
        }

        return {height, width};
    }, [imageContainerSize, originalImageHeight, originalImageWidth, scale]);

    /**
     * Validates the offset to prevent overflow, and updates the image offset.
     */
    const updateImageOffset = useCallback(
        (offsetX: number, offsetY: number) => {
            'worklet';

            const {height, width} = getDisplayedImageSize();
            const maxOffsetX = (width - imageContainerSize) / 2;
            const maxOffsetY = (height - imageContainerSize) / 2;
            translateX.set(clamp(offsetX, [maxOffsetX * -1, maxOffsetX]));
            translateY.set(clamp(offsetY, [maxOffsetY * -1, maxOffsetY]));
            prevMaxOffsetX.set(maxOffsetX);
            prevMaxOffsetY.set(maxOffsetY);
        },
        [getDisplayedImageSize, imageContainerSize, translateX, clamp, translateY, prevMaxOffsetX, prevMaxOffsetY],
    );

    const newScaleValue = useCallback((newSliderValue: number, containerSize: number) => {
        'worklet';

        const {MAX_SCALE, MIN_SCALE} = CONST.AVATAR_CROP_MODAL;
        return (newSliderValue / containerSize) * (MAX_SCALE - MIN_SCALE) + MIN_SCALE;
    }, []);

    /**
     * Calculates new x & y image translate value on image panning
     * and updates image's offset.
     */
    const panGesture = Gesture.Pan().onChange((event) => {
        const newX = translateX.get() + event.changeX;
        const newY = translateY.get() + event.changeY;

        updateImageOffset(newX, newY);
    });

    // This effect is needed to recalculate the maximum offset values
    // when the browser window is resized.
    useEffect(() => {
        // If no panning has happened and the value is 0, do an early return.
        if (!prevMaxOffsetX.get() && !prevMaxOffsetY.get()) {
            return;
        }
        const {height, width} = getDisplayedImageSize();
        const maxOffsetX = (width - imageContainerSize) / 2;
        const maxOffsetY = (height - imageContainerSize) / 2;

        // Since interpolation is expensive, we only want to do it if
        // image has been panned across X or Y axis by the user.
        if (prevMaxOffsetX) {
            translateX.set(interpolate(translateX.get(), [prevMaxOffsetX.get() * -1, prevMaxOffsetX.get()], [maxOffsetX * -1, maxOffsetX]));
        }

        if (prevMaxOffsetY) {
            translateY.set(interpolate(translateY.get(), [prevMaxOffsetY.get() * -1, prevMaxOffsetY.get()], [maxOffsetY * -1, maxOffsetY]));
        }
        prevMaxOffsetX.set(maxOffsetX);
        prevMaxOffsetY.set(maxOffsetY);
    }, [getDisplayedImageSize, imageContainerSize, prevMaxOffsetX, prevMaxOffsetY, translateX, translateY]);

    /**
     * Calculates new scale value and updates images offset to ensure
     * that image stays in the center of the container after changing scale.
     */
    const sliderPanGestureCallbacks = {
        onBegin: () => {
            'worklet';

            isPressableEnabled.set(false);
        },
        onChange: (event: GestureUpdateEvent<PanGestureHandlerEventPayload & PanGestureChangeEventPayload>) => {
            'worklet';

            const newSliderValue = clamp(translateSlider.get() + event.changeX, [0, sliderContainerSize]);
            const newScale = newScaleValue(newSliderValue, sliderContainerSize);

            const differential = newScale / scale.get();

            scale.set(newScale);
            translateSlider.set(newSliderValue);

            const newX = translateX.get() * differential;
            const newY = translateY.get() * differential;
            updateImageOffset(newX, newY);
        },
        onFinalize: () => {
            'worklet';

            isPressableEnabled.set(true);
        },
    };

    // This effect is needed to prevent the incorrect position of
    // the slider's knob when the window's layout changes
    useEffect(() => {
        translateSlider.set(interpolate(scale.get(), [CONST.AVATAR_CROP_MODAL.MIN_SCALE, CONST.AVATAR_CROP_MODAL.MAX_SCALE], [0, sliderContainerSize]));
    }, [scale, sliderContainerSize, translateSlider]);

    // Rotates the image by changing the rotation value by 90 degrees
    // and updating the position so the image remains in the same place after rotation
    const rotateImage = useCallback(() => {
        rotation.set((value) => value - 90);

        const oldTranslateX = translateX.get();
        translateX.set(translateY.get());
        translateY.set(oldTranslateX * -1);

        const oldOriginalImageHeight = originalImageHeight.get();
        originalImageHeight.set(originalImageWidth.get());
        originalImageWidth.set(oldOriginalImageHeight);
    }, [originalImageHeight, originalImageWidth, rotation, translateX, translateY]);

    // Crops an image that was provided in the imageUri prop, using the current position/scale
    // then calls onSave and onClose callbacks
    const cropAndSaveImage = useCallback(() => {
        if (isLoading.get()) {
            return;
        }
        isLoading.set(true);
        const smallerSize = Math.min(originalImageHeight.get(), originalImageWidth.get());
        const size = smallerSize / scale.get();
        const imageCenterX = originalImageWidth.get() / 2;
        const imageCenterY = originalImageHeight.get() / 2;
        const apothem = size / 2; // apothem for squares is equals to half of it size

        // Since the translate value is only a distance from the image center, we are able to calculate
        // the originX and the originY - start coordinates of cropping view.
        const originX = imageCenterX - apothem - (translateX.get() / imageContainerSize / scale.get()) * smallerSize;
        const originY = imageCenterY - apothem - (translateY.get() / imageContainerSize / scale.get()) * smallerSize;

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

        cropOrRotateImage(imageUri, [{rotate: rotation.get() % 360}, {crop}], {compress: 1, name, type})
            .then((newImage) => {
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                InteractionManager.runAfterInteractions(() => {
                    onClose?.();
                });
                onSave?.(newImage);
            })
            .catch(() => {
                isLoading.set(false);
            });
    }, [isLoading, originalImageHeight, originalImageWidth, scale, translateX, imageContainerSize, translateY, imageType, imageName, imageUri, rotation, onClose, onSave]);

    const sliderOnPress = (locationX: number) => {
        // We are using the worklet directive here and running on the UI thread to ensure the Reanimated
        // shared values are updated synchronously, as they update asynchronously on the JS thread.

        'worklet';

        if (!locationX || !isPressableEnabled.get()) {
            return;
        }
        const newSliderValue = clamp(locationX, [0, sliderContainerSize]);
        const newScale = newScaleValue(newSliderValue, sliderContainerSize);
        translateSlider.set(newSliderValue);
        const differential = newScale / scale.get();
        scale.set(newScale);
        const newX = translateX.get() * differential;
        const newY = translateY.get() * differential;
        updateImageOffset(newX, newY);
    };

    return (
        <Modal
            onClose={() => onClose?.()}
            isVisible={isVisible}
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            onModalHide={resetState}
            shouldUseCustomBackdrop
            shouldHandleNavigationBack
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <ScreenWrapper
                style={[styles.pb0]}
                includePaddingTop={false}
                includeSafeAreaPaddingBottom
                shouldEnableKeyboardAvoidingView={false}
                testID="AvatarCropModal"
            >
                <HeaderWithBackButton
                    title={translate('avatarCropModal.title')}
                    onBackButtonPress={onClose}
                />
                <Text style={[styles.mh5]}>{translate('avatarCropModal.description')}</Text>
                <View
                    style={[styles.flex1, styles.m5, styles.alignSelfStretch]}
                    onLayout={initializeImageContainer}
                >
                    <GestureHandlerRootView style={[styles.flex1, styles.alignItemsCenter]}>
                        {/* To avoid layout shift we should hide this component until the image container & image is initialized */}
                        {!isImageInitialized || !isImageContainerInitialized ? (
                            <ActivityIndicator
                                style={[styles.flex1]}
                                size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
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
                                        src={icons.Zoom}
                                        fill={theme.icon}
                                    />

                                    <PressableWithoutFeedback
                                        style={[styles.mh5, styles.flex1]}
                                        onLayout={initializeSliderContainer}
                                        onPressIn={(e) => scheduleOnUI(sliderOnPress, e.nativeEvent.locationX)}
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
                                                icon={icons.Rotate}
                                                iconFill={theme.icon}
                                                onPress={rotateImage}
                                            />
                                        </View>
                                    </Tooltip>
                                </View>
                            </>
                        )}
                    </GestureHandlerRootView>
                </View>
                <Button
                    success
                    style={[styles.m5]}
                    onPress={cropAndSaveImage}
                    pressOnEnter
                    large
                    text={buttonText}
                />
            </ScreenWrapper>
        </Modal>
    );
}

export default AvatarCropModal;
