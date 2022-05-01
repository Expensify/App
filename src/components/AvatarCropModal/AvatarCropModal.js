import PropTypes from 'prop-types';
import React, {memo, useCallback, useEffect} from 'react';
import {Image, Pressable, View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {
    interpolate,
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
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

    const panGestureEvent = useAnimatedGestureHandler({
        onStart: (_, context) => {
            // eslint-disable-next-line no-param-reassign
            context.translateX = translateX.value;
            // eslint-disable-next-line no-param-reassign
            context.translateY = translateY.value;
        },
        onActive: (event, context) => {
            let heightRatio = 1.0;
            let widthRation = 1.0;
            if (imageWidth.value > imageHeight.value) {
                heightRatio = imageWidth.value / imageHeight.value;
            } else {
                widthRation = imageHeight.value / imageWidth.value;
            }

            const radius = imageContainerSize / 2;
            const realImageHeight = radius * scale.value * widthRation;
            const realImageWidth = radius * scale.value * heightRatio;

            const maxX = realImageWidth - radius;
            const minX = (realImageWidth - radius) * -1;
            const maxY = realImageHeight - radius;
            const minY = (realImageHeight - radius) * -1;

            const newX = event.translationX + context.translateX;
            const newY = event.translationY + context.translateY;
            translateX.value = interpolate(newX, [minX, maxX], [minX, maxX], 'clamp');
            translateY.value = interpolate(newY, [minY, maxY], [minY, maxY], 'clamp');
        },
    });

    const panSliderGestureEvent = useAnimatedGestureHandler({
        onStart: (_, context) => {
            // eslint-disable-next-line no-param-reassign
            context.translateSliderX = translateSlider.value;
        },
        onActive: (event, context) => {
            const maxScale = sliderLineWidth;
            const minScale = 0;

            let newSlider = event.translationX + context.translateSliderX;
            if (newSlider > maxScale) {
                newSlider = maxScale;
            } else if (newSlider < minScale) {
                newSlider = minScale;
            }

            const newScale = ((newSlider / imageContainerSize) * 10) + 1;
            const change = newScale / scale.value;
            const newX = translateX.value * change;
            const newY = translateY.value * change;

            scale.value = newScale;
            translateSlider.value = newSlider;

            let heightRatio = 1.0;
            let widthRatio = 1.0;
            if (imageWidth.value > imageHeight.value) {
                heightRatio = imageWidth.value / imageHeight.value;
            } else {
                widthRatio = imageHeight.value / imageWidth.value;
            }

            const radius = imageContainerSize / 2;
            const realImageHeight = radius * scale.value * widthRatio;
            const realImageWidth = radius * scale.value * heightRatio;

            const maxX = realImageWidth - radius;
            const minX = (realImageWidth - radius) * -1;
            const maxY = realImageHeight - radius;
            const minY = (realImageHeight - radius) * -1;

            translateX.value = interpolate(newX, [minX, maxX], [minX, maxX], 'clamp');
            translateY.value = interpolate(newY, [minY, maxY], [minY, maxY], 'clamp');
        },
    });

    const imageStyle = useAnimatedStyle(() => {
        const height = imageHeight.value;
        const width = imageWidth.value;
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
    }, [imageHeight.value, imageWidth.value]);

    const handleRotate = useCallback(() => {
        rotation.value -= 90;
        [translateX.value, translateY.value] = [translateY.value, translateX.value * -1];
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
