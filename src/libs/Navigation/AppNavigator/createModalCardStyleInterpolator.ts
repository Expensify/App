import type {StackCardInterpolatedStyle, StackCardInterpolationProps} from '@react-navigation/stack';
import {Animated} from 'react-native';
import type {StyleUtilsType} from '@styles/utils';
import variables from '@styles/variables';

type ModalCardStyleInterpolator = (
    shouldUseNarrowLayout: boolean,
    isFullScreenModal: boolean,
    stackCardInterpolationProps: StackCardInterpolationProps,
    outputRangeMultiplier?: number,
) => StackCardInterpolatedStyle;
type CreateModalCardStyleInterpolator = (StyleUtils: StyleUtilsType) => ModalCardStyleInterpolator;

const createModalCardStyleInterpolator: CreateModalCardStyleInterpolator =
    (StyleUtils) =>
    (shouldUseNarrowLayout, isFullScreenModal, {current: {progress}, inverted, layouts: {screen}}, outputRangeMultiplier = 1) => {
        const translateX = Animated.multiply(
            progress.interpolate({
                inputRange: [0, 1],
                outputRange: [outputRangeMultiplier * (shouldUseNarrowLayout ? screen.width : variables.sideBarWidth), 0],
                extrapolate: 'clamp',
            }),
            inverted,
        );

        const cardStyle = StyleUtils.getCardStyles(screen.width);

        if (!isFullScreenModal || shouldUseNarrowLayout) {
            cardStyle.transform = [{translateX}];
        }

        return {
            containerStyle: {
                overflow: 'hidden',
            },
            cardStyle,
        };
    };

export default createModalCardStyleInterpolator;
