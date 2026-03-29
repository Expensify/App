import React, {useCallback, useMemo} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import useReportPreviewSenderID from '@components/ReportActionAvatars/useReportPreviewSenderID';
import {useCurrentReportIDState} from '@hooks/useCurrentReportID';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useGetExpensifyCardFromReportAction from '@hooks/useGetExpensifyCardFromReportAction';
import useOnyx from '@hooks/useOnyx';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getIOUReportIDOfLastAction} from '@libs/OptionsListUtils';
import {getLastVisibleActionIncludingTransactionThread, getOriginalMessage, isActionableTrackExpense, isInviteOrRemovedAction, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {canUserPerformWriteAction as canUserPerformWriteActionUtil} from '@libs/ReportUtils';
import SidebarUtils from '@libs/SidebarUtils';
import CONST from '@src/CONST';
import {getMovedReportID} from '@src/libs/ModifiedExpenseMessage';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActions as ReportActionsType, VisibleReportActionsDerivedValue} from '@src/types/onyx';
import type {ReportAttributesDerivedValue} from '@src/types/onyx/DerivedValues';
import type {Icon} from '@src/types/onyx/OnyxCommon';
import OptionRowLHN from './OptionRowLHN';
import type {OptionRowLHNDataProps} from './types';

/*
 * This component gets the data from onyx for the actual
 * OptionRowLHN component.
 * The OptionRowLHN component is memoized, so it will only
 * re-render if the data really changed.
 */
