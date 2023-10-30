import {Animated} from 'react-native';
import variables from '../../../styles/variables';
import getCardStyles from '../../../styles/cardStyles';

export default (isSmallScreenWidth, isFullScreenModal, {current: {progress}, inverted, layouts: {screen}}) => {
    const translateX = Animated.multiply(
        progress.interpolate({
            inputRange: [0, 1],
            outputRange: [isSmallScreenWidth ? screen.width : variables.sideBarWidth, 0],
            extrapolate: 'clamp',
        }),
        inverted,
    );

    const cardStyle = getCardStyles(screen.width);

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
