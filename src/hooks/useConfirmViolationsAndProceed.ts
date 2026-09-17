import {ModalActions} from '@components/Modal/Global/ModalContext';
import SubmitViolationsBulletList from '@components/SubmitViolationsBulletList';

import type {SubmitViolationsSummary} from '@libs/SubmitViolationsUtils';
import {hasAnySubmitViolation} from '@libs/SubmitViolationsUtils';
import ViolationsUtils from '@libs/Violations/ViolationsUtils';

import React from 'react';

import useConfirmModal from './useConfirmModal';
import useConfirmPendingRTERAndProceed from './useConfirmPendingRTERAndProceed';
import {useCurrencyListActions} from './useCurrencyList';
import useLocalize from './useLocalize';

/**
 * Hook that returns a callback to confirm a report's submit-blocking violations before proceeding with submission.
 *
 * A generic (non-seven-day) pending RTER violation predates #101213 and is unrelated to it, so it is delegated
 * unchanged to the original standalone useConfirmPendingRTERAndProceed prompt. Everything #101213 added —
 * seven-day-hold, rejected expenses, a whole-report rejection, and any other un-dismissed violation — is shown
 * together afterward in a single bulleted modal that offers to resolve the ones with a known resolution before
 * submitting anyway.
 */
function useConfirmViolationsAndProceed(violationsSummary: SubmitViolationsSummary, onMarkPendingRTERTransactionsAsCash: () => void, onMarkRejectedTransactionsAsResolved: () => void) {
    const {showConfirmModal} = useConfirmModal();
    const {translate, dateFnsLocale} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();

    const {hasSevenDayHoldViolation, hasGenericPendingRTERViolation, hasRejectedViolation, hasReportBeenRejected, otherViolations} = violationsSummary;
    const hasAnyViolation = hasAnySubmitViolation(violationsSummary);
    const confirmPendingRTERAndProceed = useConfirmPendingRTERAndProceed(hasGenericPendingRTERViolation, onMarkPendingRTERTransactionsAsCash);

    const confirmNewViolationsAndProceed = (onProceed: () => void) => {
        if (!hasAnyViolation) {
            onProceed();
            return;
        }

        const promptLines: string[] = [];
        if (hasSevenDayHoldViolation) {
            promptLines.push(translate('iou.sevenDayHoldSubmitDescription'));
        }
        if (hasRejectedViolation || hasReportBeenRejected) {
            promptLines.push(translate('iou.rejectedExpenseSubmitDescription'));
        }
        for (const violation of otherViolations) {
            const violationTranslation = ViolationsUtils.getViolationTranslation({violation, translate, dateFnsLocale, convertToDisplayString});
            if (!violationTranslation) {
                continue;
            }
            promptLines.push(violationTranslation);
        }

        showConfirmModal({
            title: translate('iou.submitReportPolicyViolationsTitle'),
            prompt: React.createElement(SubmitViolationsBulletList, {header: translate('iou.submitReportPolicyViolationsDescription'), items: promptLines}),
            confirmText: translate('iou.submitAnyway'),
            cancelText: translate('common.cancel'),
        }).then((result) => {
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }
            if (hasSevenDayHoldViolation) {
                onMarkPendingRTERTransactionsAsCash();
            }
            if (hasRejectedViolation) {
                onMarkRejectedTransactionsAsResolved();
            }
            onProceed();
        });
    };

    return (onProceed: () => void) => confirmPendingRTERAndProceed(() => confirmNewViolationsAndProceed(onProceed));
}

export default useConfirmViolationsAndProceed;