function OptionRowLHNData({
    isOptionFocused = false,
    fullReport,
    reportNameValuePairs,
    personalDetails = {},
    policy,
    invoiceReceiverPolicy,
    localeCompare,
    formatPhoneNumber,
    translate,
    currentUserAccountID,
    ...propsToForward
}: OptionRowLHNDataProps) {
    const reportID = propsToForward.reportID;
    const {currentReportID: currentReportIDValue} = useCurrentReportIDState();
    const isReportFocused = isOptionFocused && currentReportIDValue === reportID;
    // Per-item scoped subscriptions
    const reportAttributesSelector = useCallback((data: ReportAttributesDerivedValue | undefined) => data?.reports?.[reportID], [reportID]);
    const [reportAttributes] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {selector: reportAttributesSelector});

    const [draftComment] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`);
    const hasDraftComment = !!draftComment && !draftComment.match(CONST.REGEX.EMPTY_COMMENT);

    // Use the derived thread ID directly — available even when the child report object isn't hydrated yet
    const oneTransactionThreadReportID = reportAttributes?.oneTransactionThreadReportID;

    // Full report object needed only for SidebarUtils.getOptionData
    const [oneTransactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(oneTransactionThreadReportID)}`);

    // Per-item report actions subscriptions (scoped by specific report ID)
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`);
    const [parentReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(fullReport?.parentReportID)}`);
    const [transactionThreadReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(oneTransactionThreadReportID)}`);

    // Scoped VISIBLE_REPORT_ACTIONS selector — only picks entries for this report and its transaction thread.
    // Onyx uses deepEqual internally for selector output comparison, so creating a new object is fine.
    const visibleActionsSelector = useCallback(
        (data: VisibleReportActionsDerivedValue | undefined) => {
            if (!data) {
                return undefined;
            }
            const result: VisibleReportActionsDerivedValue = {};
            const reportEntry = data[reportID];
            if (reportEntry) {
                result[reportID] = reportEntry;
            }
            if (oneTransactionThreadReportID) {
                const txThreadEntry = data[oneTransactionThreadReportID];
                if (txThreadEntry) {
                    result[oneTransactionThreadReportID] = txThreadEntry;
                }
            }
            return result;
        },
        [reportID, oneTransactionThreadReportID],
    );
    const [visibleReportActionsData] = useOnyx(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS, {selector: visibleActionsSelector});

    const [reportNameValuePairsEntry] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`);

    const parentReportAction = fullReport?.parentReportActionID ? parentReportActions?.[fullReport.parentReportActionID] : undefined;

    const transactionID = isMoneyRequestAction(parentReportAction) ? (getOriginalMessage(parentReportAction)?.IOUTransactionID ?? CONST.DEFAULT_NUMBER_ID) : CONST.DEFAULT_NUMBER_ID;
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionID !== CONST.DEFAULT_NUMBER_ID ? String(transactionID) : undefined)}`);

    const isReportArchived = !!(reportNameValuePairsEntry ?? reportNameValuePairs)?.private_isArchived;
    const canUserPerformWrite = canUserPerformWriteActionUtil(fullReport, isReportArchived);

    const lastAction = useMemo(() => {
        const actionsCollection: OnyxCollection<ReportActionsType> = {
            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`]: reportActions ?? undefined,
        };
        if (oneTransactionThreadReportID) {
            actionsCollection[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${oneTransactionThreadReportID}`] = transactionThreadReportActions ?? undefined;
        }
        return getLastVisibleActionIncludingTransactionThread(reportID, canUserPerformWrite, actionsCollection, visibleReportActionsData, oneTransactionThreadReportID);
    }, [reportID, canUserPerformWrite, reportActions, transactionThreadReportActions, visibleReportActionsData, oneTransactionThreadReportID]);

    const iouReportIDOfLastAction = useMemo(
        () => getIOUReportIDOfLastAction(fullReport, (reportNameValuePairsEntry ?? reportNameValuePairs)?.private_isArchived, visibleReportActionsData, lastAction),
        [fullReport, reportNameValuePairsEntry, reportNameValuePairs, visibleReportActionsData, lastAction],
    );
    const [iouReportReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(iouReportIDOfLastAction)}`);

    const lastReportActionTransactionID = isMoneyRequestAction(lastAction) ? (getOriginalMessage(lastAction)?.IOUTransactionID ?? CONST.DEFAULT_NUMBER_ID) : CONST.DEFAULT_NUMBER_ID;
    const [lastReportActionTransaction] = useOnyx(
        `${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(lastReportActionTransactionID !== CONST.DEFAULT_NUMBER_ID ? String(lastReportActionTransactionID) : undefined)}`,
    );

    const whisperTransactionID = isActionableTrackExpense(lastAction) ? getOriginalMessage(lastAction)?.transactionID : undefined;
    const [whisperTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(whisperTransactionID)}`);

    const lastMessageTextFromReport = useMemo(() => {
        if (whisperTransactionID && !whisperTransaction) {
            return '';
        }
        return undefined;
    }, [whisperTransactionID, whisperTransaction]);

    const lastActionReportID = useMemo(() => {
        if (isInviteOrRemovedAction(lastAction)) {
            const lastActionOriginalMessage = lastAction?.actionName ? getOriginalMessage(lastAction) : null;
            return lastActionOriginalMessage?.reportID;
        }
        return undefined;
    }, [lastAction]);
    const [lastActionReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(lastActionReportID ? String(lastActionReportID) : undefined)}`);

    const [movedFromReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getMovedReportID(lastAction, CONST.REPORT.MOVE_TYPE.FROM)}`);
    const [movedToReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getMovedReportID(lastAction, CONST.REPORT.MOVE_TYPE.TO)}`);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const {login} = useCurrentUserPersonalDetails();
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fullReport?.policyID}`);

    const card = useGetExpensifyCardFromReportAction({reportAction: lastAction, policyID: fullReport?.policyID});

    const isIOUReport = fullReport?.type === CONST.REPORT.TYPE.IOU;
    const [chatReportForIOU] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(isIOUReport ? fullReport?.chatReportID : undefined)}`);
    const reportPreviewSenderID = useReportPreviewSenderID({
        iouReport: isIOUReport ? fullReport : undefined,
        action: parentReportAction,
        chatReport: chatReportForIOU,
    });

    const reportAttributesDerived = useMemo(() => {
        if (!reportAttributes) {
            return undefined;
        }
        return {[reportID]: reportAttributes} as ReportAttributesDerivedValue['reports'];
    }, [reportID, reportAttributes]);

    const optionItem = useMemo(
        () =>
            SidebarUtils.getOptionData({
                report: fullReport,
                reportAttributes,
                oneTransactionThreadReport,
                reportNameValuePairs,
                personalDetails,
                policy,
                parentReportAction,
                conciergeReportID,
                lastMessageTextFromReport,
                invoiceReceiverPolicy,
                card,
                lastAction,
                translate,
                localeCompare,
                formatPhoneNumber,
                isReportArchived,
                lastActionReport,
                movedFromReport,
                movedToReport,
                currentUserAccountID,
                reportAttributesDerived,
                policyTags,
                currentUserLogin: login ?? '',
            }),
        // These subscriptions don't appear in getOptionData params but trigger recomputation
        // when the underlying data changes (e.g. transaction amount update, IOU report actions change).
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
            fullReport,
            reportAttributes,
            oneTransactionThreadReport,
            reportNameValuePairs,
            personalDetails,
            policy,
            parentReportAction,
            conciergeReportID,
            lastMessageTextFromReport,
            invoiceReceiverPolicy,
            card,
            lastAction,
            translate,
            localeCompare,
            formatPhoneNumber,
            isReportArchived,
            lastActionReport,
            movedFromReport,
            movedToReport,
            currentUserAccountID,
            reportAttributesDerived,
            policyTags,
            login,
            transaction,
            iouReportReportActions,
            lastReportActionTransaction,
            reportActions,
        ],
    );

    // For single-sender IOUs, trim to the sender's avatar to match the header.
    // The header uses reportPreviewSenderID as accountID for its primary avatar,
    // so we pick the matching icon from getIconsForIOUReport to stay consistent.
    const finalOptionItem = useMemo(() => {
        if (!optionItem || !isIOUReport || reportPreviewSenderID === undefined || !optionItem.icons || optionItem.icons.length <= 1) {
            return optionItem;
        }
        // eslint-disable-next-line rulesdir/prefer-at -- .find() is needed to search by predicate (matching icon.id to senderID), not by index
        const senderIcon = optionItem.icons.find((icon) => Number(icon.id) === reportPreviewSenderID);
        return {...optionItem, icons: [senderIcon ?? optionItem.icons.at(0)].filter((icon): icon is Icon => !!icon)};
    }, [optionItem, isIOUReport, reportPreviewSenderID]);

    return (
        <OptionRowLHN
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...propsToForward}
            isOptionFocused={isReportFocused}
            optionItem={finalOptionItem}
            report={fullReport}
            hasDraftComment={hasDraftComment}
            conciergeReportID={conciergeReportID}
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
