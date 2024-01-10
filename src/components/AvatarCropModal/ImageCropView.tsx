import React from 'react';
import {View} from 'react-native';
import {PanGestureHandler} from 'react-native-gesture-handler';
import type {GestureEvent, PanGestureHandlerEventPayload} from 'react-native-gesture-handler';
import Animated, {interpolate, useAnimatedStyle} from 'react-native-reanimated';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import ControlSelection from '@libs/ControlSelection';
import {SelectionElement} from '@libs/ControlSelection/types';
import type IconAsset from '@src/types/utils/IconAsset';

type ImageCropViewProps = {
    /** Link to image for cropping   */
    imageUri: string;

    /** Size of the image container that will be rendered */
    containerSize: number;

    /** The height of the selected image */
    originalImageHeight: {
        value: number;
    };

    /** The width of the selected image */
    originalImageWidth: {
        value: number;
    };

    /** The rotation value of the selected image */
    rotation: {
        value: number;
    };

    /** The relative image shift along X-axis */
    translateX: {
        value: number;
    };

    /** The relative image shift along Y-axis */
    translateY: {
        value: number;
    };

    /** The scale factor of the image */
    scale: {
        value: number;
    };

    /** React-native-reanimated lib handler which executes when the user is panning image */
    panGestureEventHandler: (event: GestureEvent<PanGestureHandlerEventPayload>) => void;

    /** Image crop vector mask */
    maskImage?: IconAsset;
};

function ImageCropView({imageUri = '', containerSize = 0, panGestureEventHandler = () => {}, maskImage = Expensicons.ImageCropCircleMask, ...props}: ImageCropViewProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const containerStyle = StyleUtils.getWidthAndHeightStyle(containerSize, containerSize);

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
        <PanGestureHandler onGestureEvent={panGestureEventHandler}>
            <Animated.View
                ref={(el) => {
                    ControlSelection.blockElement<View>(el as SelectionElement<View>);
                }}
                style={[containerStyle, styles.imageCropContainer]}
            >
                <Animated.Image
                    style={[imageStyle, styles.h100, styles.w100]}
                    source={{uri: imageUri}}
                    resizeMode="contain"
                />
                <View style={[containerStyle, styles.l0, styles.b0, styles.pAbsolute]}>
                    <Icon
                        src={maskImage}
                        fill={theme.iconReversed}
                        width={containerSize}
                        height={containerSize}
                    />
                </View>
            </Animated.View>
        </PanGestureHandler>
    );
}

ImageCropView.displayName = 'ImageCropView';

// React.memo is needed here to prevent styles recompilation
// which sometimes may cause glitches during rerender of the modal
export default React.memo(ImageCropView);
