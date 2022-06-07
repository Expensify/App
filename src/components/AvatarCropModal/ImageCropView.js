import PropTypes from 'prop-types';
import React from 'react';
import {Image, View} from 'react-native';
import {PanGestureHandler} from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import styles from '../../styles/styles';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import * as StyleUtils from '../../styles/StyleUtils';
import gestureHandlerPropTypes from './gestureHandlerPropTypes';

const AnimatedImage = Animated.createAnimatedComponent(Image);

const propTypes = {
    /** Link to image for cropping   */
    imageUri: PropTypes.string,

    /** Size of the image container that will be rendered */
    containerSize: PropTypes.number,

    /** Styles for image component */
    imageStyle: PropTypes.arrayOf(PropTypes.object),

    /** Callback to execute when the Image lays out */
    onLayout: PropTypes.func,

    /** React-native-reanimated lib handler which executes when the user is panning image */
    panGestureEventHandler: gestureHandlerPropTypes,
};

const defaultProps = {
    imageUri: '',
    containerSize: 0,
    imageStyle: null,
    onLayout: () => {},
    panGestureEventHandler: () => {},
};

const ImageCropView = (props) => {
    const containerStyle = StyleUtils.getImageCropViewStyle(props.containerSize);
    return (
        <PanGestureHandler onGestureEvent={props.panGestureEventHandler}>
            <Animated.View>
                <View style={[containerStyle, styles.imageCropContainer]}>
                    <AnimatedImage style={props.imageStyle} onLayout={props.onLayout} source={{uri: props.imageUri}} resizeMode="contain" />
                    <View style={[containerStyle, styles.l0, styles.b0, styles.pAbsolute]}>
                        <Icon src={Expensicons.ImageCropMask} width={props.containerSize} height={props.containerSize} />
                    </View>
                </View>
            </Animated.View>
        </PanGestureHandler>
    );
};

ImageCropView.displayName = 'ImageCropView';
ImageCropView.propTypes = propTypes;
ImageCropView.defaultProps = defaultProps;
export default ImageCropView;
