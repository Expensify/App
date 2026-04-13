import React, {useCallback, useMemo} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import useReportPreviewSenderID from '@components/ReportActionAvatars/useReportPreviewSenderID';
import {useCurrentReportIDState} from '@hooks/useCurrentReportID';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useGetExpensifyCardFromReportAction from '@hooks/useGetExpensifyCardFromReportAction';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getLastVisibleActionIncludingTransactionThread, getOriginalMessage, isActionableTrackExpense, isInviteOrRemovedAction} from '@libs/ReportActionsUtils';
import {canUserPerformWriteAction as canUserPerformWriteActionUtil} from '@libs/ReportUtils';
import SidebarUtils from '@libs/SidebarUtils';
import CONST from '@src/CONST';
import {getMovedReportID} from '@src/libs/ModifiedExpenseMessage';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActions as ReportActionsType} from '@src/types/onyx';
import type {VisibleReportActionsDerivedValue} from '@src/types/onyx/DerivedValues';
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
    reportAttributes,
    reportAttributesDerived,
    oneTransactionThreadReport,
    personalDetails = {},
    policy,
    invoiceReceiverPolicy,
    conciergeReportID,
    ...propsToForward
}: OptionRowLHNDataProps) {
    const reportID = propsToForward.reportID;
    const {currentReportID: currentReportIDValue} = useCurrentReportIDState();
    const isReportFocused = isOptionFocused && currentReportIDValue === reportID;
    const {translate, localeCompare} = useLocalize();
    const {login, accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const oneTransactionThreadReportID = oneTransactionThreadReport?.reportID;

    // Per-item report actions subscriptions (scoped by specific report ID)
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`);
    const [parentReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(fullReport?.parentReportID)}`);
    const [transactionThreadReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(oneTransactionThreadReportID)}`);

    // Scoped VISIBLE_REPORT_ACTIONS selector
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

    // Per-item NVP subscription instead of collection-level subscription in parent
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`);

    const parentReportAction = fullReport?.parentReportActionID ? parentReportActions?.[fullReport.parentReportActionID] : undefined;

    const isReportArchived = !!reportNameValuePairs?.private_isArchived;
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

    const [draftComment] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`);
    const hasDraftComment = !!draftComment && !draftComment.match(CONST.REGEX.EMPTY_COMMENT);

    const [movedFromReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getMovedReportID(lastAction, CONST.REPORT.MOVE_TYPE.FROM)}`);
    const [movedToReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getMovedReportID(lastAction, CONST.REPORT.MOVE_TYPE.TO)}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fullReport?.policyID}`);

    const card = useGetExpensifyCardFromReportAction({reportAction: lastAction, policyID: fullReport?.policyID});

    const isIOUReport = fullReport?.type === CONST.REPORT.TYPE.IOU;
    const [chatReportForIOU] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(isIOUReport ? fullReport?.chatReportID : undefined)}`);
    const reportPreviewSenderID = useReportPreviewSenderID({
        iouReport: isIOUReport ? fullReport : undefined,
        action: parentReportAction,
        chatReport: chatReportForIOU,
    });

    // React Compiler auto-memoizes each expression in OptionRowLHN independently,
    // so there is no need to stabilize the optionItem reference with deepEqual.
    // When getOptionData returns a fresh object with the same content, the Compiler
    // ensures that only expressions whose inputs actually changed recompute.
    const optionItem = SidebarUtils.getOptionData({
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
        isReportArchived,
        lastActionReport,
        movedFromReport,
        movedToReport,
        currentUserAccountID,
        reportAttributesDerived,
        policyTags,
        currentUserLogin: login ?? '',
    });

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
