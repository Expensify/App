import Button from '@components/Button';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {getMostRecentActiveDEWApproveFailedAction} from '@libs/ReportActionsUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActions, ReportMetadata} from '@src/types/onyx';

import type {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

import React, {useEffect, useState} from 'react';
import Animated, {Keyframe, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';

import type SettlementButtonProps from './types';

import SettlementButton from '.';

type AnimatedSettlementButtonProps = SettlementButtonProps & {
    isPaidAnimationRunning: boolean;
    onAnimationFinish: () => void;
    isApprovedAnimationRunning: boolean;
    shouldAddTopMargin?: boolean;
    canIOUBePaid: boolean;

    // Whether this is a DEW approval that needs backend validation before showing "Approved"
    isDEWApproval?: boolean;

    // The report id for which the button is displayed
    reportID?: string;
};

const pendingExpenseActionSelector = (reportMetadata: OnyxEntry<ReportMetadata>) => reportMetadata?.pendingExpenseAction;
const hasActiveDEWApproveFailedSelector = (reportActions: OnyxEntry<ReportActions>) => !!getMostRecentActiveDEWApproveFailedAction(reportActions);

function AnimatedSettlementButton({
    isPaidAnimationRunning,
    isApprovedAnimationRunning,
    onAnimationFinish,
    shouldAddTopMargin = false,
    isDisabled,
    canIOUBePaid,
    wrapperStyle,
    sentryLabel,
    isDEWApproval,
    reportID,
    ...settlementButtonProps
}: AnimatedSettlementButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['ThumbsUp', 'Checkmark']);
    const isAnimationRunning = isPaidAnimationRunning || isApprovedAnimationRunning;
    const [pendingExpenseAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {selector: pendingExpenseActionSelector});

    // A blocked DEW approval is NOT an API failure (the approve request succeeds and `pendingExpenseAction` clears to
    // null exactly like a successful approval) — the backend signals the block with a DEW_APPROVE_FAILED report action.
    // So unlike submit, we cannot detect failure from `pendingExpenseAction`; we read the action instead.
    const [hasActiveDEWApproveFailed = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {selector: hasActiveDEWApproveFailedSelector});
    // Latch that the approval has actually reached the pending state. We only evaluate success/failure after this,
    // otherwise the startup window (before the optimistic `pendingExpenseAction = APPROVE` is applied)
    // would prematurely complete/abort and skip the loading state.
    const [hasEnteredPending, setHasEnteredPending] = useState(false);

    const isDEWApprovalAnimation = isDEWApproval && isApprovedAnimationRunning;
    if (isDEWApprovalAnimation && pendingExpenseAction === CONST.EXPENSE_PENDING_ACTION.APPROVE && !hasEnteredPending) {
        setHasEnteredPending(true);
    } else if (!isApprovedAnimationRunning && hasEnteredPending) {
        setHasEnteredPending(false);
    }

    // For a DEW approval the optimistic animation starts immediately, but the report only reaches the approved state
    // once the backend confirms. It is complete only after it entered the pending state,and the pending action is cleared
    // (null) while DEW approval hasn't failed. Until then keep it loading.
    const isDEWApprovalComplete = !!isDEWApprovalAnimation && hasEnteredPending && !pendingExpenseAction && !hasActiveDEWApproveFailed;
    const isDEWApprovalLoading = !!isDEWApprovalAnimation && !isDEWApprovalComplete;
    const isDEWApprovalFailed = !!isDEWApprovalAnimation && hasEnteredPending && !pendingExpenseAction && hasActiveDEWApproveFailed;

    const buttonDuration = isPaidAnimationRunning ? CONST.ANIMATION_PAID_DURATION : CONST.ANIMATION_THUMBS_UP_DURATION;
    const buttonDelay = CONST.ANIMATION_PAID_BUTTON_HIDE_DELAY;
    const gap = styles.expenseAndReportPreviewTextButtonContainer.gap;
    const buttonMarginTop = useSharedValue<number>(gap);
    const height = useSharedValue<number>(variables.componentSizeNormal);
    const [canShow, setCanShow] = useState(true);
    const [minWidth, setMinWidth] = useState<number>(0);

    const containerStyles = useAnimatedStyle(() => ({
        height: height.get(),
        justifyContent: 'center',
        ...(shouldAddTopMargin && {marginTop: buttonMarginTop.get()}),
    }));

    const willShowPaymentButton = canIOUBePaid && isApprovedAnimationRunning;

    const finishAnimationAndReset = () => {
        setMinWidth(0);
        setCanShow(true);
        height.set(variables.componentSizeNormal);
        buttonMarginTop.set(shouldAddTopMargin ? gap : 0);
        onAnimationFinish();
    };

    const onButtonExitComplete: () => void = () => {
        'worklet';

        if (shouldAddTopMargin) {
            buttonMarginTop.set(withTiming(willShowPaymentButton ? gap : 0, {duration: buttonDuration}));
        }
        if (willShowPaymentButton) {
            scheduleOnRN(finishAnimationAndReset);
            return;
        }
        height.set(withTiming(0, {duration: buttonDuration}, () => scheduleOnRN(finishAnimationAndReset)));
    };

    const buttonAnimation = new Keyframe({
        from: {
            opacity: 1,
            transform: [{scale: 1}],
        },
        to: {
            opacity: 0,
            transform: [{scale: 0}],
        },
    })
        .delay(buttonDelay)
        .duration(buttonDuration)
        .withCallback(onButtonExitComplete);

    let icon;
    if (isApprovedAnimationRunning) {
        icon = expensifyIcons.ThumbsUp;
    } else if (isPaidAnimationRunning) {
        icon = expensifyIcons.Checkmark;
    }

    const animatedViewRef = (el: View | null) => {
        if (!el || !isAnimationRunning) {
            return;
        }
        setMinWidth((el as unknown as HTMLElement).getBoundingClientRect?.().width ?? 0);
    };

    useEffect(() => {
        if (!isAnimationRunning || (isDEWApprovalAnimation && !isDEWApprovalComplete)) {
            return;
        }
        const timer = setTimeout(() => setCanShow(false), CONST.ANIMATION_PAID_BUTTON_HIDE_DELAY);
        return () => clearTimeout(timer);
    }, [isAnimationRunning, isDEWApprovalComplete, isDEWApprovalAnimation]);

    useEffect(() => {
        if (!isDEWApprovalFailed) {
            return;
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCanShow(false);
    }, [isDEWApprovalFailed]);

    return (
        <Animated.View style={[containerStyles, wrapperStyle, {minWidth}]}>
            {isAnimationRunning && canShow && (
                <Animated.View
                    ref={animatedViewRef}
                    exiting={buttonAnimation}
                >
                    <Button
                        text={isApprovedAnimationRunning ? translate('iou.approved') : translate('iou.paymentComplete')}
                        isLoading={isDEWApprovalLoading}
                        success
                        icon={icon}
                    />
                </Animated.View>
            )}
            {!isAnimationRunning && (
                <SettlementButton
                    {...settlementButtonProps}
                    wrapperStyle={wrapperStyle}
                    isDisabled={isAnimationRunning || isDisabled}
                    sentryLabel={sentryLabel}
                />
            )}
        </Animated.View>
    );
}

export default AnimatedSettlementButton;
