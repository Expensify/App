/* eslint-disable react/prop-types */
import {Image, View} from 'react-native';
import React from 'react';
import {PanGestureHandler} from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import Icon from '../../Icon';
import * as Expensicons from '../../Icon/Expensicons';
import styles from '../../../styles/styles';

const AnimatedImage = Animated.createAnimatedComponent(Image);

// const propTypes = {
//     panGestureEvent: PropTypes.func.isRequired,
//     source: PropTypes.func.isRequired,
//     onLayout: PropTypes.func,
//     style: PropTypes.func.isRequired,
// };

// const defaultProps = {
// };

const ImageCropView = props => (
    <PanGestureHandler onGestureEvent={props.panGestureEvent}>
        <Animated.View>
            <View style={[{
                height: props.containerSize,
                width: props.containerSize,
            }, styles.imageCropContainer]}
            >
                <AnimatedImage style={props.style} onLayout={props.onLayout} source={props.source} resizeMode="contain" />
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

// ImageCropView.propTypes = propTypes;
// ImageCropView.defaultProps = defaultProps;
// ImageCropView.displayName = 'ImageCropView';
export default ImageCropView;
