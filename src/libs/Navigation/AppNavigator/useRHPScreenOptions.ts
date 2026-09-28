import {useWideRHPState} from '@components/WideRHPContextProvider';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import {isSafari} from '@libs/Browser';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import Presentation from '@libs/Navigation/PlatformStackNavigation/navigationOptions/presentation';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types/NavigationOptions';

import variables from '@styles/variables';

import type {StackCardInterpolationProps} from '@react-navigation/stack';

import {CardStyleInterpolators} from '@react-navigation/stack';
import {useMemo} from 'react';

import RHP_WEB_TRANSITION_SPEC from './RHPTransitionSpec';
import useModalCardStyleInterpolator from './useModalCardStyleInterpolator';

const useRHPScreenOptions = (): PlatformStackNavigationOptions => {
    const styles = useThemeStyles();
    const customInterpolator = useModalCardStyleInterpolator();
    const {wideRHPRouteKeys, superWideRHPRouteKeys} = useWideRHPState();

    // We have to use the isSmallScreenWidth instead of shouldUseNarrow layout, because we want to have information about screen width without the context of side modal.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    // Over a wide RHP, a narrow card owns only the single-RHP column at the frame's right edge.
    const isCardTheSingleRHPColumn = !isSmallScreenWidth && (wideRHPRouteKeys.length > 0 || superWideRHPRouteKeys.length > 0);

    return useMemo<PlatformStackNavigationOptions>(() => {
        // The card animates over the column's width and is clipped to it; the rest of the frame is the screen underneath.
        const columnContainerStyle = {...styles.singleRHPExtendedCardInterpolatorStyles, ...styles.overflowHidden};
        const getColumnInterpolatorProps = (props: StackCardInterpolationProps): StackCardInterpolationProps => ({
            ...props,
            layouts: {screen: {...props.layouts.screen, width: variables.sideBarWidth}},
        });

        return {
            headerShown: false,
            animation: Animations.SLIDE_FROM_RIGHT,
            gestureDirection: 'horizontal',
            web: {
                cardStyleInterpolator: (props) => {
                    const cardProps = isCardTheSingleRHPColumn ? getColumnInterpolatorProps(props) : props;
                    // The .forHorizontalIOS interpolator from `@react-navigation` is misbehaving on Safari, so we override it with Expensify custom interpolator
                    const interpolatedStyle = isSafari() ? customInterpolator({props: cardProps, enter: {kind: 'slide-from-width'}}) : CardStyleInterpolators.forHorizontalIOS(cardProps);
                    return isCardTheSingleRHPColumn ? {...interpolatedStyle, containerStyle: columnContainerStyle} : interpolatedStyle;
                },
                presentation: Presentation.TRANSPARENT_MODAL,
                cardOverlayEnabled: false,
                cardStyle: styles.navigationScreenCardStyle,
                gestureDirection: 'horizontal',
                transitionSpec: isSmallScreenWidth ? undefined : RHP_WEB_TRANSITION_SPEC,
            },
        };
    }, [customInterpolator, isCardTheSingleRHPColumn, isSmallScreenWidth, styles.navigationScreenCardStyle, styles.singleRHPExtendedCardInterpolatorStyles, styles.overflowHidden]);
};

export default useRHPScreenOptions;
