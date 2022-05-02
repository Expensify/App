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
    const imageWidth = useSharedValue(1);
    const imageHeight = useSharedValue(1);
    const translateY = useSharedValue(0);
    const translateX = useSharedValue(0);
    const scale = useSharedValue(1);
    const rotation = useSharedValue(0);
    const translateSlider = useSharedValue(0);

    const imageContainerSize = props.isSmallScreenWidth ? Math.min(props.windowWidth, 500) - 40 : variables.sideBarWidth - 40;
    const sliderLineWidth = imageContainerSize - 105;

    /**
     * Changes image values to initial
    */
    const initializeImage = useCallback(() => {
        translateY.value = 0;
        translateX.value = 0;
        scale.value = 1;
        rotation.value = 0;
        translateSlider.value = 0;
    }, []);

    useEffect(() => {
        if (!props.imageUri) {
            return;
        }
        initializeImage();
        Image.getSize(props.imageUri, (width, height) => {
            imageHeight.value = height;
            imageWidth.value = width;
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
    const getImageDimensions = useWorkletCallback(() => {
        const radius = imageContainerSize / 2;
        let height = radius * scale.value;
        let width = radius * scale.value;

        // Since the smaller side will be always equal to imageContainerSize
        // to get a bigger side we have to multiply smaller side by original image aspect ratio.
        if (imageWidth.value > imageHeight.value) {
            width *= imageWidth.value / imageHeight.value;
        } else {
            height *= imageHeight.value / imageWidth.value;
        }

        return {height, width};
    }, [imageContainerSize, scale]);

    /**
     * Validates the image's offset to prevent overflow, and update the image's offset.
     *
     * @param {Number} newX
     * @param {Number} newY
    */
    const updateImageOffset = useWorkletCallback((newX, newY) => {
        const {height, width} = getImageDimensions();
        const radius = imageContainerSize / 2;
        const maxX = width - radius;
        const maxY = height - radius;
        translateX.value = clamp(newX, [maxX * -1, maxX]);
        translateY.value = clamp(newY, [maxY * -1, maxY]);
    }, [imageContainerSize, scale, clamp]);

    /**
     * Calculates new x & y image translate value on image panning
     * and updates image's offset.
    */
    const panGestureEvent = useAnimatedGestureHandler({
        onStart: (_, context) => {
            // we have to assign translate values to a context,
            // since that is required for proper work of turbo modules
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
    }, [imageContainerSize, updateImageOffset]);

    /**
     * Calculates new scale value and updates image's offset to ensure
     * that image stays in the center of container after changing scale
    */
    const panSliderGestureEvent = useAnimatedGestureHandler({
        onStart: (_, context) => {
            // we have to assign this value to a context,
            // since that is required for proper work of turbo modules
            // eslint-disable-next-line no-param-reassign
            context.translateSliderX = translateSlider.value;
        },
        onActive: (event, context) => {
            const newSliderValue = clamp(event.translationX + context.translateSliderX, [0, sliderLineWidth]);
            const newScale = ((newSliderValue / imageContainerSize) * 10) + 1;
            scale.value = newScale;
            translateSlider.value = newSliderValue;

            const change = newScale / scale.value;
            const newX = translateX.value * change;
            const newY = translateY.value * change;
            updateImageOffset(newX, newY);
        },
    }, [imageContainerSize, clamp]);

    const imageStyle = useAnimatedStyle(() => {
        const height = imageHeight.value;
        const width = imageWidth.value;
        const aspectRatio = height > width ? height / width : width / height;
        const rotate = clamp(rotation.value, [0, 360]);
        return {
            transform: [
                {translateX: translateX.value},
                {translateY: translateY.value},
                {scale: scale.value * aspectRatio},
                {rotate: `${rotate}deg`},
            ],
        };
    }, [imageHeight.value, imageWidth.value, clamp]);

    const handleRotate = useCallback(() => {
        rotation.value -= 90;

        // Rotating 2d coordinates applying formula (x, y) → (-y, x).
        [translateX.value, translateY.value] = [translateY.value, translateX.value * -1];

        // Since we rotated image by 90 degrees, now width becomes height and vice versa.
        [imageHeight.value, imageWidth.value] = [
            imageWidth.value,
            imageHeight.value,
        ];
    }, []);

    const handleCrop = useCallback(() => {
        const smallerSize = Math.min(imageHeight.value, imageWidth.value);
        const size = smallerSize / scale.value;
        const centerX = imageWidth.value / 2;
        const centerY = imageHeight.value / 2;
        const radius = size / 2;

        // Since translate value is only a distance from image center, we are able to calculate
        // originX and originY - start coordinates of cropping.
        const originX = centerX - radius - ((translateX.value / imageContainerSize / scale.value) * smallerSize);
        const originY = centerY - radius - ((translateY.value / imageContainerSize / scale.value) * smallerSize);

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
