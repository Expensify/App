import PropTypes from 'prop-types';
import React, {
    useCallback, useEffect, useState,
} from 'react';
import {
    ActivityIndicator, Image, View, Pressable,
} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {
    runOnUI,
    interpolate,
    useAnimatedGestureHandler,
    useSharedValue,
    useWorkletCallback,
} from 'react-native-reanimated';
import CONST from '../../CONST';
import compose from '../../libs/compose';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import Button from '../Button';
import HeaderWithCloseButton from '../HeaderWithCloseButton';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import Modal from '../Modal';
import Text from '../Text';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';
import ImageCropView from './ImageCropView';
import Slider from './Slider';
import cropOrRotateImage from '../../libs/cropOrRotateImage';
import HeaderGap from '../HeaderGap';
import * as StyleUtils from '../../styles/StyleUtils';

const propTypes = {
    /** Link to image for cropping */
    imageUri: PropTypes.string,

    /** Name of the image */
    imageName: PropTypes.string,

    /** Type of the image file */
    imageType: PropTypes.string,

    /** Callback to be called when user closes the modal */
    onClose: PropTypes.func,

    /** Callback to be called when user saves the image */
    onSave: PropTypes.func,

    /** Modal visibility */
    isVisible: PropTypes.bool.isRequired,

    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
};

const defaultProps = {
    imageUri: '',
    imageName: '',
    imageType: '',
    onClose: () => {},
    onSave: () => {},
};

