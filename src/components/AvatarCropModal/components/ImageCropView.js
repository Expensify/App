import PropTypes from 'prop-types';
import React from 'react';
import {Image, View} from 'react-native';
import {PanGestureHandler} from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import styles from '../../../styles/styles';
import Icon from '../../Icon';
import * as Expensicons from '../../Icon/Expensicons';

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

    /** Callback to execute when user panning image */
    panGestureEvent: PropTypes.func,
};

const defaultProps = {
    imageUri: '',
    containerSize: 0,
    imageStyle: null,
    onLayout: () => { },
    panGestureEvent: () => { },
};

const ImageCropView = props => (
    <PanGestureHandler onGestureEvent={props.panGestureEvent}>
        <Animated.View>
            <View style={[{
                height: props.containerSize,
                width: props.containerSize,
            }, styles.imageCropContainer]}
            >
                <AnimatedImage style={props.imageStyle} onLayout={props.onLayout} source={{uri: props.imageUri}} resizeMode="contain" />
                <View style={[{
                    width: props.containerSize,
                    height: props.containerSize,
                }, styles.l0, styles.b0, styles.pAbsolute]}
                >
                    <Icon src={Expensicons.ImageCropMask} width={props.containerSize} height={props.containerSize} />
                </View>
            </View>
        </Animated.View>
    </PanGestureHandler>

);

ImageCropView.displayName = 'ImageCropView';
ImageCropView.propTypes = propTypes;
ImageCropView.defaultProps = defaultProps;
export default ImageCropView;
