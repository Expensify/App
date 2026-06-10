import type {ParamListBase} from '@react-navigation/native';
import type {StackCardStyleInterpolator} from '@react-navigation/stack';
import {useCallback, useMemo} from 'react';
import type {ViewStyle} from 'react-native';
import {useWideRHPState} from '@components/WideRHPContextProvider';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import enhanceCardStyleInterpolator from '@libs/Navigation/AppNavigator/enhanceCardStyleInterpolator';
import hideKeyboardOnSwipe from '@libs/Navigation/AppNavigator/hideKeyboardOnSwipe';
import useModalCardStyleInterpolator from '@libs/Navigation/AppNavigator/useModalCardStyleInterpolator';
import type {PlatformStackNavigationOptions, PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import variables from '@styles/variables';
import CONST from '@src/CONST';

function useWideModalStackScreenOptions() {
    const styles = useThemeStyles();
    const modalCardStyleInterpolator = useModalCardStyleInterpolator();

    // We have to use isSmallScreenWidth, otherwise the content of RHP 'jumps' on Safari - its width is set to size of screen and only after rerender it is set to the correct value
    // It works as intended on other browsers
    // https://github.com/Expensify/App/issues/63747
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {wideRHPRouteKeys, superWideRHPRouteKeys} = useWideRHPState();

    // PoC: a centered small RHP needs rounded corners on the content card itself, because the fixed-positioned card escapes
    // the container's borderRadius clip. This applies whether it stands alone or floats above a wide/super-wide pane.
    const roundedCardStyle = useMemo(
        () => ({...styles.navigationScreenCardStyle, borderRadius: variables.componentBorderRadiusLarge, overflow: 'hidden' as const}),
        [styles.navigationScreenCardStyle],
    );

    // PoC: a small RHP centered above a wide pane is centered by the inner navigator's wrapper box (see ModalStackNavigators
    // index). The base card style is `position: 'fixed'` on web (getCardStyles), which escapes that absolutely-positioned box and
    // stretches the card to the full viewport. Override it so the card simply fills the wrapper box instead.
    const filledCenteredCardStyle = useMemo<ViewStyle>(() => ({position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, width: '100%', height: '100%', overflow: 'hidden'}), []);

    return useCallback<({route}: {route: PlatformStackRouteProp<ParamListBase, string>}) => PlatformStackNavigationOptions>(
        ({route}) => {
            const baseInterpolator: StackCardStyleInterpolator = (props) =>
                modalCardStyleInterpolator({props, enter: {kind: 'slide-and-fade', distancePx: CONST.MODAL.RHP_ENTER_OFFSET_PX_WEB}});

            const isWideRoute = superWideRHPRouteKeys.includes(route.key) || wideRHPRouteKeys.includes(route.key);
            const hasWidePane = superWideRHPRouteKeys.length > 0 || wideRHPRouteKeys.length > 0;

            // A small RHP on wide layout is always a centered modal (alone, or floating above a wide pane). Wide panes keep their corners.
            const isCenteredCard = !isSmallScreenWidth && !isWideRoute;
            const navigationScreenCardStyle = isCenteredCard ? roundedCardStyle : styles.navigationScreenCardStyle;

            let cardStyleInterpolator: StackCardStyleInterpolator = baseInterpolator;

            if (!isSmallScreenWidth) {
                if (superWideRHPRouteKeys.includes(route.key)) {
                    cardStyleInterpolator = enhanceCardStyleInterpolator(baseInterpolator, {
                        cardStyle: styles.superWideRHPExtendedCardInterpolatorStyles,
                    });
                } else if (wideRHPRouteKeys.includes(route.key)) {
                    cardStyleInterpolator = enhanceCardStyleInterpolator(baseInterpolator, {
                        cardStyle: styles.wideRHPExtendedCardInterpolatorStyles,
                    });
                    // PoC: a small RHP centered on top of a wide pane fills the inner navigator's wrapper box (see
                    // ModalStackNavigators index). Override the base `position: 'fixed'` card style so it does not escape the box.
                } else if (hasWidePane) {
                    cardStyleInterpolator = enhanceCardStyleInterpolator(baseInterpolator, {
                        cardStyle: filledCenteredCardStyle,
                    });
                }
                // Otherwise (no wide pane in the stack) the small RHP is a centered modal that fills the centered container and uses the base interpolator.
            }

            return {
                ...hideKeyboardOnSwipe,
                headerShown: false,
                animationTypeForReplace: 'pop',
                native: {
                    contentStyle: navigationScreenCardStyle,
                },
                web: {
                    cardStyle: navigationScreenCardStyle,
                    cardStyleInterpolator,
                    // PoC: React Navigation enables a default card overlay for non-transparent-modal cards, which dims the card's
                    // own (right-docked) footprint. For a wide pane that shows up as an extra dim band on the right behind the
                    // centered modal. Expensify dims via its own Overlay components, so disable the default card overlay.
                    cardOverlayEnabled: false,
                    transitionSpec: {
                        open: {animation: 'timing', config: {duration: CONST.MODAL.ANIMATION_TIMING.RHP_DURATION_IN_WEB}},
                        close: {animation: 'timing', config: {duration: CONST.MODAL.ANIMATION_TIMING.RHP_DURATION_OUT_WEB}},
                    },
                },
            };
        },
        [isSmallScreenWidth, modalCardStyleInterpolator, roundedCardStyle, filledCenteredCardStyle, styles, superWideRHPRouteKeys, wideRHPRouteKeys],
    );
}

export default useWideModalStackScreenOptions;
