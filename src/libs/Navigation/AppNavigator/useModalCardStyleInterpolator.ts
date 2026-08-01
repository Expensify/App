import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSidePanelState from '@hooks/useSidePanelState';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {isMobileChrome, isMobileSafari} from '@libs/Browser';

import variables from '@styles/variables';

import type {StackCardInterpolatedStyle, StackCardInterpolationProps} from '@react-navigation/stack';

// Import Animated directly from 'react-native' as animations are used with navigation.
// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';

type EnterAnimation = {kind: 'slide-and-fade'; distancePx: number} | {kind: 'slide-from-width'} | {kind: 'fade'} | {kind: 'none'};

type ModalCardStyleInterpolatorProps = {
    props: StackCardInterpolationProps;
    enter: EnterAnimation;
    applySidePanelOffset?: boolean;
};

type ModalCardStyleInterpolator = (props: ModalCardStyleInterpolatorProps) => StackCardInterpolatedStyle;

const useModalCardStyleInterpolator = (): ModalCardStyleInterpolator => {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const StyleUtils = useStyleUtils();
    const styles = useThemeStyles();
    const {sidePanelOffset, sidePanelNVP, isSidePanelTransitionEnded} = useSidePanelState();

    // Narrow mobile browsers compositing the stacked, transparent modal cards can flicker mid-slide on low-end devices.
    // Hardening the animated card (opaque background + dedicated compositor layer) avoids that glitch while keeping the animation.
    const shouldHardenAnimatedCardForMobileBrowser = (isMobileChrome() || isMobileSafari()) && shouldUseNarrowLayout;

    const modalCardStyleInterpolator: ModalCardStyleInterpolator = ({
        props: {
            current: {progress},
            inverted,
            layouts: {screen},
        },
        enter,
        applySidePanelOffset = false,
    }) => {
        const cardStyle = StyleUtils.getCardStyles(screen.width);

        if (applySidePanelOffset) {
            cardStyle.paddingRight = sidePanelOffset.current;
        }

        // Suppress card entry animation while the side panel is mid-transition on narrow layout — keeps the
        // existing behavior that prevents a janky double-animation when the side panel slides in/out.
        const sidePanelGateAllowsEntry = isSidePanelTransitionEnded || !!sidePanelNVP?.openNarrowScreen || !shouldUseNarrowLayout;

        if (enter.kind === 'none' || !sidePanelGateAllowsEntry) {
            return {containerStyle: {overflow: 'hidden'}, cardStyle};
        }

        if (enter.kind === 'fade') {
            return {cardStyle: {...cardStyle, opacity: progress}};
        }

        const widthFallback = shouldUseNarrowLayout ? screen.width : variables.sideBarWidth;
        const distancePx = enter.kind === 'slide-and-fade' ? enter.distancePx : widthFallback;

        const translateX = Animated.multiply(
            progress.interpolate({
                inputRange: [0, 1],
                outputRange: [distancePx, 0],
                extrapolate: 'clamp',
            }),
            inverted,
        );

        if (shouldHardenAnimatedCardForMobileBrowser) {
            Object.assign(cardStyle, styles.appBG, styles.willChangeTransform);
        }

        cardStyle.transform = [{translateX}];

        if (enter.kind === 'slide-and-fade') {
            cardStyle.opacity = progress;
        }

        return {
            containerStyle: {overflow: 'hidden'},
            cardStyle,
        };
    };

    return modalCardStyleInterpolator;
};

export type {EnterAnimation};
export default useModalCardStyleInterpolator;
