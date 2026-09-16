import {ModalActions} from '@components/Modal/Global/ModalContext';
import SubmitViolationsBulletList from '@components/SubmitViolationsBulletList';

import type {SubmitViolationsSummary} from '@libs/TransactionUtils';
import {hasAnySubmitViolation} from '@libs/TransactionUtils';
import ViolationsUtils from '@libs/Violations/ViolationsUtils';

import React from 'react';

import useConfirmModal from './useConfirmModal';
import {useCurrencyListActions} from './useCurrencyList';
import useLocalize from './useLocalize';

/**
 * Hook that returns a callback to confirm a report's submit-blocking violations before proceeding with submission.
 * If the report has any violation, a confirmation modal lists them (dedicated copy for seven-day-hold and rejected
 * expenses, the real violation text for everything else) and offers to resolve the ones that have a known
 * resolution before submitting anyway.
 */
function useConfirmViolationsAndProceed(violationsSummary: SubmitViolationsSummary, onMarkPendingRTERTransactionsAsCash: () => void, onMarkRejectedTransactionsAsResolved: () => void) {
    const {showConfirmModal} = useConfirmModal();
    const {translate, dateFnsLocale} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();

    const {hasSevenDayHoldViolation, hasGenericPendingRTERViolation, hasRejectedViolation, hasReportBeenRejected, otherViolations} = violationsSummary;
    const hasAnyViolation = hasAnySubmitViolation(violationsSummary);

    return (onProceed: () => void) => {
        if (!hasAnyViolation) {
            onProceed();
            return;
        }

        const promptLines: string[] = [];
        if (hasSevenDayHoldViolation) {
            promptLines.push(translate('iou.sevenDayHoldSubmitDescription'));
        }
        if (hasGenericPendingRTERViolation) {
            promptLines.push(translate('iou.pendingMatchSubmitDescription'));
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
            title: translate('iou.pendingMatchSubmitTitle'),
            prompt: React.createElement(SubmitViolationsBulletList, {header: translate('iou.submitReportPolicyViolationsDescription'), items: promptLines}),
            confirmText: translate('iou.submitAnyway'),
            cancelText: translate('common.cancel'),
        }).then((result) => {
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }
            if (hasSevenDayHoldViolation || hasGenericPendingRTERViolation) {
                onMarkPendingRTERTransactionsAsCash();
            }
            if (hasRejectedViolation) {
                onMarkRejectedTransactionsAsResolved();
            }
            onProceed();
        });
    };
}

export default useConfirmViolationsAndProceed;
