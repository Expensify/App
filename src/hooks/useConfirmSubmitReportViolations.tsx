import {ModalActions} from '@components/Modal/Global/ModalContext';
import SubmitViolationsList from '@components/SubmitViolationsList';

import showConfirmModalAfterMoreMenuDismiss from '@libs/showConfirmModalAfterMoreMenuDismiss';
import {buildSubmitViolationBullets, getReportSubmitViolationSummary} from '@libs/Violations/getReportSubmitViolationSummary';

import {markPendingRTERTransactionsAsCash} from '@userActions/Transaction';

import CONST from '@src/CONST';
import type {Policy, Report, ReportAction, Transaction, TransactionViolations} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import React from 'react';

import useConfirmModal from './useConfirmModal';
import {useCurrencyListActions} from './useCurrencyList';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
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
    policy: OnyxEntry<Policy>,
    shouldShowMarkAsDoneCopy = false,
) {
    const {showConfirmModal} = useConfirmModal();
    const {translate, dateFnsLocale} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const {accountID: currentUserAccountID, email: currentUserEmail} = useCurrentUserPersonalDetails();

    return (onProceed: (shouldResolveAcknowledgedViolations?: boolean) => void) => {
        const summary = getReportSubmitViolationSummary(transactions, violationsCollection, report, policy, currentUserEmail ?? '', currentUserAccountID);
        if (!summary.hasRejectedExpense && !summary.hasReportBeenRejected && !summary.hasPendingCardMatch && summary.otherViolations.size === 0) {
            onProceed();
            return;
        }

        const bullets = buildSubmitViolationBullets({summary, translate, dateFnsLocale, convertToDisplayString});
        // iOS can't present this modal while a just-closed popover (e.g. the submit-to popover) is still animating
        // away, so defer until that transition finishes - same workaround the bulk-submit path already uses.
        showConfirmModalAfterMoreMenuDismiss(showConfirmModal, {
            title: translate(shouldShowMarkAsDoneCopy ? 'iou.confirmSubmitReportViolations.titleMarkAsDone' : 'iou.confirmSubmitReportViolations.title'),
            subtitle: translate(shouldShowMarkAsDoneCopy ? 'iou.confirmSubmitReportViolations.descriptionMarkAsDone' : 'iou.confirmSubmitReportViolations.description'),
            prompt: <SubmitViolationsList violations={bullets} />,
            confirmText: translate(shouldShowMarkAsDoneCopy ? 'common.markAsDoneAnyway' : 'common.submitAnyway'),
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
