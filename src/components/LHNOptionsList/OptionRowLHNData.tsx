import {deepEqual} from 'fast-equals';
import React, {useMemo, useRef} from 'react';
import {useCurrentReportIDState} from '@hooks/useCurrentReportID';
import useGetExpensifyCardFromReportAction from '@hooks/useGetExpensifyCardFromReportAction';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import SidebarUtils from '@libs/SidebarUtils';
import CONST from '@src/CONST';
import {getMovedReportID} from '@src/libs/ModifiedExpenseMessage';
import type {OptionData} from '@src/libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import OptionRowLHN from './OptionRowLHN';
import type {OptionRowLHNDataProps} from './types';
import {getOneTransactionThreadReportID} from '@libs/ReportActionsUtils';
import useNetwork from '@hooks/useNetwork';
import useReportAttributes from '@hooks/useReportAttributes';

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
    ...propsToForward
}: OptionRowLHNDataProps) {
    const item = fullReport;
    const reportID = propsToForward.reportID;
    const {isOffline} = useNetwork();

    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${item?.chatReportID}`, {canBeMissing: true});
    const [itemReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {canBeMissing: true});
    const [itemParentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${item?.parentReportID}`, {canBeMissing: true});
    const [itemReportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {canBeMissing: true});
    const [itemParentReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${item?.parentReportID}`, {canBeMissing: true});

    const oneTransactionThreadReportID = getOneTransactionThreadReportID(item, chatReport, itemReportActions, isOffline);
    const [itemOneTransactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${oneTransactionThreadReportID}`, {canBeMissing: true});

    const itemParentReportAction = item?.parentReportActionID ? itemParentReportActions?.[item?.parentReportActionID] : undefined;
    const itemReportAttributes = reportAttributesDerived?.[reportID];

    let invoiceReceiverPolicyID = '-1';
    if (item?.invoiceReceiver && 'policyID' in item.invoiceReceiver) {
        invoiceReceiverPolicyID = item.invoiceReceiver.policyID;
    }
    if (itemParentReport?.invoiceReceiver && 'policyID' in itemParentReport.invoiceReceiver) {
        invoiceReceiverPolicyID = itemParentReport.invoiceReceiver.policyID;
    }

    const [itemInvoiceReceiverPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${invoiceReceiverPolicyID}`, {canBeMissing: true});

    //             const iouReportIDOfLastAction = getIOUReportIDOfLastAction(item);
    //             const itemIouReportReportActions = iouReportIDOfLastAction ? reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportIDOfLastAction}`] : undefined;

    //             const itemPolicy = policy?.[`${ONYXKEYS.COLLECTION.POLICY}${item?.policyID}`];
    //             const transactionID = isMoneyRequestAction(itemParentReportAction)
    //                 ? (getOriginalMessage(itemParentReportAction)?.IOUTransactionID ?? CONST.DEFAULT_NUMBER_ID)
    //                 : CONST.DEFAULT_NUMBER_ID;
    //             const itemTransaction = transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
    //             const hasDraftComment =
    //                 !!draftComments?.[`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`] &&
    //                 !draftComments?.[`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`]?.match(CONST.REGEX.EMPTY_COMMENT);

    //             const isReportArchived = !!itemReportNameValuePairs?.private_isArchived;
    //             const canUserPerformWrite = canUserPerformWriteActionUtil(item, isReportArchived);
    //             const sortedReportActions = getSortedReportActionsForDisplay(itemReportActions, canUserPerformWrite);
    //             const lastReportAction = sortedReportActions.at(0);

    //             // Get the transaction for the last report action
    //             const lastReportActionTransactionID = isMoneyRequestAction(lastReportAction)
    //                 ? (getOriginalMessage(lastReportAction)?.IOUTransactionID ?? CONST.DEFAULT_NUMBER_ID)
    //                 : CONST.DEFAULT_NUMBER_ID;
    //             const lastReportActionTransaction = transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${lastReportActionTransactionID}`];

    //             // SidebarUtils.getOptionData in OptionRowLHNData does not get re-evaluated when the linked task report changes, so we have the lastMessageTextFromReport evaluation logic here
    //             let lastActorDetails: Partial<PersonalDetails> | null = item?.lastActorAccountID && personalDetails?.[item.lastActorAccountID] ? personalDetails[item.lastActorAccountID] : null;
    //             if (!lastActorDetails && lastReportAction) {
    //                 const lastActorDisplayName = lastReportAction?.person?.[0]?.text;
    //                 lastActorDetails = lastActorDisplayName
    //                     ? {
    //                           displayName: lastActorDisplayName,
    //                           accountID: item?.lastActorAccountID,
    //                       }
    //                     : null;
    //             }
    //             const movedFromReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${getMovedReportID(lastReportAction, CONST.REPORT.MOVE_TYPE.FROM)}`];
    //             const movedToReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${getMovedReportID(lastReportAction, CONST.REPORT.MOVE_TYPE.TO)}`];
    //             const itemReportMetadata = reportMetadataCollection?.[`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`];
    //             const lastMessageTextFromReport = getLastMessageTextForReport({
    //                 translate,
    //                 report: item,
    //                 lastActorDetails,
    //                 movedFromReport,
    //                 movedToReport,
    //                 policy: itemPolicy,
    //                 isReportArchived: !!itemReportNameValuePairs?.private_isArchived,
    //                 policyForMovingExpensesID,
    //                 reportMetadata: itemReportMetadata,
    //                 reportAttributesDerived: reportAttributes,
    //             });

    //             const shouldShowRBRorGBRTooltip = firstReportIDWithGBRorRBR === reportID;

    //             let lastAction: ReportAction | undefined;
    //             if (!itemReportActions || !item) {
    //                 lastAction = undefined;
    //             } else {
    //                 const canUserPerformWriteAction = canUserPerformWriteActionUtil(item, isReportArchived);
    //                 const actionsArray = getSortedReportActions(Object.values(itemReportActions));
    //                 const reportActionsForDisplay = actionsArray.filter(
    //                     (reportAction) => shouldReportActionBeVisibleAsLastAction(reportAction, canUserPerformWriteAction) && reportAction.actionName !== CONST.REPORT.ACTIONS.TYPE.CREATED,
    //                 );
    //                 lastAction = reportActionsForDisplay.at(-1);
    //             }

    //             let lastActionReport: OnyxEntry<Report> | undefined;
    //             if (isInviteOrRemovedAction(lastAction)) {
    //                 const lastActionOriginalMessage = lastAction?.actionName ? getOriginalMessage(lastAction) : null;
    //                 lastActionReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${lastActionOriginalMessage?.reportID}`];
    //             }

    const {currentReportID: currentReportIDValue} = useCurrentReportIDState();
    const isReportFocused = isOptionFocused && currentReportIDValue === reportID;
    const optionItemRef = useRef<OptionData | undefined>(undefined);

    const [movedFromReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getMovedReportID(lastAction, CONST.REPORT.MOVE_TYPE.FROM)}`, {canBeMissing: true});
    const [movedToReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getMovedReportID(lastAction, CONST.REPORT.MOVE_TYPE.TO)}`, {canBeMissing: true});
    // Check the report errors equality to avoid re-rendering when there are no changes
    const prevReportErrors = usePrevious(reportAttributes?.reportErrors);
    const areReportErrorsEqual = useMemo(() => deepEqual(prevReportErrors, reportAttributes?.reportErrors), [prevReportErrors, reportAttributes?.reportErrors]);

    const card = useGetExpensifyCardFromReportAction({reportAction: lastAction, policyID: fullReport?.policyID});

    const optionItem = useMemo(() => {
        // Note: ideally we'd have this as a dependent selector in onyx!
        const item = SidebarUtils.getOptionData({
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
        if (deepEqual(item, optionItemRef.current)) {
            return optionItemRef.current;
        }

        optionItemRef.current = item;

        return item;
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
            isOptionFocused={isReportFocused}
            optionItem={optionItem}
            report={fullReport}
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
