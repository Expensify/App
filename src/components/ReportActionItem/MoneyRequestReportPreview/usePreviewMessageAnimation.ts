import {useEffect, useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming} from 'react-native-reanimated';
import useLocalize from '@hooks/useLocalize';
import {getInvoicePayerName} from '@libs/ReportNameUtils';
import {getDisplayNameForParticipant, getPolicyName} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {PersonalDetails, Policy, Report} from '@src/types/onyx';

type UsePreviewMessageAnimationParams = {
    /** Whether all the requests are being smart scanned */
    isScanning: boolean;

    /** Number of pending (managed card) requests */
    numberOfPendingRequests: number;

    /** Total number of requests */
    numberOfRequests: number;

    /** Whether the RTER violation message should be shown */
    shouldShowRTERViolationMessage: boolean;

    /** Whether the chat is a policy expense chat */
    isPolicyExpenseChat: boolean;

    /** Whether the chat is a trip room */
    isTripRoom: boolean;

    /** Whether the chat is an invoice room */
    isInvoiceRoom: boolean;

    /** Whether the report is approved */
    isApproved: boolean;

    /** Whether the IOU is settled */
    iouSettled: boolean;

    /** The previewed IOU report */
    iouReport: OnyxEntry<Report>;

    /** Whether the report has non-reimbursable transactions */
    hasNonReimbursableTransactions: boolean;

    /** The total amount spent on the report */
    totalDisplaySpend: number;

    /** The chat report the preview belongs to */
    chatReport: OnyxEntry<Report>;

    /** The policy the report belongs to */
    policy: OnyxEntry<Policy>;

    /** The invoice receiver policy, used to resolve the payer name in invoice rooms */
    invoiceReceiverPolicy: OnyxEntry<Policy>;

    /** The invoice receiver personal detail, used to resolve the payer name in invoice rooms */
    invoiceReceiverPersonalDetail: OnyxEntry<PersonalDetails> | null;

    /** The manager account ID */
    managerID: number;

    /** Whether the paid animation is running */
    isPaidAnimationRunning: boolean;

    /** Whether the approved animation is running */
    isApprovedAnimationRunning: boolean;

    /** Whether the submitting animation is running */
    isSubmittingAnimationRunning: boolean;
};

/**
 * Owns the preview-message animations: the opacity flash that fires whenever the computed preview message changes,
 * and the checkmark / thumbs-up spring animations that play on settle / approval. Returns the animated style applied
 * to the report name container.
 */
function usePreviewMessageAnimation({
    isScanning,
    numberOfPendingRequests,
    numberOfRequests,
    shouldShowRTERViolationMessage,
    isPolicyExpenseChat,
    isTripRoom,
    isInvoiceRoom,
    isApproved,
    iouSettled,
    iouReport,
    hasNonReimbursableTransactions,
    totalDisplaySpend,
    chatReport,
    policy,
    invoiceReceiverPolicy,
    invoiceReceiverPersonalDetail,
    managerID,
    isPaidAnimationRunning,
    isApprovedAnimationRunning,
    isSubmittingAnimationRunning,
}: UsePreviewMessageAnimationParams) {
    const {translate, formatPhoneNumber} = useLocalize();

    const previewMessageOpacity = useSharedValue(1);
    const previewMessageStyle = useAnimatedStyle(() => ({
        opacity: previewMessageOpacity.get(),
    }));
    const checkMarkScale = useSharedValue(iouSettled ? 1 : 0);
    const thumbsUpScale = useSharedValue(isApproved ? 1 : 0);

    const previewMessage = useMemo(() => {
        if (isScanning) {
            return totalDisplaySpend ? `${translate('common.receipt')} ${CONST.DOT_SEPARATOR} ${translate('common.scanning')}` : `${translate('common.receipt')}`;
        }
        if (numberOfPendingRequests === 1 && numberOfRequests === 1) {
            return `${translate('common.receipt')} ${CONST.DOT_SEPARATOR} ${translate('iou.pending')}`;
        }
        if (shouldShowRTERViolationMessage) {
            return `${translate('common.receipt')} ${CONST.DOT_SEPARATOR} ${translate('iou.pendingMatch')}`;
        }

        let payerOrApproverName;
        if (isPolicyExpenseChat || isTripRoom) {
            payerOrApproverName = getPolicyName({report: chatReport, policy, unavailableTranslation: translate('workspace.common.unavailable')});
        } else if (isInvoiceRoom) {
            payerOrApproverName = getInvoicePayerName(chatReport, invoiceReceiverPolicy, invoiceReceiverPersonalDetail);
        } else {
            payerOrApproverName = getDisplayNameForParticipant({
                accountID: managerID,
                shouldUseShortForm: true,
                formatPhoneNumber,
            });
        }

        if (isApproved) {
            return translate('iou.managerApproved', payerOrApproverName);
        }
        let paymentVerb: TranslationPaths = 'iou.payerOwes';
        if (iouSettled || iouReport?.isWaitingOnBankAccount) {
            paymentVerb = 'iou.payerPaid';
        } else if (hasNonReimbursableTransactions) {
            paymentVerb = 'iou.payerSpent';
            payerOrApproverName = getDisplayNameForParticipant({
                accountID: chatReport?.ownerAccountID,
                shouldUseShortForm: true,
                formatPhoneNumber,
            });
        }
        return translate(paymentVerb, payerOrApproverName);
    }, [
        isScanning,
        numberOfPendingRequests,
        numberOfRequests,
        shouldShowRTERViolationMessage,
        isPolicyExpenseChat,
        isTripRoom,
        isInvoiceRoom,
        isApproved,
        iouSettled,
        iouReport?.isWaitingOnBankAccount,
        hasNonReimbursableTransactions,
        translate,
        totalDisplaySpend,
        chatReport,
        policy,
        invoiceReceiverPolicy,
        invoiceReceiverPersonalDetail,
        managerID,
        formatPhoneNumber,
    ]);

    useEffect(() => {
        if (!isPaidAnimationRunning || isApprovedAnimationRunning || isSubmittingAnimationRunning) {
            return;
        }

        previewMessageOpacity.set(
            withTiming(0.75, {duration: CONST.ANIMATION_PAID_DURATION / 2}, () => {
                previewMessageOpacity.set(withTiming(1, {duration: CONST.ANIMATION_PAID_DURATION / 2}));
            }),
        );
        // We only want to animate the text when the text changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [previewMessage, previewMessageOpacity]);

    useEffect(() => {
        if (!iouSettled) {
            return;
        }

        checkMarkScale.set(isPaidAnimationRunning ? withDelay(CONST.ANIMATION_PAID_CHECKMARK_DELAY, withSpring(1, {duration: CONST.ANIMATION_PAID_DURATION})) : 1);
    }, [isPaidAnimationRunning, iouSettled, checkMarkScale]);

    useEffect(() => {
        if (!isApproved) {
            return;
        }

        thumbsUpScale.set(isApprovedAnimationRunning ? withDelay(CONST.ANIMATION_THUMBS_UP_DELAY, withSpring(1, {duration: CONST.ANIMATION_THUMBS_UP_DURATION})) : 1);
    }, [isApproved, isApprovedAnimationRunning, thumbsUpScale]);

    return {previewMessageStyle};
}

export default usePreviewMessageAnimation;
