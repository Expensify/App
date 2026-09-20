import {ModalActions} from '@components/Modal/Global/ModalContext';

import {buildSubmitViolationBullets, getReportSubmitViolationSummary} from '@libs/Violations/getReportSubmitViolationSummary';

import {markPendingRTERTransactionsAsCash} from '@userActions/Transaction';

import CONST from '@src/CONST';
import type {ReportAction, Transaction, TransactionViolations} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {useCallback} from 'react';

import useConfirmModal from './useConfirmModal';
import useLocalize from './useLocalize';

/**
 * Hook that returns a callback to confirm any report violations (rejected expenses, pending RTER
 * card-match, and other policy violations) before proceeding with a report submission. Replaces
 * useConfirmPendingRTERAndProceed, which only covered the RTER case.
 */
function useConfirmSubmitReportViolations(transactions: Array<OnyxEntry<Transaction>>, violationsCollection: OnyxCollection<TransactionViolations>, reportActions: ReportAction[]) {
    const {showConfirmModal} = useConfirmModal();
    const {translate} = useLocalize();

    return useCallback(
        (onProceed: (shouldResolveAcknowledgedViolations?: boolean) => void) => {
            const summary = getReportSubmitViolationSummary(transactions, violationsCollection);
            if (!summary.hasRejectedExpense && !summary.hasPendingCardMatch && summary.otherViolationNames.size === 0) {
                onProceed();
                return;
            }

            const bullets = buildSubmitViolationBullets(summary, translate);
            showConfirmModal({
                title: translate('iou.confirmSubmitReportViolations.title'),
                subtitle: translate('iou.confirmSubmitReportViolations.description'),
                prompt: bullets.map((bullet) => `${CONST.DOT_SEPARATOR} ${bullet}`).join('\n'),
                confirmText: translate('common.submitAnyway'),
                cancelText: translate('common.cancel'),
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
        },
        [transactions, violationsCollection, reportActions, showConfirmModal, translate],
    );
}

export default useConfirmSubmitReportViolations;
