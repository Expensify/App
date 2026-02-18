import {deepEqual} from 'fast-equals';
import React, {useMemo, useRef} from 'react';
import {useCurrentReportIDState} from '@hooks/useCurrentReportID';
import useGetExpensifyCardFromReportAction from '@hooks/useGetExpensifyCardFromReportAction';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import SidebarUtils from '@libs/SidebarUtils';
import CONST from '@src/CONST';
import {getMovedReportID} from '@src/libs/ModifiedExpenseMessage';
import {canUserPerformWriteAction, type OptionData} from '@src/libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import OptionRowLHN from './OptionRowLHN';
import type {OptionRowLHNDataProps} from './types';
import {
    getOneTransactionThreadReportID,
    getOriginalMessage,
    getSortedReportActions,
    getSortedReportActionsForDisplay,
    isInviteOrRemovedAction,
    isMoneyRequestAction,
    shouldReportActionBeVisibleAsLastAction,
} from '@libs/ReportActionsUtils';
import useNetwork from '@hooks/useNetwork';
import {getIOUReportIDOfLastAction, getLastMessageTextForReport} from '@libs/OptionsListUtils';
import {PersonalDetails, ReportAction} from '@src/types/onyx';

/*
 * This component gets the data from onyx for the actual
 * OptionRowLHN component.
 * The OptionRowLHN component is memoized, so it will only
 * re-render if the data really changed.
 *
 * To remove:
 * reportAttributes, oneTransactionThreadReport, reportNameValuePairs, reportActions, parentReportAction
 * iouReportReportActions, policy, itemInvoiceReceiverPolicy, transaction, lastReportActionTransaction, lastMessageTextFromReport
 * hasDraftComment, shouldShowRBRorGBRTooltip, isReportArchived, lastAction, lastActionReport
 */
