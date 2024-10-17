import type {Animated} from 'react-native';
import type GetBackgroudColor from './types';

const getBackgroundColor: GetBackgroudColor = ({routesLength, tabIndex, affectedTabs, theme, position}) => {
    if (routesLength > 1) {
        const inputRange = Array.from({length: routesLength}, (v, i) => i);
        return position?.interpolate({
            inputRange,
            outputRange: inputRange.map((i) => {
                return affectedTabs.includes(tabIndex) && i === tabIndex ? theme.border : theme.appBG;
            }),
        }) as unknown as Animated.AnimatedInterpolation<string>;
    }
    return theme.border;
};

export default getBackgroundColor;
