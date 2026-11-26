import Icon from '@components/Icon';
import {usePaymentAnimationsContext} from '@components/PaymentAnimationsContext';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import Accessibility from '@libs/Accessibility';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React, {useEffect, useEffectEvent, useRef} from 'react';
import Animated, {css, cubicBezier} from 'react-native-reanimated';

type HomeTodoActionResultIconProps = {
    /** The report the action was taken on */
    reportID: string | undefined;

    /** Keeps the space of the button the icon replaces, so the buttons beside it stay in place */
    minWidth: number;
};

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
    const endResult = useEffectEvent(() => stopAnimation());
    useEffect(() => {
        if (resultReportIDRef.current === reportID) {
            return;
        }
        endResult();
    }, [reportID]);

    // Restores the action button if the review does not move on, e.g. when the server rejects the action
    useEffect(() => {
        const timer = setTimeout(() => endResult(), CONST.HOME_TODO_REVIEW_ANIMATION.RESULT_FALLBACK_DURATION);
        return () => clearTimeout(timer);
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
                    animationDuration: isReduceMotionEnabled ? 0 : CONST.HOME_TODO_REVIEW_ANIMATION.RESULT_POP_DURATION,
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
