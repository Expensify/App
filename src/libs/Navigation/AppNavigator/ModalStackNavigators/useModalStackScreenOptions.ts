import type {ParamListBase} from '@react-navigation/native';
import type {StackCardStyleInterpolator} from '@react-navigation/stack';
import {useCallback} from 'react';
import {useWideRHPState} from '@components/WideRHPContextProvider';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import enhanceCardStyleInterpolator from '@libs/Navigation/AppNavigator/enhanceCardStyleInterpolator';
import hideKeyboardOnSwipe from '@libs/Navigation/AppNavigator/hideKeyboardOnSwipe';
import useIsCenteredRHPModal from '@libs/Navigation/AppNavigator/useIsCenteredRHPModal';
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

    // PoC: when the RHP is a centered modal the content card needs its own rounded corners, because the fixed-positioned
    // card escapes the container's borderRadius clip.
    const isCenteredModal = useIsCenteredRHPModal();
    const navigationScreenCardStyle = isCenteredModal
        ? {...styles.navigationScreenCardStyle, borderRadius: variables.componentBorderRadiusLarge, overflow: 'hidden' as const}
        : styles.navigationScreenCardStyle;

    return useCallback<({route}: {route: PlatformStackRouteProp<ParamListBase, string>}) => PlatformStackNavigationOptions>(
        ({route}) => {
            const baseInterpolator: StackCardStyleInterpolator = (props) =>
                modalCardStyleInterpolator({props, enter: {kind: 'slide-and-fade', distancePx: CONST.MODAL.RHP_ENTER_OFFSET_PX_WEB}});

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
                    // single RHPs displayed above the wide RHP need to be positioned
                } else if (superWideRHPRouteKeys.length > 0 || wideRHPRouteKeys.length > 0) {
                    cardStyleInterpolator = enhanceCardStyleInterpolator(baseInterpolator, {
                        cardStyle: styles.singleRHPExtendedCardInterpolatorStyles,
                    });
                }
                // Otherwise (no wide pane in the stack) the small RHP is a centered modal and uses the base interpolator.
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
                    transitionSpec: {
                        open: {animation: 'timing', config: {duration: CONST.MODAL.ANIMATION_TIMING.RHP_DURATION_IN_WEB}},
                        close: {animation: 'timing', config: {duration: CONST.MODAL.ANIMATION_TIMING.RHP_DURATION_OUT_WEB}},
                    },
                },
            };
        },
        [isSmallScreenWidth, modalCardStyleInterpolator, navigationScreenCardStyle, styles, superWideRHPRouteKeys, wideRHPRouteKeys],
    );
}

export default useWideModalStackScreenOptions;
