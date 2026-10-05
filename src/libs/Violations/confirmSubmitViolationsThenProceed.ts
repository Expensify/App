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
    /** Called once the user confirms, only when the summary has a pending card match to resolve as cash. */
    onMarkPendingCardMatchAsCash: () => void;
    /** Called immediately when there's nothing to confirm, or once the user confirms the violations modal. */
    onProceed: (shouldResolveAcknowledgedViolations?: boolean) => void;
};

/**
 * Shared "confirm violations, then proceed" sequence: skips the modal when the summary has nothing to show,
 * otherwise shows it and - only if the user confirms - marks any pending card match as cash before calling
 * onProceed with the resolved flag. Every Submit entry point uses this so the sequence can't drift between them.
 */
function confirmSubmitViolationsThenProceed({
    summary,
    showConfirmModal,
    translate,
    dateFnsLocale,
    convertToDisplayString,
    shouldShowMarkAsDoneCopy,
    onMarkPendingCardMatchAsCash,
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
        if (summary.hasPendingCardMatch) {
            onMarkPendingCardMatchAsCash();
        }
        onProceed(shouldResolveAcknowledgedViolations(summary));
    });
}

export default confirmSubmitViolationsThenProceed;
