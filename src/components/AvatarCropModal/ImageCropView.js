import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import {PanGestureHandler} from 'react-native-gesture-handler';
import Animated, {interpolate, useAnimatedStyle} from 'react-native-reanimated';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import ControlSelection from '@libs/ControlSelection';
import * as StyleUtils from '@styles/StyleUtils';
import useThemeStyles from '@styles/useThemeStyles';
import gestureHandlerPropTypes from './gestureHandlerPropTypes';

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

    /** Image crop vector mask */
    maskImage: PropTypes.func,
};

const defaultProps = {
    imageUri: '',
    containerSize: 0,
    panGestureEventHandler: () => {},
    maskImage: Expensicons.ImageCropCircleMask,
};

function ImageCropView(props) {
    const styles = useThemeStyles();
    const containerStyle = StyleUtils.getWidthAndHeightStyle(props.containerSize, props.containerSize);

    const originalImageHeight = props.originalImageHeight;
    const originalImageWidth = props.originalImageWidth;
    const rotation = props.rotation;
    const translateX = props.translateX;
    const translateY = props.translateY;
    const scale = props.scale;

    // A reanimated memoized style, which updates when the image's size or scale changes.
    const imageStyle = useAnimatedStyle(() => {
        const height = originalImageHeight.value;
        const width = originalImageWidth.value;
        const aspectRatio = height > width ? height / width : width / height;
        const rotate = interpolate(rotation.value, [0, 360], [0, 360]);
        return {
            transform: [{translateX: translateX.value}, {translateY: translateY.value}, {scale: scale.value * aspectRatio}, {rotate: `${rotate}deg`}],
        };
    }, [originalImageHeight, originalImageWidth, rotation, translateX, translateY, scale]);

    // We're preventing text selection with ControlSelection.blockElement to prevent safari
    // default behaviour of cursor - I-beam cursor on drag. See https://github.com/Expensify/App/issues/13688
    return (
        <PanGestureHandler onGestureEvent={props.panGestureEventHandler}>
            <Animated.View
                ref={ControlSelection.blockElement}
                style={[containerStyle, styles.imageCropContainer]}
            >
                <Animated.Image
                    style={[imageStyle, styles.h100, styles.w100]}
                    source={{uri: props.imageUri}}
                    resizeMode="contain"
                />
                <View style={[containerStyle, styles.l0, styles.b0, styles.pAbsolute]}>
                    <Icon
                        src={props.maskImage}
                        width={props.containerSize}
                        height={props.containerSize}
                    />
                </View>
            </Animated.View>
        </PanGestureHandler>
    );
}

ImageCropView.displayName = 'ImageCropView';
ImageCropView.propTypes = propTypes;
ImageCropView.defaultProps = defaultProps;

// React.memo is needed here to prevent styles recompilation
// which sometimes may cause glitches during rerender of the modal
export default React.memo(ImageCropView);
