import {Animated} from 'react-native';
import getCardStyles from '@styles/cardStyles';
import variables from '@styles/variables';

export default (shouldUseNarrowLayout, isFullScreenModal, {current: {progress}, inverted, layouts: {screen}}) => {
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
