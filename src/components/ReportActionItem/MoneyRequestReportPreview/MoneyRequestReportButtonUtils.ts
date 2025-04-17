import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import {
    getMoneyRequestSpendBreakdown,
    getNonHeldAndFullAmount,
    hasHeldExpenses as hasHeldExpensesReportUtils,
    hasOnlyHeldExpenses as hasOnlyHeldExpensesReportUtils,
    hasUpdatedTotal,
} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {Policy, Report} from '@src/types/onyx';

const IOU_PREVIEW_BUTTON = {
    PAY: CONST.REPORT.PRIMARY_ACTIONS.PAY,
    APPROVE: CONST.REPORT.PRIMARY_ACTIONS.APPROVE,
    EXPORT: CONST.REPORT.PRIMARY_ACTIONS.EXPORT_TO_ACCOUNTING,
    REVIEW: CONST.REPORT.PRIMARY_ACTIONS.REVIEW_DUPLICATES,
    SUBMIT: CONST.REPORT.PRIMARY_ACTIONS.SUBMIT,
    NONE: undefined,
};

const getTotalAmountOfButton = (report: OnyxEntry<Report>, policy: OnyxEntry<Policy>, buttonType: ValueOf<typeof IOU_PREVIEW_BUTTON>) => {
    if (buttonType === IOU_PREVIEW_BUTTON.NONE || buttonType === IOU_PREVIEW_BUTTON.EXPORT) {
        return '';
    }

    const {nonHeldAmount, hasValidNonHeldAmount} = getNonHeldAndFullAmount(report, buttonType === IOU_PREVIEW_BUTTON.PAY);
    const hasOnlyHeldExpenses = hasOnlyHeldExpensesReportUtils(report?.reportID);
    const canAllowSettlement = hasUpdatedTotal(report, policy);
    const {totalDisplaySpend, reimbursableSpend} = getMoneyRequestSpendBreakdown(report);

    if (buttonType === IOU_PREVIEW_BUTTON.PAY) {
        if (hasOnlyHeldExpenses) {
            return '';
        }

        // We shouldn't display the nonHeldAmount as the default option if it's not valid since we cannot pay partially in this case
        if (hasHeldExpensesReportUtils(report?.reportID) && canAllowSettlement && hasValidNonHeldAmount) {
            return nonHeldAmount;
        }

        return convertToDisplayString(reimbursableSpend, report?.currency);
    }

    return convertToDisplayString(totalDisplaySpend, report?.currency);
};

const getMoneyRequestReportButtonType = ({
    shouldShowSubmitButton,
    shouldShowExportIntegrationButton,
    shouldShowApproveButton,
    shouldShowSettlementButton,
    shouldShowPayButton,
    shouldShowRBR,
}: {
    shouldShowSubmitButton: boolean;
    shouldShowExportIntegrationButton: boolean;
    shouldShowRBR: boolean;
    shouldShowSettlementButton: boolean;
    shouldShowPayButton: boolean;
    shouldShowApproveButton: boolean;
}): ValueOf<typeof IOU_PREVIEW_BUTTON> => {
    const shouldShowSettlementWithoutRBR = shouldShowSettlementButton && !shouldShowRBR;
    const shouldShowSettlementOrRBR = shouldShowSettlementButton || shouldShowRBR;
    const shouldShowSettlementOrExport = shouldShowSettlementButton || shouldShowExportIntegrationButton;

    if (shouldShowSettlementWithoutRBR && shouldShowPayButton) {
        return IOU_PREVIEW_BUTTON.PAY;
    }
    if (shouldShowSettlementWithoutRBR && shouldShowApproveButton) {
        return IOU_PREVIEW_BUTTON.APPROVE;
    }

    if (!shouldShowSettlementOrRBR && shouldShowExportIntegrationButton) {
        return IOU_PREVIEW_BUTTON.EXPORT;
    }

    if (shouldShowRBR && !shouldShowSubmitButton && shouldShowSettlementOrExport) {
        return IOU_PREVIEW_BUTTON.REVIEW;
    }

    if (shouldShowSubmitButton) {
        return IOU_PREVIEW_BUTTON.SUBMIT;
    }

    return IOU_PREVIEW_BUTTON.NONE;
};

export {getTotalAmountOfButton, getMoneyRequestReportButtonType, IOU_PREVIEW_BUTTON};
