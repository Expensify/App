import Button from '@components/Button';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import {clearPendingExpenseAction} from '@userActions/IOU/ReportWorkflow';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportMetadata} from '@src/types/onyx';
import type WithSentryLabel from '@src/types/utils/SentryLabel';

import type {ComponentRef} from 'react';
import type {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

import React, {useEffect, useRef, useState} from 'react';
import Animated, {css, useReducedMotion} from 'react-native-reanimated';

type AnimatedSubmitButtonProps = WithSentryLabel & {
    /** Submit buttons support the default and success styles; danger is not a valid submit state. */
    variant?: typeof CONST.BUTTON_VARIANT.SUCCESS;

    /** Text to show on the button */
    text: string;

    /** Function to call when the button is pressed */
    onPress: () => void;

    isSubmittingAnimationRunning: boolean;
    onAnimationFinish: () => void;
    isDisabled?: boolean;

    /** Whether this is a DEW submission that needs backend validation before showing "Submitted" */
    isDEWSubmission?: boolean;

    /** The report id for which the button is displayed */
    reportID?: string;

    /** Whether to show "Mark as done" copy instead of "Submit" copy for track-intent users */
    shouldShowMarkAsDoneCopy?: boolean;
};

const pendingExpenseActionSelector = (reportMetadata: OnyxEntry<ReportMetadata>) => reportMetadata?.pendingExpenseAction;

const hideAnimation = css.keyframes({
    from: {opacity: 1, transform: [{scale: 1}]},
    to: {opacity: 0, transform: [{scale: 0}]},
});

function AnimatedSubmitButton({
    variant,
    text,
    onPress,
    isSubmittingAnimationRunning,
    onAnimationFinish,
    isDisabled,
    sentryLabel,
    shouldShowMarkAsDoneCopy,
    isDEWSubmission,
    reportID,
}: AnimatedSubmitButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const isAnimationRunning = isSubmittingAnimationRunning;
    const isReducedMotionEnabled = useReducedMotion();
    const [canShow, setCanShow] = useState(true);
    const [minWidth, setMinWidth] = useState<number>(0);
    const [isShowingLoading, setIsShowingLoading] = useState(false);
    const viewRef = useRef<HTMLElement | null>(null);
    const [pendingExpenseAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {selector: pendingExpenseActionSelector});
    const isDEWSubmissionComplete = isDEWSubmission && isSubmittingAnimationRunning && !pendingExpenseAction;

    const icons = useMemoizedLazyExpensifyIcons(['Send']);

    useEffect(() => {
        if (!isAnimationRunning) {
            setMinWidth(0);
            setCanShow(true);
            setIsShowingLoading(false);
            return;
        }

        // For DEW submission the animation is controlled by the BE response.
        if (isDEWSubmission) {
            return;
        }

        setMinWidth(viewRef.current?.getBoundingClientRect?.().width ?? 0);
        setIsShowingLoading(true);

        const timer = setTimeout(() => {
            setIsShowingLoading(false);
        }, CONST.ANIMATION_SUBMIT_LOADING_STATE_DURATION);

        return () => clearTimeout(timer);
    }, [isAnimationRunning, isDEWSubmission]);

    useEffect(() => {
        if (!isAnimationRunning || isShowingLoading || (isDEWSubmission && !isDEWSubmissionComplete)) {
            return;
        }

        const timer = setTimeout(() => setCanShow(false), CONST.ANIMATION_SUBMIT_SUBMITTED_STATE_VISIBLE_DURATION);

        return () => clearTimeout(timer);
    }, [isAnimationRunning, isShowingLoading, isDEWSubmissionComplete, isDEWSubmission]);

    useEffect(() => {
        if (!isAnimationRunning || !isDEWSubmission || pendingExpenseAction !== CONST.EXPENSE_PENDING_ACTION.SUBMIT_FAILED) {
            return;
        }
        // When pending submission fails we quit to avoid showing submitted animation.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCanShow(false);
        clearPendingExpenseAction(reportID);
    }, [isAnimationRunning, pendingExpenseAction, reportID, isDEWSubmission]);

    // eslint-disable-next-line react-hooks/refs
    const showLoading = isShowingLoading || (isAnimationRunning && (!viewRef.current || (isDEWSubmission && !isDEWSubmissionComplete)));
    const shouldShowIcon = isAnimationRunning && !showLoading;

    return (
        <Animated.View style={[styles.justifyContentCenter, {height: variables.componentSizeNormal, minWidth}]}>
            {isAnimationRunning && (
                <Animated.View
                    ref={(el: ComponentRef<typeof View> | null) => {
                        viewRef.current = el as HTMLElement | null;
                    }}
                    // Unlike an exiting layout animation, CSS animation never retains this view after cancellation.
                    style={{
                        animationName: canShow ? 'none' : hideAnimation,
                        animationDuration: isReducedMotionEnabled ? 0 : CONST.ANIMATION_SUBMIT_DURATION,
                        animationTimingFunction: 'linear',
                        animationFillMode: 'forwards',
                    }}
                    onCSSAnimationEnd={({animationName}) => {
                        if (canShow || animationName !== hideAnimation.name) {
                            return;
                        }
                        onAnimationFinish();
                    }}
                >
                    <Button
                        variant={variant}
                        isLoading={showLoading}
                        isDisabled
                        stayNormalOnDisable
                    >
                        {shouldShowIcon && <Button.Icon src={icons.Send} />}
                        <Button.Text>{shouldShowIcon ? translate(shouldShowMarkAsDoneCopy ? 'common.markedAsDoneStatus' : 'common.submitted') : text}</Button.Text>
                    </Button>
                </Animated.View>
            )}
            {!isAnimationRunning && (
                <Button
                    variant={variant}
                    onPress={onPress}
                    isDisabled={isDisabled}
                    sentryLabel={sentryLabel}
                >
                    <Button.Text>{text}</Button.Text>
                </Button>
            )}
        </Animated.View>
    );
}

export default AnimatedSubmitButton;
