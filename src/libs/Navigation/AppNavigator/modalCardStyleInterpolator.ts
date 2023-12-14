import type {StackCardInterpolatedStyle, StackCardInterpolationProps} from '@react-navigation/stack';
import {Animated} from 'react-native';
import getCardStyles from '@styles/utils/cardStyles';
import variables from '@styles/variables';

export default (shouldUseNarrowLayout: boolean, isFullScreenModal: boolean, {current: {progress}, inverted, layouts: {screen}}: StackCardInterpolationProps): StackCardInterpolatedStyle => {
    const translateX = Animated.multiply(
        progress.interpolate({
            inputRange: [0, 1],
            outputRange: [shouldUseNarrowLayout ? screen.width : variables.sideBarWidth, 0],
            extrapolate: 'clamp',
        }),
        inverted,
    );

    const cardStyle = getCardStyles(screen.width);

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
