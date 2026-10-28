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

import type {OnyxEntry} from 'react-native-onyx';

import React, {useEffect, useState} from 'react';
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

type SubmittingButtonProps = Pick<AnimatedSubmitButtonProps, 'variant' | 'text' | 'onAnimationFinish' | 'shouldShowMarkAsDoneCopy' | 'isDEWSubmission' | 'reportID'> & {
    pendingExpenseAction: ReportMetadata['pendingExpenseAction'];
};

function SubmittingButton({variant, text, onAnimationFinish, shouldShowMarkAsDoneCopy, isDEWSubmission, reportID, pendingExpenseAction}: SubmittingButtonProps) {
    const {translate} = useLocalize();
    const isReducedMotionEnabled = useReducedMotion();
    const [isShowingLoading, setIsShowingLoading] = useState(true);
    const [hasFailedSubmission, setHasFailedSubmission] = useState(false);
    const didSubmissionFail = isDEWSubmission && pendingExpenseAction === CONST.EXPENSE_PENDING_ACTION.SUBMIT_FAILED;

    // Remember the failure after its metadata is cleared, without rendering a stale Submitted phase first.
    if (didSubmissionFail && !hasFailedSubmission) {
        setHasFailedSubmission(true);
    }

    const icons = useMemoizedLazyExpensifyIcons(['Send']);

    useEffect(() => {
        // Synchronize the mounted loading phase with the clock; DEW submissions wait for the backend instead.
        if (isDEWSubmission) {
            return;
        }

        const timer = setTimeout(() => {
            setIsShowingLoading(false);
        }, CONST.ANIMATION_SUBMIT_LOADING_STATE_DURATION);

        return () => clearTimeout(timer);
    }, [isDEWSubmission]);

    useEffect(() => {
        // Clearing backend failure metadata writes to an external store, rather than deriving local display state.
        if (!didSubmissionFail) {
            return;
        }
        clearPendingExpenseAction(reportID);
    }, [didSubmissionFail, reportID]);

    const showLoading = !hasFailedSubmission && (isDEWSubmission ? !!pendingExpenseAction : isShowingLoading);
    const shouldShowIcon = !showLoading && !hasFailedSubmission;

    return (
        <Animated.View
            // Unlike an exiting layout animation, CSS animation never retains this view after cancellation.
            style={{
                animationName: showLoading ? 'none' : hideAnimation,
                animationDelay: hasFailedSubmission ? 0 : CONST.ANIMATION_SUBMIT_SUBMITTED_STATE_VISIBLE_DURATION,
                animationDuration: isReducedMotionEnabled ? 0 : CONST.ANIMATION_SUBMIT_DURATION,
                animationTimingFunction: 'linear',
                animationFillMode: 'forwards',
            }}
            onCSSAnimationEnd={({animationName}) => {
                if (showLoading || animationName !== hideAnimation.name) {
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
    );
}

function AnimatedSubmitButton({isSubmittingAnimationRunning, onPress, isDisabled, sentryLabel, ...props}: AnimatedSubmitButtonProps) {
    const styles = useThemeStyles();
    const [pendingExpenseAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${props.reportID}`, {selector: pendingExpenseActionSelector});

    return (
        <Animated.View style={[styles.justifyContentCenter, {height: variables.componentSizeNormal}]}>
            {isSubmittingAnimationRunning ? (
                <SubmittingButton
                    key={`${props.reportID}:${props.isDEWSubmission ? 'dew' : 'standard'}`}
                    {...props}
                    pendingExpenseAction={pendingExpenseAction}
                />
            ) : (
                <Button
                    variant={props.variant}
                    onPress={onPress}
                    isDisabled={isDisabled}
                    sentryLabel={sentryLabel}
                >
                    <Button.Text>{props.text}</Button.Text>
                </Button>
            )}
        </Animated.View>
    );
}

export default AnimatedSubmitButton;