// This component can't be written using class since reanimated API uses hooks.
const AvatarCropModal = (props) => {
    const originalImageWidth = useSharedValue(CONST.AVATAR_CROP_MODAL.INITIAL_SIZE);
    const originalImageHeight = useSharedValue(CONST.AVATAR_CROP_MODAL.INITIAL_SIZE);
    const translateY = useSharedValue(0);
    const translateX = useSharedValue(0);
    const scale = useSharedValue(CONST.AVATAR_CROP_MODAL.MIN_SCALE);
    const rotation = useSharedValue(0);
    const translateSlider = useSharedValue(0);
    const isPressableEnabled = useSharedValue(true);

    const [imageContainerSize, setImageContainerSize] = useState(CONST.AVATAR_CROP_MODAL.INITIAL_SIZE);
    const [sliderContainerSize, setSliderContainerSize] = useState(CONST.AVATAR_CROP_MODAL.INITIAL_SIZE);
    const [isImageContainerInitialized, setIsImageContainerInitialized] = useState(false);
    const [isImageInitialized, setIsImageInitialized] = useState(false);

    // An onLayout callback, that initializes the image container, for proper render of an image
    const initializeImageContainer = useCallback((event) => {
        setIsImageContainerInitialized(true);
        const {height, width} = event.nativeEvent.layout;
        setImageContainerSize(Math.floor(Math.min(height - styles.imageCropRotateButton.height, width)));
    }, [props.isSmallScreenWidth]);

    // An onLayout callback, that initializes the slider container size, for proper render of a slider
    const initializeSliderContainer = useCallback((event) => {
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
        setImageContainerSize(CONST.AVATAR_CROP_MODAL.INITIAL_SIZE);
        setSliderContainerSize(CONST.AVATAR_CROP_MODAL.INITIAL_SIZE);
        setIsImageContainerInitialized(false);
        setIsImageInitialized(false);
    }, []);

    // In order to calculate proper image position/size/animation, we have to know its size.
    // And we have to update image size if image url changes.
    useEffect(() => {
        if (!props.imageUri) {
            return;
        }
        Image.getSize(props.imageUri, (width, height) => {
            // We need to have image sizes in shared values to properly calculate position/size/animation
            originalImageHeight.value = height;
            originalImageWidth.value = width;
            setIsImageInitialized(true);

            // Because the reanimated library has some internal optimizations,
            // sometimes when the modal is hidden styles of the image and slider might not be updated.
            // To trigger the update we need to slightly change the following values:
            translateSlider.value += 0.01;
            rotation.value += 360;
        });
    }, [props.imageUri]);

    /**
     * Validates that value is within the provided mix/max range.
     *
     * @param {Number} value
     * @param {Array} minMax
     * @returns {Number}
     */
    const clamp = useWorkletCallback((value, [min, max]) => interpolate(value, [min, max], [min, max], 'clamp'), []);

    /**
     * Returns current image size taking into account scale and rotation.
     *
     * @returns {Object}
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
     *
     * @param {Number} newX
     * @param {Number} newY
     */
    const updateImageOffset = useWorkletCallback((offsetX, offsetY) => {
        const {height, width} = getDisplayedImageSize();
        const maxOffsetX = (width - imageContainerSize) / 2;
        const maxOffsetY = (height - imageContainerSize) / 2;
        translateX.value = clamp(offsetX, [maxOffsetX * -1, maxOffsetX]);
        translateY.value = clamp(offsetY, [maxOffsetY * -1, maxOffsetY]);
    }, [imageContainerSize, scale, clamp]);

    /**
     * @param {Number} newSliderValue
     * @param {Number} containerSize
     * @returns {Number}
     */
    const newScaleValue = useWorkletCallback((newSliderValue, containerSize) => {
        const {MAX_SCALE, MIN_SCALE} = CONST.AVATAR_CROP_MODAL;
        return ((newSliderValue / containerSize) * (MAX_SCALE - MIN_SCALE)) + MIN_SCALE;
    });

    /**
     * Calculates new x & y image translate value on image panning
     * and updates image's offset.
     */
    const panGestureEventHandler = useAnimatedGestureHandler({
        onStart: (_, context) => {
            // we have to assign translate values to a context
            // since that is required for proper work of turbo modules.
            // eslint-disable-next-line no-param-reassign
            context.translateX = translateX.value;
            // eslint-disable-next-line no-param-reassign
            context.translateY = translateY.value;
        },
        onActive: (event, context) => {
            const newX = event.translationX + context.translateX;
            const newY = event.translationY + context.translateY;

            updateImageOffset(newX, newY);
        },
    }, [imageContainerSize, updateImageOffset, translateX, translateY]);

    /**
     * Calculates new scale value and updates images offset to ensure
     * that image stays in the center of the container after changing scale.
     */
    const panSliderGestureEventHandler = useAnimatedGestureHandler({
        onStart: (_, context) => {
            // we have to assign this value to a context
            // since that is required for proper work of turbo modules.
            // eslint-disable-next-line no-param-reassign
            context.translateSliderX = translateSlider.value;
            isPressableEnabled.value = false;
        },
        onActive: (event, context) => {
            const newSliderValue = clamp(event.translationX + context.translateSliderX, [0, sliderContainerSize]);
            const newScale = newScaleValue(newSliderValue, sliderContainerSize);

            const differential = newScale / scale.value;

            scale.value = newScale;
            translateSlider.value = newSliderValue;

            const newX = translateX.value * differential;
            const newY = translateY.value * differential;
            updateImageOffset(newX, newY);
        },
        onEnd: () => isPressableEnabled.value = true,
    }, [imageContainerSize, clamp, translateX, translateY, translateSlider, scale, sliderContainerSize, isPressableEnabled]);

    // This effect is needed to prevent the incorrect position of
    // the slider's knob when the window's layout changes
    useEffect(() => {
        translateSlider.value = interpolate(
            scale.value,
            [CONST.AVATAR_CROP_MODAL.MIN_SCALE, CONST.AVATAR_CROP_MODAL.MAX_SCALE],
            [0, sliderContainerSize],
        );
    }, [sliderContainerSize]);

    // Rotates the image by changing the rotation value by 90 degrees
    // and updating the position so the image remains in the same place after rotation
    const rotateImage = useCallback(() => {
        rotation.value -= 90;

        // Rotating 2d coordinates by applying the formula (x, y) → (-y, x).
        [translateX.value, translateY.value] = [translateY.value, translateX.value * -1];

        // Since we rotated the image by 90 degrees, now width becomes height and vice versa.
        [originalImageHeight.value, originalImageWidth.value] = [
            originalImageWidth.value,
            originalImageHeight.value,
        ];
    }, []);

    // Crops an image that was provided in the imageUri prop, using the current position/scale
    // then calls onSave and onClose callbacks
    const cropAndSaveImage = useCallback(() => {
        const smallerSize = Math.min(originalImageHeight.value, originalImageWidth.value);
        const size = smallerSize / scale.value;
        const imageCenterX = originalImageWidth.value / 2;
        const imageCenterY = originalImageHeight.value / 2;
        const apothem = size / 2; // apothem for squares is equals to half of it size

        // Since the translate value is only a distance from the image center, we are able to calculate
        // the originX and the originY - start coordinates of cropping view.
        const originX = imageCenterX - apothem - ((translateX.value / imageContainerSize / scale.value) * smallerSize);
        const originY = imageCenterY - apothem - ((translateY.value / imageContainerSize / scale.value) * smallerSize);

        const crop = {
            height: size, width: size, originX, originY,
        };

        const isSvg = props.imageType.includes('image/svg');
        const imageName = isSvg ? 'fileName.png' : props.imageName;
        const imageType = isSvg ? 'image/png' : props.imageType;

        cropOrRotateImage(
            props.imageUri,
            [{rotate: rotation.value % 360}, {crop}],
            {compress: 1, name: imageName, type: imageType},
        )
            .then((newImage) => {
                props.onClose();
                props.onSave(newImage);
            });
    }, [props.imageUri, props.imageName, props.imageType, imageContainerSize]);

    /**
     * @param {Number} locationX
     */
    const sliderOnPress = (locationX) => {
        // We are using the worklet directive here and running on the UI thread to ensure the Reanimated
        // shared values are updated synchronously, as they update asynchronously on the JS thread.

        'worklet';

        if (!isPressableEnabled.value) {
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
            onClose={props.onClose}
            isVisible={props.isVisible}
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            onModalHide={resetState}
            statusBarTranslucent={false}
        >
            {props.isSmallScreenWidth && <HeaderGap />}
            <HeaderWithCloseButton
                title={props.translate('avatarCropModal.title')}
                onCloseButtonPress={props.onClose}
            />
            <Text style={[styles.mh5]}>{props.translate('avatarCropModal.description')}</Text>
            <GestureHandlerRootView onLayout={initializeImageContainer} style={[styles.alignSelfStretch, styles.m5, styles.flex1, styles.alignItemsCenter]}>

                {/* To avoid layout shift we should hide this component until the image container & image is initialized */}
                {(!isImageInitialized || !isImageContainerInitialized) ? <ActivityIndicator color={themeColors.spinner} style={[styles.flex1]} size="large" />
                    : (
                        <>
                            <ImageCropView
                                imageUri={props.imageUri}
                                containerSize={imageContainerSize}
                                panGestureEventHandler={panGestureEventHandler}
                                originalImageHeight={originalImageHeight}
                                originalImageWidth={originalImageWidth}
                                scale={scale}
                                translateY={translateY}
                                translateX={translateX}
                                rotation={rotation}
                            />
                            <View style={[styles.mt5, styles.justifyContentBetween, styles.alignItemsCenter, styles.flexRow, StyleUtils.getWidthStyle(imageContainerSize)]}>
                                <Icon src={Expensicons.Zoom} fill={themeColors.icons} />
                                <Pressable
                                    style={[styles.mh5, styles.flex1]}
                                    onLayout={initializeSliderContainer}
                                    onPressIn={e => runOnUI(sliderOnPress)(e.nativeEvent.locationX)}
                                >
                                    <Slider sliderValue={translateSlider} onGesture={panSliderGestureEventHandler} />
                                </Pressable>
                                <Button
                                    medium
                                    icon={Expensicons.Rotate}
                                    iconFill={themeColors.inverse}
                                    iconStyles={[styles.mr0]}
                                    style={[styles.imageCropRotateButton]}
                                    onPress={rotateImage}
                                />
                            </View>
                        </>
                    )}
            </GestureHandlerRootView>
            <Button
                success
                style={[styles.m5]}
                onPress={cropAndSaveImage}
                pressOnEnter
                text={props.translate('common.save')}
            />
        </Modal>
    );
};

AvatarCropModal.displayName = 'AvatarCropModal';
AvatarCropModal.propTypes = propTypes;
AvatarCropModal.defaultProps = defaultProps;
export default compose(
    withWindowDimensions,
    withLocalize,
)(AvatarCropModal);
