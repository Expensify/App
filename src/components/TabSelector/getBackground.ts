// eslint-disable-next-line no-restricted-imports
import type {Animated} from 'react-native';

import type {BackgroundColor, GetBackgroundColorConfig} from './types';

function getBackgroundColor({routesLength, tabIndex, affectedTabs, theme, position, isActive}: GetBackgroundColorConfig): BackgroundColor {
    // High contrast keeps the stronger prior active-tab color (theme.border resolves to product500 there) instead of the lighter product300
    const activeBackgroundColor = theme.isHighContrast ? theme.border : theme.navItemSelectedBG;

    if (routesLength > 1) {
        const inputRange = Array.from({length: routesLength}, (_, i) => i);

        if (position) {
            return position.interpolate({
                inputRange,
                outputRange: inputRange.map((i) => {
                    return affectedTabs.includes(tabIndex) && i === tabIndex ? activeBackgroundColor : theme.appBG;
                }),
            }) as unknown as Animated.AnimatedInterpolation<string>;
        }

        return affectedTabs.includes(tabIndex) && isActive ? activeBackgroundColor : theme.appBG;
    }

    return activeBackgroundColor;
}

export default getBackgroundColor;
