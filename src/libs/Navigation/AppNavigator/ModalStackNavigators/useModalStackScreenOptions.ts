import type {ParamListBase} from '@react-navigation/native';
import {CardStyleInterpolators} from '@react-navigation/stack';
import {useCallback, useContext} from 'react';
import {WideRHPContext} from '@components/WideRHPContextProvider';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import enhanceCardStyleInterpolator from '@libs/Navigation/AppNavigator/enhanceCardStyleInterpolator';
import hideKeyboardOnSwipe from '@libs/Navigation/AppNavigator/hideKeyboardOnSwipe';
import type {PlatformStackNavigationOptions, PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';

function useModalStackScreenOptions() {
    const styles = useThemeStyles();

    // We have to use isSmallScreenWidth, otherwise the content of RHP 'jumps' on Safari - its width is set to size of screen and only after rerender it is set to the correct value
    // It works as intended on other browsers
    // https://github.com/Expensify/App/issues/63747
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {wideRHPRouteKeys, superWideRHPRouteKeys} = useContext(WideRHPContext);

    return useCallback<({route}: {route: PlatformStackRouteProp<ParamListBase, string>}) => PlatformStackNavigationOptions>(
        ({route}) => {
            let cardStyleInterpolator;

            if (superWideRHPRouteKeys.includes(route.key) && !isSmallScreenWidth) {
                cardStyleInterpolator = enhanceCardStyleInterpolator(CardStyleInterpolators.forHorizontalIOS, {
                    cardStyle: styles.superWideRHPExtendedCardInterpolatorStyles,
                });
            } else if (wideRHPRouteKeys.includes(route.key) && !isSmallScreenWidth) {
                // We need to use interpolator styles instead of regular card styles so we can use animated value for width.
                // It is necessary to have responsive width of the wide RHP for range 800px to 840px.
                cardStyleInterpolator = enhanceCardStyleInterpolator(CardStyleInterpolators.forHorizontalIOS, {
                    cardStyle: styles.wideRHPExtendedCardInterpolatorStyles,
                });
            } else {
                cardStyleInterpolator = CardStyleInterpolators.forHorizontalIOS;
            }

            return {
                ...hideKeyboardOnSwipe,
                headerShown: false,
                animationTypeForReplace: 'pop',
                native: {
                    contentStyle: styles.navigationScreenCardStyle,
                },
                web: {
                    cardStyle: styles.navigationScreenCardStyle,
                    cardStyleInterpolator,
                },
            };
        },
        [isSmallScreenWidth, styles, superWideRHPRouteKeys, wideRHPRouteKeys],
    );
}

export default useModalStackScreenOptions;
