import type {Animated} from 'react-native';
import type GetBackgroudColor from './types';

const getBackgroundColor: GetBackgroudColor = ({routesLength, tabIndex, affectedTabs, theme, position, isActive}) => {
    if (routesLength > 1) {
        const inputRange = Array.from({length: routesLength}, (v, i) => i);

        if (position) {
            return position.interpolate({
                inputRange,
                outputRange: inputRange.map((i) => {
                    return affectedTabs.includes(tabIndex) && i === tabIndex ? theme.border : theme.appBG;
                }),
            }) as unknown as Animated.AnimatedInterpolation<string>;
        }

        return affectedTabs.includes(tabIndex) && isActive ? theme.border : theme.appBG;
    }
    return theme.border;
};

export default getBackgroundColor;
