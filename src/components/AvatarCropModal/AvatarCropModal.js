import PropTypes from 'prop-types';
import React, {memo, useCallback, useEffect} from 'react';
import {Image, Pressable, View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {
    interpolate,
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
    useWorkletCallback,
} from 'react-native-reanimated';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import CONST from '../../CONST';
import compose from '../../libs/compose';
import colors from '../../styles/colors';
import styles from '../../styles/styles';
import variables from '../../styles/variables';
import Button from '../Button';
import HeaderWithCloseButton from '../HeaderWithCloseButton';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import Modal from '../Modal';
import Text from '../Text';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';
import ImageCropView from './components/ImageCropView';
import Slider from './components/Slider';
import imageManipulator from './libs/imageManipulator';

const IMAGE_CONTAINER_PADDING = 40;
const MAX_IMAGE_CONTAINER_SIZE = 500;
const MAX_SCALE = 3;
const MIN_SCALE = 1;

const propTypes = {
    /** Link to image for cropping   */
    imageUri: PropTypes.string,

    /** Callback to be called when user closes the modal */
    onClose: PropTypes.func,

    /** Callback to be called when user saves the image */
    onSave: PropTypes.func,

    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
};

const defaultProps = {
    imageUri: null,
    onClose: () => { },
    onSave: () => { },
};

// This component can't be written using class since reanimated API uses hooks.
const AvatarCropModal = (props) => {
    const originalImageWidth = useSharedValue(1);
    const originalImageHeight = useSharedValue(1);
    const translateY = useSharedValue(0);
    const translateX = useSharedValue(0);
    const scale = useSharedValue(MIN_SCALE);
    const rotation = useSharedValue(0);
    const translateSlider = useSharedValue(0);

    // TODO: calculate variable using onLayout callback
    const imageContainerSize = props.isSmallScreenWidth
        ? Math.min(props.windowWidth, MAX_IMAGE_CONTAINER_SIZE) - IMAGE_CONTAINER_PADDING
        : variables.sideBarWidth - IMAGE_CONTAINER_PADDING;

    // TODO: calculate variable using onLayout callback
    const sliderLineWidth = imageContainerSize - 105;

    /**
     * Changes the modal state values to initial
    */
    const initializeImage = useCallback(() => {
        translateY.value = 0;
        translateX.value = 0;
        scale.value = MIN_SCALE;
        rotation.value = 0;
        translateSlider.value = 0;
    }, []);

    useEffect(() => {
        if (!props.imageUri) {
            return;
        }
        initializeImage();
        Image.getSize(props.imageUri, (width, height) => {
            originalImageHeight.value = height;
            originalImageWidth.value = width;
            translateSlider.value += 0.01;
            rotation.value += 360;
        });
    }, [props.imageUri, initializeImage]);

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
     * Calculates new x & y image translate value on image panning
     * and updates image's offset.
    */
    const panGestureEvent = useAnimatedGestureHandler({
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
    const panSliderGestureEvent = useAnimatedGestureHandler({
        onStart: (_, context) => {
            // we have to assign this value to a context
            // since that is required for proper work of turbo modules.
            // eslint-disable-next-line no-param-reassign
            context.translateSliderX = translateSlider.value;
        },
        onActive: (event, context) => {
            const newSliderValue = clamp(event.translationX + context.translateSliderX, [0, sliderLineWidth]);
            const newScale = ((newSliderValue / sliderLineWidth) * (MAX_SCALE - MIN_SCALE)) + MIN_SCALE;
            const differential = newScale / scale.value;

            scale.value = newScale;
            translateSlider.value = newSliderValue;

            const newX = translateX.value * differential;
            const newY = translateY.value * differential;
            updateImageOffset(newX, newY);
        },
    }, [imageContainerSize, clamp, translateX, translateY, translateSlider, scale]);

    const imageStyle = useAnimatedStyle(() => {
        const height = originalImageHeight.value;
        const width = originalImageWidth.value;
        const aspectRatio = height > width ? height / width : width / height;
        const rotate = interpolate(rotation.value, [0, 360], [0, 360]);
        return {
            transform: [
                {translateX: translateX.value},
                {translateY: translateY.value},
                {scale: scale.value * aspectRatio},
                {rotate: `${rotate}deg`},
            ],
        };
    }, [originalImageHeight.value, originalImageWidth.value, clamp]);

    const handleRotate = useCallback(() => {
        rotation.value -= 90;

        // Rotating 2d coordinates by applying the formula (x, y) → (-y, x).
        [translateX.value, translateY.value] = [translateY.value, translateX.value * -1];

        // Since we rotated the image by 90 degrees, now width becomes height and vice versa.
        [originalImageHeight.value, originalImageWidth.value] = [
            originalImageWidth.value,
            originalImageHeight.value,
        ];
    }, []);

    const handleCrop = useCallback(() => {
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

        imageManipulator(props.imageUri, [{rotate: rotation.value % 360}, {crop}], {compress: 1})
            .then((newImage) => {
                props.onClose();
                props.onSave(newImage);
            });
    }, [props.imageUri, imageContainerSize]);

    return (
        <Modal
            onClose={props.onClose}
            isVisible={props.isVisible}
            shouldSetModalVisibility={props.shouldSetModalVisibility}
            type={props.isSmallScreenWidth
                ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED
                : CONST.MODAL.MODAL_TYPE.CONFIRM}
            containerStyle={props.isSmallScreenWidth && styles.h100}
        >
            <SafeAreaProvider style={[styles.pb5, styles.flex1]}>
                <HeaderWithCloseButton
                    title={props.translate('avatarCropModal.title')}
                    onCloseButtonPress={props.onClose}
                />
                <Text style={[styles.mh5]}>{props.translate('avatarCropModal.description')}</Text>
                <GestureHandlerRootView style={[{width: imageContainerSize}, styles.alignSelfCenter, styles.mv5, styles.flex1]}>
                    <ImageCropView
                        imageUri={props.imageUri}
                        style={[imageStyle, styles.h100, styles.w100]}
                        containerSize={imageContainerSize}
                        panGestureEvent={panGestureEvent}
                        onLayout={initializeImage}
                    />
                    <View style={[styles.mt5, styles.justifyContentBetween, styles.alignItemsCenter, styles.flexRow]}>
                        <Icon src={Expensicons.Zoom} fill={colors.gray3} />
                        <Slider sliderValue={translateSlider} onGestureEvent={panSliderGestureEvent} sliderLineWidth={sliderLineWidth} />
                        <Pressable
                            onPress={handleRotate}
                            style={[styles.imageCropRotateButton]}
                        >
                            <Icon src={Expensicons.Rotate} fill={colors.black} />
                        </Pressable>
                    </View>
                </GestureHandlerRootView>
                <Button
                    success
                    style={[styles.mh5, styles.mt6]}
                    onPress={handleCrop}
                    pressOnEnter
                    text={props.translate('common.save')}
                />
            </SafeAreaProvider>
        </Modal>
    );
};

AvatarCropModal.displayName = 'AvatarCropModal';
AvatarCropModal.propTypes = propTypes;
AvatarCropModal.defaultProps = defaultProps;
export default compose(
    withWindowDimensions,
    withLocalize,
)(memo(AvatarCropModal));
