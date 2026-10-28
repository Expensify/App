import type {OptionRowLHNDataProps} from '@components/LHNOptionsList/types';
import useReportPreviewSenderID from '@components/ReportActionAvatars/useReportPreviewSenderID';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {useCurrentReportIDState} from '@hooks/useCurrentReportID';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useGetExpensifyCardFromReportAction from '@hooks/useGetExpensifyCardFromReportAction';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalDetailByLogin from '@hooks/usePersonalDetailByLogin';
import {usePersonalDetailsByIDs} from '@hooks/usePersonalDetails';
import {useReportAttributesByID} from '@hooks/useReportAttributes';
import useThemeStyles from '@hooks/useThemeStyles';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {
    getIOUReportIDFromReportActionPreview,
    getLastVisibleActionIncludingTransactionThread,
    getLastVisibleAction,
    getOriginalMessage,
    getReportActionActorAccountID,
    isActionableJoinRequest,
    isActionableMentionWhisper,
    isActionableTrackExpense,
    isInviteOrRemovedAction,
    isMoneyRequestAction,
} from '@libs/ReportActionsUtils';
import {canUserPerformWriteAction as canUserPerformWriteActionUtil, parseMovedTransactionReportIDs, shouldShowMarkAsDone} from '@libs/ReportUtils';
import SidebarUtils from '@libs/SidebarUtils';

import CONST from '@src/CONST';
import {getMovedReportID} from '@src/libs/ModifiedExpenseMessage';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Report, ReportAction, ReportActions as ReportActionsType} from '@src/types/onyx';
import type {ReportAttributesDerivedValue, VisibleReportActionsDerivedValue} from '@src/types/onyx/DerivedValues';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import type {ViewStyle} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import {accountIDSelector} from '@selectors/PersonalDetails';
import {reportNamesByIDsSelector} from '@selectors/ReportAttributes';
import React from 'react';
import {StyleSheet, View} from 'react-native';

import OptionRowLHN from './OptionRowLHN';

const EMPTY_PERSONAL_DETAILS: PersonalDetailsList = {};

function invoiceReceiverPolicyIDSelector(report: OnyxEntry<Report>): string | undefined {
    return report?.invoiceReceiver && 'policyID' in report.invoiceReceiver ? report.invoiceReceiver.policyID : undefined;
}

function invoiceReceiverAccountIDSelector(report: OnyxEntry<Report>): number | undefined {
    return report?.invoiceReceiver && 'accountID' in report.invoiceReceiver ? report.invoiceReceiver.accountID : undefined;
}

function getActionAccountIDs(action: OnyxEntry<ReportAction>): Array<number | undefined> {
    if (!action) {
        return [];
    }
    const accountIDs = [action.actorAccountID, getReportActionActorAccountID(action, undefined, undefined)];
    if (isActionableJoinRequest(action)) {
        accountIDs.push(getOriginalMessage(action)?.accountID);
    }
    if (isActionableMentionWhisper(action)) {
        accountIDs.push(...(getOriginalMessage(action)?.inviteeAccountIDs ?? []));
    }
    return accountIDs;
}

type OptionRowAccountIDsParams = {
    report: OnyxEntry<Report>;
    parentReportAction: OnyxEntry<ReportAction>;
    parentReportActionActorAccountID: number | undefined;
    invoiceChatReceiverAccountID: number | undefined;
    lastAction: OnyxEntry<ReportAction>;
    ownLastAction: OnyxEntry<ReportAction>;
    reimburserAccountID: number | undefined;
    currentUserAccountID: number;
};

function getOptionRowAccountIDs({
    report,
    parentReportAction,
    parentReportActionActorAccountID,
    invoiceChatReceiverAccountID,
    lastAction,
    ownLastAction,
    reimburserAccountID,
    currentUserAccountID,
}: OptionRowAccountIDsParams): number[] {
    const accountIDs = new Set<number | undefined>([
        ...Object.keys(report?.participants ?? {}).map(Number),
        report?.ownerAccountID,
        report?.managerID,
        report?.lastActorAccountID,
        parentReportAction?.actorAccountID,
        parentReportActionActorAccountID,
        invoiceReceiverAccountIDSelector(report),
        invoiceChatReceiverAccountID,
        ...getActionAccountIDs(lastAction),
        ...getActionAccountIDs(ownLastAction),
        reimburserAccountID,
        CONST.ACCOUNT_ID.CONCIERGE,
        CONST.ACCOUNT_ID.NOTIFICATIONS,
        currentUserAccountID,
    ]);
    return Array.from(accountIDs).filter((accountID): accountID is number => accountID !== undefined);
}

function getActionReportIDs(action: OnyxEntry<ReportAction>): Array<string | undefined> {
    if (!action) {
        return [];
    }
    const {fromReportID, displayReportID} = parseMovedTransactionReportIDs(action);
    return [fromReportID, displayReportID, getIOUReportIDFromReportActionPreview(action)];
}

