import {animatedSuperWideRHPWidth, animatedWideRHPWidth, useWideRHPState} from '@components/WideRHPContextProvider';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useRHPWindowDimensions from '@hooks/useRHPWindowDimensions';
import useSidePanelState from '@hooks/useSidePanelState';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import enhanceCardStyleInterpolator from '@libs/Navigation/AppNavigator/enhanceCardStyleInterpolator';
import hideKeyboardOnSwipe from '@libs/Navigation/AppNavigator/hideKeyboardOnSwipe';
import RHP_WEB_TRANSITION_SPEC from '@libs/Navigation/AppNavigator/RHPTransitionSpec';
import useModalCardStyleInterpolator from '@libs/Navigation/AppNavigator/useModalCardStyleInterpolator';
import calculateSuperWideRHPWidth from '@libs/Navigation/helpers/calculateSuperWideRHPWidth';
import calculateWideRHPWidth from '@libs/Navigation/helpers/calculateWideRHPWidth';
import getRHPLayoutValue from '@libs/Navigation/helpers/getRHPLayoutValue';
import getSidePanelRHPShrink from '@libs/Navigation/helpers/getSidePanelRHPShrink';
import type {PlatformStackNavigationOptions, PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';

import variables from '@styles/variables';

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
    const StyleUtils = useStyleUtils();

    const modalCardStyleInterpolator = useModalCardStyleInterpolator();

    // We have to use isSmallScreenWidth, otherwise the content of RHP 'jumps' on Safari - its width is set to size of screen and only after rerender it is set to the correct value
    // It works as intended on other browsers
    // https://github.com/Expensify/App/issues/63747
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {windowWidth} = useRHPWindowDimensions();
    const {wideRHPRouteKeys, superWideRHPRouteKeys} = useWideRHPState();
    const {sidePanelOffset} = useSidePanelState();

    return useCallback<({route}: {route: PlatformStackRouteProp<ParamListBase, string>}) => PlatformStackNavigationOptions>(
        ({route}) => {
            const baseInterpolator: StackCardStyleInterpolator = isSmallScreenWidth
                ? CardStyleInterpolators.forHorizontalIOS
                : (props) => modalCardStyleInterpolator({props, enter: {kind: 'slide-and-fade', distancePx: CONST.MODAL.RHP_ENTER_OFFSET_PX_WEB}});

            let nativeWidth: number = variables.rhpWidth;
            let animatedWidth: number | Animated.Value | Animated.AnimatedSubtraction<number> = variables.rhpWidth;
            const shouldUseExtendedCard = !isSmallScreenWidth && (superWideRHPRouteKeys.length > 0 || wideRHPRouteKeys.length > 0);

            if (!isSmallScreenWidth) {
                // Shrink the super wide sheet by the Side Panel width while it is open so the sheet's
                // left edge stays put instead of being pushed off-screen, capped at what its panes can spare
                // so the card never clips its own content. See https://github.com/Expensify/App/issues/99035
                const sidePanelShrink = getSidePanelRHPShrink(sidePanelOffset.current, windowWidth);

                if (superWideRHPRouteKeys.includes(route.key)) {
                    nativeWidth = calculateSuperWideRHPWidth(windowWidth);
                    animatedWidth = Animated.subtract<number>(animatedSuperWideRHPWidth, sidePanelShrink);
                } else if (wideRHPRouteKeys.includes(route.key)) {
                    nativeWidth = calculateWideRHPWidth(windowWidth);
                    animatedWidth = animatedWideRHPWidth;
                }
            }

            const cardStyleInterpolator = shouldUseExtendedCard
                ? enhanceCardStyleInterpolator(baseInterpolator, {
                      cardStyle: styles.getRHPExtendedCardStyle(getRHPLayoutValue(nativeWidth, animatedWidth)),
                      containerStyle: styles.overflowVisible,
                  })
                : baseInterpolator;

            return {
                ...hideKeyboardOnSwipe,
                headerShown: false,
                animationTypeForReplace: 'pop',
                native: {
                    contentStyle: [
                        styles.navigationScreenCardStyle,
                        !isSmallScreenWidth && styles.nativeRHPContent(nativeWidth),
                        shouldUseExtendedCard && styles.getRHPExtendedCardStyle(nativeWidth),
                    ],
                },
                web: {
                    // The RHP has its own scrim (BaseOverlay), so stacked screens must not fade in react-navigation's dark backdrop too.
                    cardOverlayEnabled: false,
                    cardStyle: isSmallScreenWidth ? StyleUtils.getStyleWithEnvSafeAreaPadding(styles.navigationScreenCardStyle) : styles.navigationScreenCardStyle,
                    cardStyleInterpolator,
                    transitionSpec: isSmallScreenWidth ? undefined : RHP_WEB_TRANSITION_SPEC,
                },
            };
        },
        [StyleUtils, isSmallScreenWidth, modalCardStyleInterpolator, sidePanelOffset, styles, superWideRHPRouteKeys, wideRHPRouteKeys, windowWidth],
    );
}

export default useWideModalStackScreenOptions;