function OptionRowLHNData({
    reportID,
    isOptionFocused = false,
    fullReport,
    reportAttributesDerived,
    personalDetails = {},
    preferredLocale = CONST.LOCALES.DEFAULT,
    receiptTransactions,
    transactionViolations,
    localeCompare,
    translate,
    currentUserAccountID,
    policyForMovingExpensesID,
    firstReportIDWithGBRorRBR,
    ...propsToForward
}: OptionRowLHNDataProps) {
    const item = fullReport;
    const {isOffline} = useNetwork();

    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${item?.policyID}`, {canBeMissing: true});
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${item?.chatReportID}`, {canBeMissing: true});
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {canBeMissing: true});
    const [itemParentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${item?.parentReportID}`, {canBeMissing: true});
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {canBeMissing: true});
    const [parentReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${item?.parentReportID}`, {canBeMissing: true});

    const oneTransactionThreadReportID = getOneTransactionThreadReportID(item, chatReport, reportActions, isOffline);
    const [oneTransactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${oneTransactionThreadReportID}`, {canBeMissing: true});

    const reportAttributes = reportAttributesDerived?.[reportID];
    const parentReportAction = item?.parentReportActionID ? parentReportActions?.[item?.parentReportActionID] : undefined;

    let invoiceReceiverPolicyID = '-1';
    if (item?.invoiceReceiver && 'policyID' in item.invoiceReceiver) {
        invoiceReceiverPolicyID = item.invoiceReceiver.policyID;
    }
    if (itemParentReport?.invoiceReceiver && 'policyID' in itemParentReport.invoiceReceiver) {
        invoiceReceiverPolicyID = itemParentReport.invoiceReceiver.policyID;
    }

    const iouReportIDOfLastAction = getIOUReportIDOfLastAction(item);
    const [invoiceReceiverPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${invoiceReceiverPolicyID}`, {canBeMissing: true});
    const [iouReportReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportIDOfLastAction}`, {canBeMissing: true});

    const transactionID = isMoneyRequestAction(parentReportAction) ? (getOriginalMessage(parentReportAction)?.IOUTransactionID ?? CONST.DEFAULT_NUMBER_ID) : CONST.DEFAULT_NUMBER_ID;
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {canBeMissing: true});
    const [draftComment] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`, {canBeMissing: true});

    const hasDraftComment = !!draftComment && !draftComment.match(CONST.REGEX.EMPTY_COMMENT);

    const isReportArchived = !!reportNameValuePairs?.private_isArchived;
    const canUserPerformWrite = canUserPerformWriteAction(item, isReportArchived);
    const sortedReportActions = getSortedReportActionsForDisplay(reportActions, canUserPerformWrite);
    const lastReportAction = sortedReportActions.at(0);

    // Get the transaction for the last report action
    const lastReportActionTransactionID = isMoneyRequestAction(lastReportAction)
        ? (getOriginalMessage(lastReportAction)?.IOUTransactionID ?? CONST.DEFAULT_NUMBER_ID)
        : CONST.DEFAULT_NUMBER_ID;

    const [lastReportActionTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${lastReportActionTransactionID}`, {canBeMissing: true});

    // SidebarUtils.getOptionData in OptionRowLHNData does not get re-evaluated when the linked task report changes, so we have the lastMessageTextFromReport evaluation logic here
    let lastActorDetails: Partial<PersonalDetails> | null = item?.lastActorAccountID && personalDetails?.[item.lastActorAccountID] ? personalDetails[item.lastActorAccountID] : null;
    if (!lastActorDetails && lastReportAction) {
        const lastActorDisplayName = lastReportAction?.person?.at(0)?.text;
        lastActorDetails = lastActorDisplayName ? {displayName: lastActorDisplayName, accountID: item?.lastActorAccountID} : null;
    }

    const [movedFromReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getMovedReportID(lastReportAction, CONST.REPORT.MOVE_TYPE.FROM)}`, {canBeMissing: true});
    const [movedToReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getMovedReportID(lastReportAction, CONST.REPORT.MOVE_TYPE.TO)}`, {canBeMissing: true});
    const [itemReportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {canBeMissing: true});

    const lastMessageTextFromReport = getLastMessageTextForReport({
        translate,
        report: item,
        lastActorDetails,
        movedFromReport,
        movedToReport,
        policy,
        isReportArchived: !!reportNameValuePairs?.private_isArchived,
        policyForMovingExpensesID,
        reportMetadata: itemReportMetadata,
        reportAttributesDerived,
    });

    const shouldShowRBRorGBRTooltip = firstReportIDWithGBRorRBR === reportID;

    let lastAction: ReportAction | undefined;
    if (!reportActions || !item) {
        lastAction = undefined;
    } else {
        const canUserPerformWrite = canUserPerformWriteAction(item, isReportArchived);
        const actionsArray = getSortedReportActions(Object.values(reportActions));
        const reportActionsForDisplay = actionsArray.filter(
            (reportAction) => shouldReportActionBeVisibleAsLastAction(reportAction, canUserPerformWrite) && reportAction.actionName !== CONST.REPORT.ACTIONS.TYPE.CREATED,
        );
        lastAction = reportActionsForDisplay.at(-1);
    }

    const lastActionReportID = isInviteOrRemovedAction(lastAction) && lastAction?.actionName ? getOriginalMessage(lastAction)?.reportID : undefined;
    const [lastActionReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${lastActionReportID}`, {canBeMissing: true});

    // =====================
    // START OLD CODE
    const {currentReportID: currentReportIDValue} = useCurrentReportIDState();
    const isReportFocused = isOptionFocused && currentReportIDValue === reportID;
    const optionItemRef = useRef<OptionData | undefined>(undefined);

    // Check the report errors equality to avoid re-rendering when there are no changes
    const prevReportErrors = usePrevious(reportAttributes?.reportErrors);
    const areReportErrorsEqual = useMemo(() => deepEqual(prevReportErrors, reportAttributes?.reportErrors), [prevReportErrors, reportAttributes?.reportErrors]);

    const card = useGetExpensifyCardFromReportAction({reportAction: lastAction, policyID: fullReport?.policyID});

    const optionItem = useMemo(() => {
        // Note: ideally we'd have this as a dependent selector in onyx!
        const optionItemData = SidebarUtils.getOptionData({
            report: fullReport,
            reportAttributes,
            oneTransactionThreadReport,
            reportNameValuePairs,
            personalDetails,
            policy,
            parentReportAction,
            lastMessageTextFromReport,
            invoiceReceiverPolicy,
            card,
            lastAction,
            translate,
            localeCompare,
            isReportArchived,
            lastActionReport,
            movedFromReport,
            movedToReport,
            currentUserAccountID,
            reportAttributesDerived,
        });
        if (deepEqual(optionItemData, optionItemRef.current)) {
            return optionItemRef.current;
        }

        optionItemRef.current = optionItemData;

        return optionItemData;
        // Listen parentReportAction to update title of thread report when parentReportAction changed
        // Listen to transaction to update title of transaction report when transaction changed
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        fullReport,
        reportAttributes?.brickRoadStatus,
        reportAttributes?.reportName,
        areReportErrorsEqual,
        oneTransactionThreadReport,
        reportNameValuePairs,
        lastReportActionTransaction,
        reportActions,
        personalDetails,
        preferredLocale,
        policy,
        parentReportAction,
        iouReportReportActions,
        transaction,
        receiptTransactions,
        invoiceReceiverPolicy,
        lastMessageTextFromReport,
        card,
        translate,
        localeCompare,
        isReportArchived,
        movedFromReport,
        movedToReport,
        currentUserAccountID,
        reportAttributesDerived,
    ]);

    return (
        <OptionRowLHN
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...propsToForward}
            shouldShowRBRorGBRTooltip={shouldShowRBRorGBRTooltip}
            hasDraftComment={hasDraftComment}
            isOptionFocused={isReportFocused}
            optionItem={optionItem}
            report={fullReport}
            reportID={reportID}
        />
    );
}

OptionRowLHNData.displayName = 'OptionRowLHNData';

/**
 * This component is rendered in a list.
 * On scroll we want to avoid that a item re-renders
 * just because the list has to re-render when adding more items.
 * Thats also why the React.memo is used on the outer component here, as we just
 * use it to prevent re-renders from parent re-renders.
 */
export default React.memo(OptionRowLHNData);