/*
 * This component gets the data from onyx for the actual
 * OptionRowLHN component.
 * OptionRowLHN is auto-memoized by React Compiler, so it will
 * only re-render when the inputs derived from this wrapper change.
 */
function OptionRowLHNData({isOptionFocused = false, viewMode = 'default', reportID, ...propsToForward}: OptionRowLHNDataProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare, dateFnsLocale, formatPhoneNumber} = useLocalize();
    const {convertToDisplayString, convertToDisplayStringWithoutCurrency} = useCurrencyListActions();
    const {currentReportID: currentReportIDValue} = useCurrentReportIDState();
    const {login, accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const [fullReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const reportAttributes = useReportAttributesByID(reportID);
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`);
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`);
    const [draftComment] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);

    const isInvoice = fullReport?.type === CONST.REPORT.TYPE.INVOICE;
    const isIOUReport = fullReport?.type === CONST.REPORT.TYPE.IOU;
    const visibleActionsSelector = (data: VisibleReportActionsDerivedValue | undefined) => {
        if (!data) {
            return undefined;
        }
        const result: VisibleReportActionsDerivedValue = {};
        const reportEntry = data[reportID];
        if (reportEntry) {
            result[reportID] = reportEntry;
        }
        if (reportAttributes?.oneTransactionThreadReportID) {
            const txThreadEntry = data[reportAttributes.oneTransactionThreadReportID];
            if (txThreadEntry) {
                result[reportAttributes.oneTransactionThreadReportID] = txThreadEntry;
            }
        }
        return result;
    };

    const [oneTransactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportAttributes?.oneTransactionThreadReportID)}`);
    const [transactionThreadReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(reportAttributes?.oneTransactionThreadReportID)}`);
    const [visibleReportActionsData] = useOnyx(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS, {selector: visibleActionsSelector});
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(fullReport?.policyID)}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fullReport?.policyID}`);
    const reimburserAccountID = usePersonalDetailByLogin(policy?.reimburser ?? policy?.achAccount?.reimburser, accountIDSelector);
    const [parentReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(fullReport?.parentReportID)}`);
    const [parentReportInvoiceReceiverPolicyID] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(fullReport?.parentReportID)}`, {
        selector: invoiceReceiverPolicyIDSelector,
    });
    const [invoiceChatReceiverAccountID] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(isInvoice ? fullReport?.chatReportID : undefined)}`, {
        selector: invoiceReceiverAccountIDSelector,
    });
    const [chatReportForIOU] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(isIOUReport ? fullReport?.chatReportID : undefined)}`);

    const invoiceReceiverPolicyID = parentReportInvoiceReceiverPolicyID ?? invoiceReceiverPolicyIDSelector(fullReport);
    const parentReportAction = fullReport?.parentReportActionID ? parentReportActions?.[fullReport.parentReportActionID] : undefined;
    const parentReportActionActorAccountID = getReportActionActorAccountID(parentReportAction, fullReport, fullReport);
    const isReportArchived = !!reportNameValuePairs?.private_isArchived;
    const canUserPerformWrite = canUserPerformWriteActionUtil(fullReport, isReportArchived);
    const actionsCollection: OnyxCollection<ReportActionsType> = {
        [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`]: reportActions ?? undefined,
    };
    if (reportAttributes?.oneTransactionThreadReportID) {
        actionsCollection[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportAttributes.oneTransactionThreadReportID}`] = transactionThreadReportActions ?? undefined;
    }
    const lastAction = getLastVisibleActionIncludingTransactionThread(
        reportID,
        canUserPerformWrite,
        actionsCollection,
        visibleReportActionsData,
        reportAttributes?.oneTransactionThreadReportID,
    );
    // getLastMessageTextForReport swaps an IOU CREATE/TRACK last action of a one-transaction report for the report's own last action
    const ownLastAction =
        reportAttributes?.oneTransactionThreadReportID && isMoneyRequestAction(lastAction)
            ? getLastVisibleAction(reportID, canUserPerformWrite, {}, {[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`]: reportActions ?? undefined}, visibleReportActionsData)
            : undefined;
    const whisperTransactionID = isActionableTrackExpense(lastAction) ? getOriginalMessage(lastAction)?.transactionID : undefined;
    const lastActionReportID = isInviteOrRemovedAction(lastAction) && lastAction?.actionName ? getOriginalMessage(lastAction)?.reportID : undefined;
    const reportNameIDs = [reportID, lastActionReportID ? String(lastActionReportID) : undefined, ...getActionReportIDs(lastAction), ...getActionReportIDs(ownLastAction)];

    const [invoiceReceiverPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(invoiceReceiverPolicyID)}`);
    const [whisperTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(whisperTransactionID)}`);
    const [lastActionReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(lastActionReportID ? String(lastActionReportID) : undefined)}`);
    const [movedFromReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getMovedReportID(lastAction, CONST.REPORT.MOVE_TYPE.FROM)}`);
    const [movedToReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getMovedReportID(lastAction, CONST.REPORT.MOVE_TYPE.TO)}`);
    const [reportNames] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {
        selector: (attributes: OnyxEntry<ReportAttributesDerivedValue>) => reportNamesByIDsSelector(attributes, reportNameIDs),
    });
    const [personalDetails] = usePersonalDetailsByIDs(
        getOptionRowAccountIDs({
            report: fullReport,
            parentReportAction,
            parentReportActionActorAccountID,
            invoiceChatReceiverAccountID,
            lastAction,
            ownLastAction,
            reimburserAccountID,
            currentUserAccountID,
        }),
    );
    const card = useGetExpensifyCardFromReportAction({reportAction: lastAction, policyID: fullReport?.policyID});
    const reportPreviewSenderID = useReportPreviewSenderID({
        iouReport: isIOUReport ? fullReport : undefined,
        action: parentReportAction,
        chatReport: chatReportForIOU,
    });

    const isReportFocused = isOptionFocused && currentReportIDValue === reportID;
    const hasDraftComment = !!draftComment && !draftComment.match(CONST.REGEX.EMPTY_COMMENT);
    const lastMessageTextFromReport = whisperTransactionID && !whisperTransaction ? '' : undefined;

    // React Compiler auto-memoizes each expression in OptionRowLHN independently,
    // so there is no need to stabilize the optionItem reference with deepEqual.
    // When getOptionData returns a fresh object with the same content, the Compiler
    // ensures that only expressions whose inputs actually changed recompute.
    const optionItem = SidebarUtils.getOptionData({
        dateFnsLocale,
        report: fullReport,
        reportAttributes,
        oneTransactionThreadReport,
        reportNameValuePairs,
        personalDetails: personalDetails ?? EMPTY_PERSONAL_DETAILS,
        policy,
        parentReportAction,
        conciergeReportID,
        lastMessageTextFromReport,
        invoiceReceiverPolicy,
        card,
        lastAction,
        translate,
        convertToDisplayString,
        convertToDisplayStringWithoutCurrency,
        localeCompare,
        isReportArchived,
        lastActionReport,
        movedFromReport,
        movedToReport,
        currentUserAccountID,
        reportAttributesDerived: reportNames,
        visibleReportActionsData,
        policyTags,
        currentUserLogin: login ?? '',
        isTrackIntentUser,
        formatPhoneNumber,
        rules,
        bankAccountList,
    });

    // For single-sender IOUs, trim to the sender's avatar to match the header.
    // The header uses reportPreviewSenderID as accountID for its primary avatar,
    // so we pick the matching icon from getIconsForIOUReport to stay consistent.
    let finalOptionItem = optionItem;
    if (optionItem && isIOUReport && reportPreviewSenderID !== undefined && optionItem.icons && optionItem.icons.length > 1) {
        const senderIcon = optionItem.icons.find((icon) => Number(icon.id) === reportPreviewSenderID);
        finalOptionItem = {...optionItem, icons: [senderIcon ?? optionItem.icons.at(0)].filter((icon): icon is Icon => !!icon)};
    }

    const isInFocusMode = viewMode === CONST.OPTION_MODE.COMPACT;
    const placeholderRowStyle = StyleSheet.flatten<ViewStyle>(
        isInFocusMode
            ? [styles.chatLinkRowPressable, styles.flexGrow1, styles.optionItemAvatarNameWrapper, styles.optionRowCompact, styles.justifyContentCenter]
            : [styles.chatLinkRowPressable, styles.flexGrow1, styles.optionItemAvatarNameWrapper, styles.optionRow, styles.justifyContentCenter],
    );

    // rendering null as a render item causes the FlashList to render all
    // its children and consume significant memory on the first render. We can avoid this by
    // rendering a placeholder view instead. This behaviour is only observed when we
    // first sign in to the App.
    // For the focused-but-null case (e.g. submit an expense in offline mode and click on the
    // generated expense report), we render null so we only see the Report Details but no item in LHN.
    if (!finalOptionItem) {
        return isReportFocused ? null : <View style={placeholderRowStyle} />;
    }

    const shouldShowMarkAsDoneCopy =
        shouldShowMarkAsDone({
            report: fullReport,
            isTrackIntentUser,
            policy,
            rules,
        }) && finalOptionItem?.actionBadge === CONST.REPORT.ACTION_BADGE.SUBMIT;

    return (
        <OptionRowLHN
            {...propsToForward}
            viewMode={viewMode}
            isOptionFocused={isReportFocused}
            optionItem={finalOptionItem}
            hasDraftComment={hasDraftComment}
            shouldShowMarkAsDoneCopy={shouldShowMarkAsDoneCopy}
        />
    );
}

OptionRowLHNData.displayName = 'OptionRowLHNData';

export default OptionRowLHNData;
