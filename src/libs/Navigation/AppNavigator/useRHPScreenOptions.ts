import {CardStyleInterpolators} from '@react-navigation/stack';
import {useMemo} from 'react';
import useThemeStyles from '@hooks/useThemeStyles';
import {isSafari} from '@libs/Browser';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types/NavigationOptions';
import useModalCardStyleInterpolator from './useModalCardStyleInterpolator';

const useRHPScreenOptions = (): PlatformStackNavigationOptions => {
    const styles = useThemeStyles();
    const customInterpolator = useModalCardStyleInterpolator();

    return useMemo<PlatformStackNavigationOptions>(() => {
        return {
            headerShown: false,
            animation: Animations.SLIDE_FROM_RIGHT,
            gestureDirection: 'horizontal',
            web: {
                cardStyle: styles.navigationScreenCardStyle,

                // The .forHorizontalIOS interpolator from `@react-navigation` is misbehaving on Safari, so we override it with Expensify custom interpolator
                cardStyleInterpolator: isSafari() ? (props) => customInterpolator({props}) : CardStyleInterpolators.forHorizontalIOS,
                gestureDirection: 'horizontal',
            },
        };
    }, [customInterpolator, styles.navigationScreenCardStyle]);
};

export default useRHPScreenOptions;
