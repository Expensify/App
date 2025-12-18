import type {ParamListBase} from '@react-navigation/native';
import {CardStyleInterpolators} from '@react-navigation/stack';
import {useCallback, useContext} from 'react';
import {WideRHPContext} from '@components/WideRHPContextProvider';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import enhanceCardStyleInterpolator from '@libs/Navigation/AppNavigator/enhanceCardStyleInterpolator';
import hideKeyboardOnSwipe from '@libs/Navigation/AppNavigator/hideKeyboardOnSwipe';
import type {PlatformStackNavigationOptions, PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';

function useWideModalStackScreenOptions() {
    const styles = useThemeStyles();

    // We have to use isSmallScreenWidth, otherwise the content of RHP 'jumps' on Safari - its width is set to size of screen and only after rerender it is set to the correct value
    // It works as intended on other browsers
    // https://github.com/Expensify/App/issues/63747
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {wideRHPRouteKeys, superWideRHPRouteKeys} = useContext(WideRHPContext);

    return useCallback<({route}: {route: PlatformStackRouteProp<ParamListBase, string>}) => PlatformStackNavigationOptions>(
        ({route}) => {
            let cardStyleInterpolator = CardStyleInterpolators.forHorizontalIOS;

            if (!isSmallScreenWidth) {
                if (superWideRHPRouteKeys.includes(route.key)) {
                    cardStyleInterpolator = enhanceCardStyleInterpolator(CardStyleInterpolators.forHorizontalIOS, {
                        cardStyle: styles.superWideRHPExtendedCardInterpolatorStyles,
                    });
                } else if (wideRHPRouteKeys.includes(route.key)) {
                    cardStyleInterpolator = enhanceCardStyleInterpolator(CardStyleInterpolators.forHorizontalIOS, {
                        cardStyle: styles.wideRHPExtendedCardInterpolatorStyles,
                    });
                    // single RHPs displayed above the wide RHP need to be positioned
                } else if (superWideRHPRouteKeys.length > 0 || wideRHPRouteKeys.length > 0) {
                    cardStyleInterpolator = enhanceCardStyleInterpolator(CardStyleInterpolators.forHorizontalIOS, {
                        cardStyle: styles.singleRHPExtendedCardInterpolatorStyles,
                    });
                }
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

export default useWideModalStackScreenOptions;
