import {Animated} from 'react-native';
import variables from '../../../styles/variables';

export default (
    isSmallScreen,
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
        outputRange: [isSmallScreen ? screen.width : variables.sideBarWidth, 0],
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
