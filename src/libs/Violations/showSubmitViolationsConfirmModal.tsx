import type {LocaleContextProps} from '@components/LocaleContextProvider';
import SubmitViolationsList from '@components/SubmitViolationsList';

import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';

import showConfirmModalAfterMoreMenuDismiss from '@libs/showConfirmModalAfterMoreMenuDismiss';

import CONST from '@src/CONST';

import type {getReportSubmitViolationSummary} from './getReportSubmitViolationSummary';

import {buildSubmitViolationBullets} from './getReportSubmitViolationSummary';

type ShowConfirmModal = Parameters<typeof showConfirmModalAfterMoreMenuDismiss>[0];
type ReportSubmitViolationSummary = ReturnType<typeof getReportSubmitViolationSummary>;

type ShowSubmitViolationsConfirmModalParams = {
    summary: ReportSubmitViolationSummary;
    showConfirmModal: ShowConfirmModal;
    translate: LocaleContextProps['translate'];
    dateFnsLocale: LocaleContextProps['dateFnsLocale'];
    convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'];
    shouldShowMarkAsDoneCopy?: boolean;
};

/**
 * Shows the "Submit report?" (or "Mark as done?") confirmation modal for a violation summary. Shared by every
 * Submit entry point so the copy, button style, and iOS popover-dismiss workaround can't drift between them.
 */
function showSubmitViolationsConfirmModal({summary, showConfirmModal, translate, dateFnsLocale, convertToDisplayString, shouldShowMarkAsDoneCopy}: ShowSubmitViolationsConfirmModalParams) {
    const bullets = buildSubmitViolationBullets({summary, translate, dateFnsLocale, convertToDisplayString});

    return showConfirmModalAfterMoreMenuDismiss(showConfirmModal, {
        title: translate(shouldShowMarkAsDoneCopy ? 'iou.confirmSubmitReportViolations.titleMarkAsDone' : 'iou.confirmSubmitReportViolations.title'),
        subtitle: translate(shouldShowMarkAsDoneCopy ? 'iou.confirmSubmitReportViolations.descriptionMarkAsDone' : 'iou.confirmSubmitReportViolations.description'),
        prompt: <SubmitViolationsList violations={bullets} />,
        confirmText: translate(shouldShowMarkAsDoneCopy ? 'common.markAsDoneAnyway' : 'common.submitAnyway'),
        cancelText: translate('common.cancel'),
        buttonVariant: CONST.BUTTON_VARIANT.DANGER,
        shouldEnablePromptScroll: true,
    });
}

export default showSubmitViolationsConfirmModal;
