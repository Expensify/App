import {ModalActions} from '@components/Modal/Global/ModalContext';

import {getReportSubmitViolationSummary, hasAnySubmitViolation, shouldResolveAcknowledged} from '@libs/Violations/getReportSubmitViolationSummary';
import showSubmitViolationsConfirmModal from '@libs/Violations/showSubmitViolationsConfirmModal';

import {markPendingRTERTransactionsAsCash} from '@userActions/Transaction';

import type {Policy, Report, ReportAction, Transaction, TransactionViolations} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import useConfirmModal from './useConfirmModal';
import {useCurrencyListActions} from './useCurrencyList';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useLocalize from './useLocalize';

/**
 * Hook that returns a callback to confirm any report violations (rejected expenses, pending RTER
 * card-match, and other policy violations) before proceeding with a report submission.
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
        if (!hasAnySubmitViolation(summary)) {
            onProceed();
            return;
        }

        showSubmitViolationsConfirmModal({summary, showConfirmModal, translate, dateFnsLocale, convertToDisplayString, shouldShowMarkAsDoneCopy}).then((result) => {
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }
            if (summary.hasPendingCardMatch) {
                markPendingRTERTransactionsAsCash(transactions, violationsCollection, reportActions);
            }
            onProceed(shouldResolveAcknowledged(summary));
        });
    };
}

export default useConfirmSubmitReportViolations;
