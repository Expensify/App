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
import Animated, {cancelAnimation, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';

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
    const buttonDuration = isSubmittingAnimationRunning ? CONST.ANIMATION_SUBMIT_DURATION : CONST.ANIMATION_SUBMITTED_DURATION;
    const gap = styles.expenseAndReportPreviewTextButtonContainer.gap;
    const buttonMarginTop = useSharedValue<number>(gap);
    const height = useSharedValue<number>(variables.componentSizeNormal);
    const buttonProgress = useSharedValue(1);
    const [canShow, setCanShow] = useState(true);
    const [minWidth, setMinWidth] = useState<number>(0);
    const [isShowingLoading, setIsShowingLoading] = useState(false);
    const viewRef = useRef<HTMLElement | null>(null);
    const [pendingExpenseAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {selector: pendingExpenseActionSelector});
    const isDEWSubmissionComplete = isDEWSubmission && isSubmittingAnimationRunning && !pendingExpenseAction;

    const containerStyles = useAnimatedStyle(() => ({
        height: height.get(),
        justifyContent: 'center',
    }));

    const buttonStyles = useAnimatedStyle(() => ({
        opacity: buttonProgress.get(),
        transform: [{scale: buttonProgress.get()}],
    }));

    useEffect(() => {
        if (canShow || !isAnimationRunning) {
            buttonProgress.set(1);
            return;
        }

        // Animate a completed submission explicitly. An exiting animation also survives cancellation/unmount,
        // leaving the loading button beside the restored Submit dropdown after the PDF modal disappears.
        buttonProgress.set(
            withTiming(0, {duration: buttonDuration}, (finished) => {
                if (!finished) {
                    return;
                }
                scheduleOnRN(onAnimationFinish);
            }),
        );

        return () => cancelAnimation(buttonProgress);
    }, [buttonDuration, buttonProgress, canShow, isAnimationRunning, onAnimationFinish]);
    const icons = useMemoizedLazyExpensifyIcons(['Send']);

    useEffect(() => {
        if (!isAnimationRunning) {
            setMinWidth(0);
            setCanShow(true);
            setIsShowingLoading(false);
            height.set(variables.componentSizeNormal);
            buttonMarginTop.set(0);
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
    }, [buttonMarginTop, gap, height, isAnimationRunning, isDEWSubmission]);

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
        <Animated.View style={[containerStyles, {minWidth}]}>
            {isAnimationRunning && (
                <Animated.View
                    ref={(el: ComponentRef<typeof View> | null) => {
                        viewRef.current = el as HTMLElement | null;
                    }}
                    style={buttonStyles}
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
