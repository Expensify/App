import React, {useMemo} from 'react';
import useReportPreviewSenderID from '@components/ReportActionAvatars/useReportPreviewSenderID';
import {useCurrentReportIDState} from '@hooks/useCurrentReportID';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useGetExpensifyCardFromReportAction from '@hooks/useGetExpensifyCardFromReportAction';
import useOnyx from '@hooks/useOnyx';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import SidebarUtils from '@libs/SidebarUtils';
import CONST from '@src/CONST';
import {getMovedReportID} from '@src/libs/ModifiedExpenseMessage';
import ONYXKEYS from '@src/ONYXKEYS';
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
    reportNameValuePairs,
    personalDetails = {},
    policy,
    invoiceReceiverPolicy,
    parentReportAction,
    lastMessageTextFromReport,
    localeCompare,
    translate,
    isReportArchived = false,
    lastAction,
    lastActionReport,
    currentUserAccountID,
    ...propsToForward
}: OptionRowLHNDataProps) {
    const reportID = propsToForward.reportID;
    const {currentReportID: currentReportIDValue} = useCurrentReportIDState();
    const isReportFocused = isOptionFocused && currentReportIDValue === reportID;

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
