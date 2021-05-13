import {Animated} from 'react-native';

export default ({
    current: {progress},
    inverted,
    layouts: {
        screen,
    },
}) => {
    const translateX = Animated.multiply(progress.interpolate({
        inputRange: [0, 1],
        outputRange: [screen.width, 0],
        extrapolate: 'clamp',
    }), inverted);

    return ({
        containerStyle: {
            overflow: 'hidden',
        },
        cardStyle: {
            transform: [{translateX}],
        },
        overlayStyle: {
            opacity: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.3],
                extrapolate: 'clamp',
            }),
        },
    });
};
