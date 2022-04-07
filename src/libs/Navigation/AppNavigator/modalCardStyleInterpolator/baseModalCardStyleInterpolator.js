import {Animated} from 'react-native';
import variables from '../../../../styles/variables';

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
    cardStyle,
) => {
    const translateX = Animated.multiply(progress.interpolate({
        inputRange: [0, 1],
        outputRange: [isSmallScreenWidth ? screen.width : variables.sideBarWidth, 0],
        extrapolate: 'clamp',
    }), inverted);

    const opacity = Animated.multiply(progress, inverted);
    const newCardStyle = cardStyle;

    if (isFullScreenModal && !isSmallScreenWidth) {
        newCardStyle.opacity = opacity;
    } else {
        newCardStyle.transform = [{translateX}];
    }

    return ({
        containerStyle: {
            overflow: 'hidden',
        },
        cardStyle: newCardStyle,
        overlayStyle: {
            opacity: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.3],
                extrapolate: 'clamp',
            }),
        },
    });
};
