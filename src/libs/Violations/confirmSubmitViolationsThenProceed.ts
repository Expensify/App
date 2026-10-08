import type {LocaleContextProps} from '@components/LocaleContextProvider';
import {ModalActions} from '@components/Modal/Global/ModalContext';

import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';

import type showConfirmModalAfterMoreMenuDismiss from '@libs/showConfirmModalAfterMoreMenuDismiss';

import type {getReportSubmitViolationSummary} from './getReportSubmitViolationSummary';

import {hasAnySubmitViolation, shouldResolveAcknowledgedViolations} from './getReportSubmitViolationSummary';
import showSubmitViolationsConfirmModal from './showSubmitViolationsConfirmModal';

type ShowConfirmModal = Parameters<typeof showConfirmModalAfterMoreMenuDismiss>[0];
type ReportSubmitViolationSummary = ReturnType<typeof getReportSubmitViolationSummary>;

type ConfirmSubmitViolationsThenProceedParams = {
    summary: ReportSubmitViolationSummary;
    showConfirmModal: ShowConfirmModal;
    translate: LocaleContextProps['translate'];
    dateFnsLocale: LocaleContextProps['dateFnsLocale'];
    convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'];
    shouldShowMarkAsDoneCopy?: boolean;
    /** Called immediately when there's nothing to confirm, or once the user confirms the violations modal. */
    onProceed: (shouldResolveAcknowledgedViolations?: boolean) => void;
};

/**
 * Shared "confirm violations, then proceed" sequence: skips the modal when the summary has nothing to show,
 * otherwise shows it and only proceeds if the user confirms - cancelling always just returns to the report so
 * the user can fix violations manually. Every violation other than a rejected expense, including a pending card
 * match, stays on the expense even after confirming; only the user's own "Mark as cash" action resolves that
 * one, and RTER's own backend logic decides separately whether a card-matched expense can still submit. Every
 * Submit entry point uses this so the sequence can't drift between them.
 */
function confirmSubmitViolationsThenProceed({
    summary,
    showConfirmModal,
    translate,
    dateFnsLocale,
    convertToDisplayString,
    shouldShowMarkAsDoneCopy,
    onProceed,
}: ConfirmSubmitViolationsThenProceedParams) {
    if (!hasAnySubmitViolation(summary)) {
        onProceed();
        return;
    }

    showSubmitViolationsConfirmModal({summary, showConfirmModal, translate, dateFnsLocale, convertToDisplayString, shouldShowMarkAsDoneCopy}).then((result) => {
        if (result.action !== ModalActions.CONFIRM) {
            return;
        }
        onProceed(shouldResolveAcknowledgedViolations(summary));
    });
}

export default confirmSubmitViolationsThenProceed;
