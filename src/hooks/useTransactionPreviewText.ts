import {useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import DateUtils from '@libs/DateUtils';
import {getOriginalMessage, isMoneyRequestAction as isMoneyRequestActionReportActionsUtils} from '@libs/ReportActionsUtils';
import {canEditMoneyRequest, getTransactionDetails, isPaidGroupPolicy, isPaidGroupPolicyExpenseReport, isReportApproved, isSettled as isSettledReportUtils} from '@libs/ReportUtils';
import type {TransactionDetails} from '@libs/ReportUtils';
import {
    getFormattedCreated,
    hasMissingSmartscanFields,
    hasNoticeTypeViolation as hasNoticeTypeViolationTransactionUtils,
    hasPendingRTERViolation,
    hasReceipt as hasReceiptTransactionUtils,
    isAmountMissing as isAmountMissingTransactionUtils,
    isCardTransaction as isCardTransactionTransactionUtils,
    isCreatedMissing,
    isDistanceRequest as isDistanceRequestTransactionUtils,
    isFetchingWaypointsFromServer as isFetchingWaypointsFromServerTransactionUtils,
    isMerchantMissing as isMerchantMissingTransactionUtils,
    isOnHold as isOnHoldTransactionUtils,
    isPending,
    isPerDiemRequest as isPerDiemRequestTransactionUtils,
    isReceiptBeingScanned,
} from '@libs/TransactionUtils';
import ViolationsUtils from '@libs/Violations/ViolationsUtils';
import CONST from '@src/CONST';
import type {OriginalMessageIOU, Report, ReportAction, Transaction, TransactionViolations} from '@src/types/onyx';

function useTransactionPreviewText({
    iouReport,
    transaction,
    translate,
    action,
    shouldShowRBR,
    isBillSplit,
    violations,
}: {
    iouReport: OnyxEntry<Report>;
    transaction: OnyxEntry<Transaction>;
    translate: LocaleContextProps['translate'];
    action: ReportAction;
    shouldShowRBR: boolean;
    isBillSplit: boolean;
    violations: TransactionViolations;
}) {
    const isFetchingWaypointsFromServer = isFetchingWaypointsFromServerTransactionUtils(transaction);
    const isOnHold = isOnHoldTransactionUtils(transaction);
    const isCardTransaction = isCardTransactionTransactionUtils(transaction);
    const isSettled = isSettledReportUtils(iouReport?.reportID);
    const isSettlementOrApprovalPartial = !!iouReport?.pendingFields?.partial;
    const isPartialHold = isSettlementOrApprovalPartial && isOnHold;
    const isDistanceRequest = isDistanceRequestTransactionUtils(transaction);
    const isPerDiemRequest = isPerDiemRequestTransactionUtils(transaction);
    // We don't use isOnHold because it's true for duplicated transaction too and we only want to show hold message if the transaction is truly on hold
    const shouldShowHoldMessage = !(isSettled && !isSettlementOrApprovalPartial) && !!transaction?.comment?.hold;
    const showCashOrCard = isCardTransaction ? translate('iou.card') : translate('iou.cash');
    const hasReceipt = hasReceiptTransactionUtils(transaction);
    const isScanning = hasReceipt && isReceiptBeingScanned(transaction);
    const hasFieldErrors = hasMissingSmartscanFields(transaction);
    const isMoneyRequestAction = isMoneyRequestActionReportActionsUtils(action);
    const hasNoticeTypeViolations = hasNoticeTypeViolationTransactionUtils(transaction?.transactionID, violations, true) && isPaidGroupPolicy(iouReport);

    const {amount: requestAmount, currency: requestCurrency} = useMemo<Partial<TransactionDetails>>(() => getTransactionDetails(transaction) ?? {}, [transaction]);

    const getSettledMessage = (): string => {
        if (isCardTransaction) {
            return translate('common.done');
        }
        return translate('iou.settledExpensify');
    };

    const getRBRmessage = () => {
        if (!shouldShowRBR || !transaction) {
            return '';
        }

        if (shouldShowHoldMessage) {
            return translate('violations.hold');
        }

        const firstViolation = violations?.at(0);

        if (firstViolation) {
            const canEdit = isMoneyRequestAction && canEditMoneyRequest(action, transaction);
            const violationMessage = ViolationsUtils.getViolationTranslation(firstViolation, translate, canEdit);
            const violationsCount = violations?.filter((v) => v.type === CONST.VIOLATION_TYPES.VIOLATION).length ?? 0;
            const isTooLong = violationsCount > 1 || violationMessage.length > 15;
            const hasViolationsAndFieldErrors = violationsCount > 0 && hasFieldErrors;

            return isTooLong || hasViolationsAndFieldErrors ? translate('violations.reviewRequired') : violationMessage;
        }

        if (hasFieldErrors) {
            const isMerchantMissing = isMerchantMissingTransactionUtils(transaction);
            const isAmountMissing = isAmountMissingTransactionUtils(transaction);
            if (isAmountMissing && isMerchantMissing) {
                return translate('violations.reviewRequired');
            }
            if (isAmountMissing) {
                return translate('iou.missingAmount');
            }
            if (isMerchantMissing) {
                return translate('iou.missingMerchant');
            }
        }

        return '';
    };

    const getPreviewHeaderText = (): string => {
        let message = showCashOrCard;

        if (isDistanceRequest) {
            message = translate('common.distance');
        } else if (isPerDiemRequest) {
            message = translate('common.perDiem');
        } else if (isScanning) {
            message = translate('common.receipt');
        } else if (isBillSplit) {
            message = translate('iou.split');
        }

        if (!isCreatedMissing(transaction)) {
            const created = getFormattedCreated(transaction);
            const date = DateUtils.formatWithUTCTimeZone(created, DateUtils.doesDateBelongToAPastYear(created) ? CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT : CONST.DATE.MONTH_DAY_ABBR_FORMAT);
            message = `${date} ${CONST.DOT_SEPARATOR} ${message}`;
        }

        if (isPending(transaction)) {
            message += ` ${CONST.DOT_SEPARATOR} ${translate('iou.pending')}`;
        }

        if (hasPendingRTERViolation(violations)) {
            message += ` ${CONST.DOT_SEPARATOR} ${translate('iou.pendingMatch')}`;
        }

        if (isSettled && !iouReport?.isCancelledIOU && !isPartialHold) {
            message += ` ${CONST.DOT_SEPARATOR} ${getSettledMessage()}`;
            return message;
        }

        if (shouldShowRBR && transaction) {
            return message;
        }

        if (hasNoticeTypeViolations && transaction && !isReportApproved({report: iouReport}) && !isSettledReportUtils(iouReport?.reportID)) {
            message += ` ${CONST.DOT_SEPARATOR} ${translate('violations.reviewRequired')}`;
        } else if (isPaidGroupPolicyExpenseReport(iouReport) && isReportApproved({report: iouReport}) && !isSettledReportUtils(iouReport?.reportID) && !isPartialHold) {
            message += ` ${CONST.DOT_SEPARATOR} ${translate('iou.approved')}`;
        } else if (iouReport?.isCancelledIOU) {
            message += ` ${CONST.DOT_SEPARATOR} ${translate('iou.canceled')}`;
        } else if (shouldShowHoldMessage) {
            message += ` ${CONST.DOT_SEPARATOR} ${translate('violations.hold')}`;
        }
        return message;
    };

    const getDisplayAmountText = (): string => {
        if (isScanning) {
            return translate('iou.receiptStatusTitle');
        }

        if (isFetchingWaypointsFromServer && !requestAmount) {
            return translate('iou.fieldPending');
        }

        return convertToDisplayString(requestAmount, requestCurrency);
    };

    const getDisplayDeleteAmountText = (): string => {
        const iouOriginalMessage: OnyxEntry<OriginalMessageIOU> = isMoneyRequestActionReportActionsUtils(action) ? getOriginalMessage(action) ?? undefined : undefined;
        return convertToDisplayString(iouOriginalMessage?.amount, iouOriginalMessage?.currency);
    };

    // const displayAmount = isDeleted ? getDisplayDeleteAmountText() : getDisplayAmountText();
    return {
        RBRmessage: getRBRmessage(),
        displayAmountText: getDisplayAmountText(),
        displayDeleteAmountText: getDisplayDeleteAmountText(),
        previewHeaderText: getPreviewHeaderText(),
    };
}

export default useTransactionPreviewText;
