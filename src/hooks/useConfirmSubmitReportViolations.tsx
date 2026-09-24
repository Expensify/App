import {ModalActions} from '@components/Modal/Global/ModalContext';
import SubmitViolationsList from '@components/SubmitViolationsList';

import {useCurrencyListActions} from '@hooks/useCurrencyList';

import {buildSubmitViolationBullets, getReportSubmitViolationSummary} from '@libs/Violations/getReportSubmitViolationSummary';

import {markPendingRTERTransactionsAsCash} from '@userActions/Transaction';

import CONST from '@src/CONST';
import type {Report, ReportAction, Transaction, TransactionViolations} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import React from 'react';

import useConfirmModal from './useConfirmModal';
import useLocalize from './useLocalize';

/**
 * Hook that returns a callback to confirm any report violations (rejected expenses, pending RTER
 * card-match, and other policy violations) before proceeding with a report submission. Replaces
 * useConfirmPendingRTERAndProceed, which only covered the RTER case.
 */
function useConfirmSubmitReportViolations(
    transactions: Array<OnyxEntry<Transaction>>,
    violationsCollection: OnyxCollection<TransactionViolations>,
    reportActions: ReportAction[],
    report: OnyxEntry<Report>,
) {
    const {showConfirmModal} = useConfirmModal();
    const {translate, dateFnsLocale} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();

    return (onProceed: (shouldResolveAcknowledgedViolations?: boolean) => void) => {
        const summary = getReportSubmitViolationSummary(transactions, violationsCollection, report);
        if (!summary.hasRejectedExpense && !summary.hasReportBeenRejected && !summary.hasPendingCardMatch && summary.otherViolations.size === 0) {
            onProceed();
            return;
        }

        const bullets = buildSubmitViolationBullets({summary, translate, dateFnsLocale, convertToDisplayString});
        showConfirmModal({
            title: translate('iou.confirmSubmitReportViolations.title'),
            subtitle: translate('iou.confirmSubmitReportViolations.description'),
            prompt: <SubmitViolationsList violations={bullets} />,
            confirmText: translate('common.submitAnyway'),
            cancelText: translate('common.cancel'),
            buttonVariant: CONST.BUTTON_VARIANT.DANGER,
            shouldEnablePromptScroll: true,
        }).then((result) => {
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }
            if (summary.hasPendingCardMatch) {
                markPendingRTERTransactionsAsCash(transactions, violationsCollection, reportActions);
            }
            onProceed(summary.hasRejectedExpense || summary.hasPendingCardMatch);
        });
    };
}

export default useConfirmSubmitReportViolations;
