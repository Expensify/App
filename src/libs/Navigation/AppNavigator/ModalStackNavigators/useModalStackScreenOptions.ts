import {animatedSuperWideRHPWidth, useWideRHPState} from '@components/WideRHPContextProvider';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSidePanelState from '@hooks/useSidePanelState';
import useThemeStyles from '@hooks/useThemeStyles';

import enhanceCardStyleInterpolator from '@libs/Navigation/AppNavigator/enhanceCardStyleInterpolator';
import hideKeyboardOnSwipe from '@libs/Navigation/AppNavigator/hideKeyboardOnSwipe';
import RHP_WEB_TRANSITION_SPEC from '@libs/Navigation/AppNavigator/RHPTransitionSpec';
import useModalCardStyleInterpolator from '@libs/Navigation/AppNavigator/useModalCardStyleInterpolator';
import type {PlatformStackNavigationOptions, PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';

import CONST from '@src/CONST';

import type {ParamListBase} from '@react-navigation/native';
import type {StackCardStyleInterpolator} from '@react-navigation/stack';

import {CardStyleInterpolators} from '@react-navigation/stack';
import {useCallback} from 'react';
// Import Animated directly from 'react-native' as animations are used with navigation.
// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';

function useWideModalStackScreenOptions() {
    const styles = useThemeStyles();
    const modalCardStyleInterpolator = useModalCardStyleInterpolator();

    // We have to use isSmallScreenWidth, otherwise the content of RHP 'jumps' on Safari - its width is set to size of screen and only after rerender it is set to the correct value
    // It works as intended on other browsers
    // https://github.com/Expensify/App/issues/63747
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {wideRHPRouteKeys, superWideRHPRouteKeys} = useWideRHPState();
    const {sidePanelOffset} = useSidePanelState();

    return useCallback<({route}: {route: PlatformStackRouteProp<ParamListBase, string>}) => PlatformStackNavigationOptions>(
        ({route}) => {
            const baseInterpolator: StackCardStyleInterpolator = isSmallScreenWidth
                ? CardStyleInterpolators.forHorizontalIOS
                : (props) => modalCardStyleInterpolator({props, enter: {kind: 'slide-and-fade', distancePx: CONST.MODAL.RHP_ENTER_OFFSET_PX_WEB}});

            let cardStyleInterpolator: StackCardStyleInterpolator = baseInterpolator;

            if (!isSmallScreenWidth) {
                if (superWideRHPRouteKeys.includes(route.key)) {
                    cardStyleInterpolator = enhanceCardStyleInterpolator(baseInterpolator, {
                        // Shrink the super wide sheet by the Side Panel width while it is open so the sheet's
                        // left edge stays put instead of being pushed off-screen. See https://github.com/Expensify/App/issues/99035
                        cardStyle: styles.getSuperWideRHPExtendedCardInterpolatorStyles(Animated.subtract(animatedSuperWideRHPWidth, sidePanelOffset.current)),
                    });
                } else if (wideRHPRouteKeys.includes(route.key)) {
                    cardStyleInterpolator = enhanceCardStyleInterpolator(baseInterpolator, {
                        cardStyle: styles.wideRHPExtendedCardInterpolatorStyles,
                    });
                    // single RHPs displayed above the wide RHP need to be positioned
                } else if (superWideRHPRouteKeys.length > 0 || wideRHPRouteKeys.length > 0) {
                    cardStyleInterpolator = enhanceCardStyleInterpolator(baseInterpolator, {
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
                    transitionSpec: isSmallScreenWidth ? undefined : RHP_WEB_TRANSITION_SPEC,
                },
            };
        },
        [isSmallScreenWidth, modalCardStyleInterpolator, sidePanelOffset, styles, superWideRHPRouteKeys, wideRHPRouteKeys],
    );
}

export default useWideModalStackScreenOptions;
