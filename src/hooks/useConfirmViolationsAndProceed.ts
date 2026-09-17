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
 * Confirms a report's submit-blocking violations before proceeding with submission. Generic pending RTER predates
 * #101213, so it keeps the original standalone useConfirmPendingRTERAndProceed prompt; everything #101213 added
 * (seven-day-hold, rejected expenses, report rejection, other violations) shows afterward in one bulleted modal.
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
