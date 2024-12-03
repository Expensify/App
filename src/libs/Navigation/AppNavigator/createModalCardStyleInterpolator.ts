import type {StackCardInterpolatedStyle, StackCardInterpolationProps} from '@react-navigation/stack';
import {Animated} from 'react-native';
import type {StyleUtilsType} from '@styles/utils';
import variables from '@styles/variables';

type ModalCardStyleInterpolator = (
    isSmallScreenWidth: boolean,
    isFullScreenModal: boolean,
    shouldUseNarrowLayout: boolean,
    stackCardInterpolationProps: StackCardInterpolationProps,
    outputRangeMultiplier?: number,
) => StackCardInterpolatedStyle;
type CreateModalCardStyleInterpolator = (StyleUtils: StyleUtilsType) => ModalCardStyleInterpolator;

const createModalCardStyleInterpolator: CreateModalCardStyleInterpolator =
    (StyleUtils) =>
    (isSmallScreenWidth, isFullScreenModal, shouldUseNarrowLayout, {current: {progress}, inverted, layouts: {screen}}, outputRangeMultiplier = 1) => {
        if (shouldUseNarrowLayout) {
            return {
                cardStyle: {
                    opacity: progress,
                },
            };
        }

        const translateX = Animated.multiply(
            progress.interpolate({
                inputRange: [0, 1],
                outputRange: [outputRangeMultiplier * (isSmallScreenWidth ? screen.width : variables.sideBarWidth), 0],
                extrapolate: 'clamp',
            }),
            inverted,
        );

        const cardStyle = StyleUtils.getCardStyles(screen.width);

        if (!isFullScreenModal || isSmallScreenWidth) {
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
