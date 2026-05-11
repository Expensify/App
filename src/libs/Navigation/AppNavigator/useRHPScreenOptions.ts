import {CardStyleInterpolators} from '@react-navigation/stack';
import {useMemo} from 'react';
import useThemeStyles from '@hooks/useThemeStyles';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import Presentation from '@libs/Navigation/PlatformStackNavigation/navigationOptions/presentation';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types/NavigationOptions';

const useRHPScreenOptions = (): PlatformStackNavigationOptions => {
    const styles = useThemeStyles();

    return useMemo<PlatformStackNavigationOptions>(() => {
        return {
            headerShown: false,
            animation: Animations.SLIDE_FROM_RIGHT,
            gestureDirection: 'horizontal',
            web: {
                cardStyleInterpolator: CardStyleInterpolators.forNoAnimation,
                presentation: Presentation.TRANSPARENT_MODAL,
                cardOverlayEnabled: false,
                cardStyle: styles.navigationScreenCardStyle,
                gestureDirection: 'horizontal',
            },
        };
    }, [styles.navigationScreenCardStyle]);
};

export default useRHPScreenOptions;
