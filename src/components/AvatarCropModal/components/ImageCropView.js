import {Image, View} from 'react-native';
import React from 'react';
import PropTypes from 'prop-types';
import {PanGestureHandler} from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import Icon from '../../Icon';
import * as Expensicons from '../../Icon/Expensicons';
import styles from '../../../styles/styles';

const AnimatedImage = Animated.createAnimatedComponent(Image);

const propTypes = {
    /** Link to image for cropping   */
    imageUri: PropTypes.string,

    /** Size of the image container that will be rendered */
    containerSize: PropTypes.number,

    /** Callback to be called when user crops image */
    style: PropTypes.arrayOf(PropTypes.object),

    /** Callback to execute when the Image lays out */
    onLayout: PropTypes.func,

    /** Callback to execute when user panning image */
    panGestureEvent: PropTypes.func,
};

const defaultProps = {
    imageUri: '',
    containerSize: 0,
    style: null,
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
                <AnimatedImage style={props.style} onLayout={props.onLayout} source={{uri: props.imageUri}} resizeMode="contain" />
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
