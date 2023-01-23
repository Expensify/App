import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import {PanGestureHandler} from 'react-native-gesture-handler';
import Animated, {interpolate, useAnimatedStyle} from 'react-native-reanimated';
import styles from '../../styles/styles';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import * as StyleUtils from '../../styles/StyleUtils';
import gestureHandlerPropTypes from './gestureHandlerPropTypes';
import ControlSelection from '../../libs/ControlSelection';

const propTypes = {
    /** Link to image for cropping   */
    imageUri: PropTypes.string,

    /** Size of the image container that will be rendered */
    containerSize: PropTypes.number,

    /** The height of the selected image */
    originalImageHeight: PropTypes.shape({value: PropTypes.number}).isRequired,

    /** The width of the selected image */
    originalImageWidth: PropTypes.shape({value: PropTypes.number}).isRequired,

    /** The rotation value of the selected image */
    rotation: PropTypes.shape({value: PropTypes.number}).isRequired,

    /** The relative image shift along X-axis */
    translateX: PropTypes.shape({value: PropTypes.number}).isRequired,

    /** The relative image shift along Y-axis */
    translateY: PropTypes.shape({value: PropTypes.number}).isRequired,

    /** The scale factor of the image */
    scale: PropTypes.shape({value: PropTypes.number}).isRequired,

    /** React-native-reanimated lib handler which executes when the user is panning image */
    panGestureEventHandler: gestureHandlerPropTypes,
};

const defaultProps = {
    imageUri: '',
    containerSize: 0,
    panGestureEventHandler: () => {},
};

const ImageCropView = (props) => {
    const containerStyle = StyleUtils.getWidthAndHeightStyle(props.containerSize, props.containerSize);

    // A reanimated memoized style, which updates when the image's size or scale changes.
    const imageStyle = useAnimatedStyle(() => {
        const height = props.originalImageHeight.value;
        const width = props.originalImageWidth.value;
        const aspectRatio = height > width ? height / width : width / height;
        const rotate = interpolate(props.rotation.value, [0, 360], [0, 360]);
        return {
            transform: [
                {translateX: props.translateX.value},
                {translateY: props.translateY.value},
                {scale: props.scale.value * aspectRatio},
                {rotate: `${rotate}deg`},
            ],
        };
    }, [props.originalImageHeight, props.originalImageWidth]);

    // We're preventing text selection with ControlSelection.blockElement to prevent safari
    // default behaviour of cursor - I-beam cursor on drag. See https://github.com/Expensify/App/issues/13688
    return (
        <PanGestureHandler onGestureEvent={props.panGestureEventHandler}>
            <Animated.View ref={ControlSelection.blockElement} style={[containerStyle, styles.imageCropContainer]}>
                <Animated.Image style={[imageStyle, styles.h100, styles.w100]} source={{uri: props.imageUri}} resizeMode="contain" />
                <View style={[containerStyle, styles.l0, styles.b0, styles.pAbsolute]}>
                    <Icon src={Expensicons.ImageCropMask} width={props.containerSize} height={props.containerSize} />
                </View>
            </Animated.View>
        </PanGestureHandler>
    );
};

ImageCropView.displayName = 'ImageCropView';
ImageCropView.propTypes = propTypes;
ImageCropView.defaultProps = defaultProps;

// React.memo is needed here to prevent styles recompilation
// which sometimes may cause glitches during rerender of the modal
export default React.memo(ImageCropView);
