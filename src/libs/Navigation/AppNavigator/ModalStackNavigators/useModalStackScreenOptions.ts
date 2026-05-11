import type {ParamListBase} from '@react-navigation/native';
import {CardStyleInterpolators} from '@react-navigation/stack';
import type {StackCardStyleInterpolator} from '@react-navigation/stack';
import {useCallback} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {useWideRHPState} from '@components/WideRHPContextProvider';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import hideKeyboardOnSwipe from '@libs/Navigation/AppNavigator/hideKeyboardOnSwipe';
import type {PlatformStackNavigationOptions, PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';

// Web-only: render the destination card with no slide, but keep the wide/super-wide positional offsets that the
// previous slide interpolator used to merge in via `enhanceCardStyleInterpolator`.
const noAnimationWithCardStyle =
    (cardStyle: StyleProp<ViewStyle>): StackCardStyleInterpolator =>
    () => ({cardStyle: cardStyle as ViewStyle});

function useWideModalStackScreenOptions() {
    const styles = useThemeStyles();

    // We have to use isSmallScreenWidth, otherwise the content of RHP 'jumps' on Safari - its width is set to size of screen and only after rerender it is set to the correct value
    // It works as intended on other browsers
    // https://github.com/Expensify/App/issues/63747
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {wideRHPRouteKeys, superWideRHPRouteKeys} = useWideRHPState();

    return useCallback<({route}: {route: PlatformStackRouteProp<ParamListBase, string>}) => PlatformStackNavigationOptions>(
        ({route}) => {
            let cardStyleInterpolator: StackCardStyleInterpolator = CardStyleInterpolators.forNoAnimation;

            if (!isSmallScreenWidth) {
                if (superWideRHPRouteKeys.includes(route.key)) {
                    cardStyleInterpolator = noAnimationWithCardStyle(styles.superWideRHPExtendedCardInterpolatorStyles);
                } else if (wideRHPRouteKeys.includes(route.key)) {
                    cardStyleInterpolator = noAnimationWithCardStyle(styles.wideRHPExtendedCardInterpolatorStyles);
                    // single RHPs displayed above the wide RHP need to be positioned
                } else if (superWideRHPRouteKeys.length > 0 || wideRHPRouteKeys.length > 0) {
                    cardStyleInterpolator = noAnimationWithCardStyle(styles.singleRHPExtendedCardInterpolatorStyles);
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
