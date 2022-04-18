import {Animated} from 'react-native';
import variables from '../../../styles/variables';
import getCardStyles from '../../../styles/cardStyles';

export default (
    isSmallScreenWidth,
    isFullScreenModal,
    {
        current: {progress},
        inverted,
        layouts: {
            screen,
        },
    },
) => {
    const translateX = Animated.multiply(progress.interpolate({
        inputRange: [0, 1],
        outputRange: [isSmallScreenWidth ? screen.width : variables.sideBarWidth, 0],
        extrapolate: 'clamp',
    }), inverted);

    const opacity = Animated.multiply(progress, inverted);
    const cardStyle = getCardStyles(isSmallScreenWidth, screen.width);

    if (isFullScreenModal && !isSmallScreenWidth) {
        cardStyle.opacity = opacity;
    } else {
        cardStyle.transform = [{translateX}];
    }

    return ({
        containerStyle: {
            overflow: 'hidden',
        },
        cardStyle,
        overlayStyle: {
            opacity: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.3],
                extrapolate: 'clamp',
            }),
        },
    });
};
