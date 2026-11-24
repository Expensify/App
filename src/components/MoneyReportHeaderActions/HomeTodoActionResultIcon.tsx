import Icon from '@components/Icon';
import {usePaymentAnimationsContext} from '@components/PaymentAnimationsContext';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import Accessibility from '@libs/Accessibility';

import variables from '@styles/variables';

import React, {useEffect, useRef} from 'react';
import Animated, {css, cubicBezier} from 'react-native-reanimated';

type HomeTodoActionResultIconProps = {
    /** The report the action was taken on */
    reportID: string | undefined;

    /** Keeps the space of the button the icon replaces, so the buttons beside it stay in place */
    minWidth: number;
};

/** Restores the action button if the review does not move on, e.g. when the server rejects the action */
const FALLBACK_DURATION = 3000;

const POP_DURATION = 300;

const popAnimation = css.keyframes({
    from: {opacity: 0, transform: [{scale: 0}]},
    to: {opacity: 1, transform: [{scale: 1}]},
});

/** Overshoots its end value a little, so the icon pops */
const POP_EASING = cubicBezier(0.34, 1.56, 0.64, 1);

/**
 * Replaces the report's action button with an icon of its result during a Home to-do review, right before the review
 * moves on to the next report.
 */
function HomeTodoActionResultIcon({reportID, minWidth}: HomeTodoActionResultIconProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const isReduceMotionEnabled = Accessibility.useReducedMotion();
    const {isApprovedAnimationRunning, isPaidAnimationRunning, stopAnimation} = usePaymentAnimationsContext();
    const icons = useMemoizedLazyExpensifyIcons(['ThumbsUp', 'Checkmark', 'Send']);

    let icon = icons.Send;
    if (isApprovedAnimationRunning) {
        icon = icons.ThumbsUp;
    } else if (isPaidAnimationRunning) {
        icon = icons.Checkmark;
    }

    // The header stays mounted when the review swaps reports, so the result must not carry over to the next report.
    const resultReportIDRef = useRef(reportID);
    useEffect(() => {
        if (resultReportIDRef.current === reportID) {
            return;
        }
        stopAnimation();
        // Only a new report ends the result. stopAnimation only resets state, so it is left out.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reportID]);

    useEffect(() => {
        const timer = setTimeout(stopAnimation, FALLBACK_DURATION);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Animated.View
            style={[
                styles.alignItemsCenter,
                styles.justifyContentCenter,
                StyleUtils.getHeight(variables.componentSizeNormal),
                {minWidth},
                {
                    animationName: popAnimation,
                    animationDuration: isReduceMotionEnabled ? 0 : POP_DURATION,
                    animationTimingFunction: POP_EASING,
                    animationFillMode: 'both',
                },
            ]}
        >
            <Icon
                src={icon}
                fill={theme.success}
                width={variables.iconSizeLarge}
                height={variables.iconSizeLarge}
            />
        </Animated.View>
    );
}

export default HomeTodoActionResultIcon;
