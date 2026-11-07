/** Reuses the submit warning's bullet list without resolving violations when approving. */
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import SubmitViolationsList from '@components/SubmitViolationsList';

import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';

import showConfirmModalAfterMoreMenuDismiss from '@libs/showConfirmModalAfterMoreMenuDismiss';

import CONST from '@src/CONST';

import type getReportApproveViolationSummary from './getReportApproveViolationSummary';

import {buildSubmitViolationBullets, hasAnySubmitViolation} from './getReportSubmitViolationSummary';

type ConfirmApproveViolationsThenProceedParams = {
    summary: ReturnType<typeof getReportApproveViolationSummary>;
    showConfirmModal: Parameters<typeof showConfirmModalAfterMoreMenuDismiss>[0];
    translate: LocaleContextProps['translate'];
    dateFnsLocale: LocaleContextProps['dateFnsLocale'];
    convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'];
    onProceed: () => void;
};

function confirmApproveViolationsThenProceed({summary, showConfirmModal, translate, dateFnsLocale, convertToDisplayString, onProceed}: ConfirmApproveViolationsThenProceedParams) {
    if (!hasAnySubmitViolation(summary)) {
        onProceed();
        return;
    }

    const bullets = buildSubmitViolationBullets({summary, translate, dateFnsLocale, convertToDisplayString});
    showConfirmModalAfterMoreMenuDismiss(showConfirmModal, {
        title: translate('iou.confirmApproveReportViolations.title'),
        subtitle: translate('iou.confirmApproveReportViolations.description'),
        prompt: <SubmitViolationsList violations={bullets} />,
        confirmText: translate('common.approveAnyway'),
        cancelText: translate('common.cancel'),
        buttonVariant: CONST.BUTTON_VARIANT.DANGER,
        shouldEnablePromptScroll: true,
    }).then((result) => {
        if (result.action !== ModalActions.CONFIRM) {
            return;
        }
        onProceed();
    });
}

export default confirmApproveViolationsThenProceed;
