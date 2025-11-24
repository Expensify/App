import React from 'react';
import {View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import type {PanGesture} from 'react-native-gesture-handler';
import Animated, {interpolate, useAnimatedStyle} from 'react-native-reanimated';
import type {SharedValue} from 'react-native-reanimated';
import Icon from '@components/Icon';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import ControlSelection from '@libs/ControlSelection';
import type IconAsset from '@src/types/utils/IconAsset';

type ImageCropViewProps = {
    /** Link to image for cropping   */
    imageUri?: string;

    /** Size of the image container that will be rendered */
    containerSize?: number;

    /** The height of the selected image */
    originalImageHeight: SharedValue<number>;

    /** The width of the selected image */
    originalImageWidth: SharedValue<number>;

    /** The rotation value of the selected image */
    rotation: SharedValue<number>;

    /** The relative image shift along X-axis */
    translateX: SharedValue<number>;

    /** The relative image shift along Y-axis */
    translateY: SharedValue<number>;

    /** The scale factor of the image */
    scale: SharedValue<number>;

    /** Configuration object for pan gesture for handling image panning */
    panGesture?: PanGesture;

    /** Image crop vector mask */
    maskImage?: IconAsset;
};

function ImageCropView({imageUri = '', containerSize = 0, panGesture = Gesture.Pan(), maskImage, ...props}: ImageCropViewProps) {
    const icons = useMemoizedLazyExpensifyIcons(['ImageCropCircleMask'] as const);
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
        'worklet';

        const height = originalImageHeight.get();
        const width = originalImageWidth.get();
        const aspectRatio = height > width ? height / width : width / height;
        const rotate = interpolate(rotation.get(), [0, 360], [0, 360]);
        return {
            transform: [{translateX: translateX.get()}, {translateY: translateY.get()}, {scale: scale.get() * aspectRatio}, {rotate: `${rotate}deg`}],
        };
    }, [originalImageHeight, originalImageWidth, rotation, translateX, translateY, scale]);

    // We're preventing text selection with ControlSelection.blockElement to prevent safari
    // default behaviour of cursor - I-beam cursor on drag. See https://github.com/Expensify/App/issues/13688
    return (
        <GestureDetector gesture={panGesture}>
            <Animated.View
                ref={(el) => ControlSelection.blockElement(el as HTMLElement | null)}
                style={[containerStyle, styles.imageCropContainer]}
            >
                <Animated.Image
                    style={[imageStyle, styles.h100, styles.w100]}
                    source={{uri: imageUri}}
                    resizeMode="contain"
                />
                <View style={[containerStyle, styles.l0, styles.b0, styles.pAbsolute]}>
                    <Icon
                        src={maskImage ?? icons.ImageCropCircleMask}
                        // TODO uncomment the line once the tint color issue for android(https://github.com/expo/expo/issues/21530#issuecomment-1836283564) is fixed
                        // fill={theme.iconReversed}
                        width={containerSize}
                        height={containerSize}
                        key={containerSize}
                    />
                </View>
            </Animated.View>
        </GestureDetector>
    );
}

ImageCropView.displayName = 'ImageCropView';

// React.memo is needed here to prevent styles recompilation
// which sometimes may cause glitches during rerender of the modal
export default React.memo(ImageCropView);
