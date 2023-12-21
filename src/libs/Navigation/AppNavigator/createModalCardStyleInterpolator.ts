import type {StackCardInterpolatedStyle, StackCardInterpolationProps} from '@react-navigation/stack';
import {Animated} from 'react-native';
import {StyleUtilsType} from '@styles/utils';
import variables from '@styles/variables';

type ModalCardStyleInterpolator = (
    isSmallScreenWidth: boolean,
    isFullScreenModal: boolean,
    {
        current: {progress},
        inverted,
        layouts: {screen},
    }: StackCardInterpolationProps,
) => StackCardInterpolatedStyle;
type CreateModalCardStyleInterpolator = (StyleUtils: StyleUtilsType) => ModalCardStyleInterpolator;

const createModalCardStyleInterpolator: CreateModalCardStyleInterpolator =
    (StyleUtils) =>
    (isSmallScreenWidth, isFullScreenModal, {current: {progress}, inverted, layouts: {screen}}) => {
        const translateX = Animated.multiply(
            progress.interpolate({
                inputRange: [0, 1],
                outputRange: [isSmallScreenWidth ? screen.width : variables.sideBarWidth, 0],
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
