import truncate from 'lodash/truncate';
import {useMemo} from 'react';
import type {OnyxEntry, OnyxInputValue} from 'react-native-onyx';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import {isMessageDeleted} from '@libs/ReportActionsUtils';
import {getTransactionDetails, isPaidGroupPolicy, isReportApproved, isSettled as isSettledReportUtils} from '@libs/ReportUtils';
import type {TransactionDetails} from '@libs/ReportUtils';
import StringUtils from '@libs/StringUtils';
import {
    hasMissingSmartscanFields,
    hasNoticeTypeViolation as hasNoticeTypeViolationTransactionUtils,
    hasReceipt as hasReceiptTransactionUtils,
    hasViolation as hasViolationTransactionUtils,
    hasWarningTypeViolation as hasWarningTypeViolationTransactionUtils,
    isCardTransaction as isCardTransactionTransactionUtils,
    isFetchingWaypointsFromServer as isFetchingWaypointsFromServerTransactionUtils,
    isOnHold as isOnHoldTransactionUtils,
    isReceiptBeingScanned,
    removeSettledAndApprovedTransactions,
} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

function useTransactionPreviewConditionals({
    iouReport,
    transaction,
    translate,
    action,
    isPolicyExpenseChat,
    isBillSplit,
    violations,
}: {
    iouReport: OnyxInputValue<OnyxTypes.Report> | undefined;
    transaction: OnyxEntry<OnyxTypes.Transaction>;
    translate: LocaleContextProps['translate'];
    action: OnyxTypes.ReportAction;
    isPolicyExpenseChat: boolean;
    isBillSplit: boolean;
    violations: OnyxTypes.TransactionViolations;
}) {
    const hasReceipt = hasReceiptTransactionUtils(transaction);
    const isScanning = hasReceipt && isReceiptBeingScanned(transaction);
    const allDuplicates = useMemo(() => violations?.find((violation) => violation.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)?.data?.duplicates ?? [], [violations]);

    // Remove settled transactions from duplicates
    const duplicates = useMemo(() => removeSettledAndApprovedTransactions(allDuplicates), [allDuplicates]);

    const {amount: requestAmount, comment: requestComment, merchant, tag, category} = useMemo<Partial<TransactionDetails>>(() => getTransactionDetails(transaction) ?? {}, [transaction]);

    const requestMerchant = truncate(merchant, {length: CONST.REQUEST_PREVIEW.MAX_LENGTH});
    const description = truncate(StringUtils.lineBreaksToSpaces(requestComment), {length: CONST.REQUEST_PREVIEW.MAX_LENGTH});

    const isSettled = isSettledReportUtils(iouReport?.reportID);
    const isApproved = isReportApproved({report: iouReport});
    const isSettlementOrApprovalPartial = !!iouReport?.pendingFields?.partial;

    const hasViolations = hasViolationTransactionUtils(transaction, violations, true);
    const hasNoticeTypeViolations = hasNoticeTypeViolationTransactionUtils(transaction?.transactionID, violations, true) && isPaidGroupPolicy(iouReport as OnyxEntry<OnyxTypes.Report>);
    const hasWarningTypeViolations = hasWarningTypeViolationTransactionUtils(transaction?.transactionID, violations, true);
    const hasFieldErrors = hasMissingSmartscanFields(transaction);

    const isFetchingWaypointsFromServer = isFetchingWaypointsFromServerTransactionUtils(transaction);
    const isCardTransaction = isCardTransactionTransactionUtils(transaction);

    const isOnHold = isOnHoldTransactionUtils(transaction);
    const isFullySettled = isSettled && !isSettlementOrApprovalPartial;
    const isFullyApproved = isApproved && !isSettlementOrApprovalPartial;

    const shouldDisableOnPress = isBillSplit && isEmptyObject(transaction);
    const shouldShowSkeleton = isEmptyObject(transaction) && !isMessageDeleted(action) && action.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    const shouldShowTag = !!tag && isPolicyExpenseChat;
    const shouldShowCategory = !!category && isPolicyExpenseChat;
    const shouldShowRBR = hasNoticeTypeViolations || hasWarningTypeViolations || hasViolations || hasFieldErrors || (!isFullySettled && !isFullyApproved && isOnHold);
    const showCashOrCard = isCardTransaction ? translate('iou.card') : translate('iou.cash');
    // When there are no settled transactions in duplicates, show the "Keep this one" button
    const shouldShowKeepButton = !!(allDuplicates.length && duplicates.length && allDuplicates.length === duplicates.length);
    const shouldShowSplitShare = isBillSplit && !!requestAmount && requestAmount > 0;

    /*
 Show the merchant for IOUs and expenses only if:
 - the merchant is not empty, is custom, or is not related to scanning smartscan;
 - the expense is not a distance expense with a pending route and amount = 0 - in this case,
   the merchant says: "Route pending...", which is already shown in the amount field;
*/
    const shouldShowMerchant =
        !!requestMerchant &&
        requestMerchant !== CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT &&
        requestMerchant !== CONST.TRANSACTION.DEFAULT_MERCHANT &&
        !(isFetchingWaypointsFromServer && !requestAmount);
    const shouldShowDescription = !!description && !shouldShowMerchant && !isScanning;

    return {
        shouldDisableOnPress,
        shouldShowSkeleton,
        shouldShowTag,
        showCashOrCard,
        shouldShowRBR,
        shouldShowCategory,
        shouldShowKeepButton,
        shouldShowSplitShare,
        shouldShowMerchant,
        shouldShowDescription,
    };
}

export default useTransactionPreviewConditionals;
