import {getReportActionsForReportIDs} from '@selectors/ReportAction';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useAncestors from '@hooks/useAncestors';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import {getOriginalMessage, isMoneyRequestAction, isTripPreview} from '@libs/ReportActionsUtils';
import {
    canCurrentUserOpenReport,
    canUserPerformWriteAction as canUserPerformWriteActionReportUtils,
    getOriginalReportID,
    isArchivedReport,
    navigateToLinkedReportAction,
    shouldExcludeAncestorReportAction,
} from '@libs/ReportUtils';
import {navigateToConciergeChatAndDeleteReport} from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Policy, Report, ReportAction, ReportActionReactions, ReportActions, ReportActionsDrafts, ReportNameValuePairs, Transaction} from '@src/types/onyx';
import AnimatedEmptyStateBackground from './AnimatedEmptyStateBackground';
import RepliesDivider from './RepliesDivider';
import ReportActionItem from './ReportActionItem';
import ThreadDivider from './ThreadDivider';

type ReportActionItemParentActionProps = {
    /** All the data of the policy collection */
    policies: OnyxCollection<Policy>;

    /** All the data of the action item */
    action: ReportAction;

    /** Flag to show, hide the thread divider line */
    shouldHideThreadDividerLine?: boolean;

    /** Position index of the report parent action in the overall report FlatList view */
    index: number;

    /** The id of the report */
    // eslint-disable-next-line react/no-unused-prop-types
    reportID: string;

    /** The current report is displayed */
    report: OnyxEntry<Report>;

    /** The transaction thread report associated with the current report, if any */
    transactionThreadReport: OnyxEntry<Report>;

    /** Report actions belonging to the report's parent */
    parentReportAction: OnyxEntry<ReportAction>;

    /** Whether we should display "Replies" divider */
    shouldDisplayReplyDivider: boolean;

    /** If this is the first visible report action */
    isFirstVisibleReportAction: boolean;

    /** If the thread divider line will be used */
    shouldUseThreadDividerLine?: boolean;

    /** User wallet tierName */
    userWalletTierName: string | undefined;

    /** Whether the user is validated */
    isUserValidated: boolean | undefined;

    /** Personal details list */
    personalDetails: OnyxEntry<PersonalDetailsList>;

    /** All draft messages collection */
    allDraftMessages?: OnyxCollection<ReportActionsDrafts>;

    /** All emoji reactions collection */
    allEmojiReactions?: OnyxCollection<ReportActionReactions>;

    /** User billing fund ID */
    userBillingFundID: number | undefined;

    /** Did the user dismiss trying out NewDot? If true, it means they prefer using OldDot */
    isTryNewDotNVPDismissed: boolean | undefined;

    /** Whether the report is archived */
    isReportArchived: boolean;
};

function ReportActionItemParentAction({
    policies,
    report,
    action,
    transactionThreadReport,
    parentReportAction,
    index = 0,
    shouldHideThreadDividerLine = false,
    shouldDisplayReplyDivider,
    isFirstVisibleReportAction = false,
    shouldUseThreadDividerLine = false,
    userWalletTierName,
    isUserValidated,
    personalDetails,
    allDraftMessages,
    allEmojiReactions,
    userBillingFundID,
    isTryNewDotNVPDismissed = false,
    isReportArchived = false,
}: ReportActionItemParentActionProps) {
    const styles = useThemeStyles();
    const ancestors = useAncestors(report, shouldExcludeAncestorReportAction);
    const {isOffline} = useNetwork();
    const {isInNarrowPaneModal} = useResponsiveLayout();
    const transactionID = isMoneyRequestAction(action) && getOriginalMessage(action)?.IOUTransactionID;
    const [allBetas] = useOnyx(ONYXKEYS.BETAS);

    const getLinkedTransactionRouteError = useCallback((transaction: OnyxEntry<Transaction>) => {
        return transaction?.errorFields?.route;
    }, []);

    const [linkedTransactionRouteError] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {selector: getLinkedTransactionRouteError});

    const ancestorReportNameValuePairsSelector = useCallback(
        (allReportNameValuePairs: OnyxCollection<ReportNameValuePairs>) => {
            if (!allReportNameValuePairs) {
                return {};
            }
            const ancestorReportNameValuePairs: OnyxCollection<ReportNameValuePairs> = {};
            for (const ancestor of ancestors) {
                ancestorReportNameValuePairs[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${ancestor.report.reportID}`] =
                    allReportNameValuePairs[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${ancestor.report.reportID}`];
            }
            return ancestorReportNameValuePairs;
        },
        [ancestors],
    );

    const [ancestorsReportNameValuePairs] = useOnyx(
        ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS,
        {
            selector: ancestorReportNameValuePairsSelector,
        },
        [ancestors],
    );

    const ancestorReportActionsSelector = useCallback(
        (allReportActions: OnyxCollection<ReportActions>) => {
            const reportIDs = ancestors.map((ancestor) => ancestor.report.reportID);
            return getReportActionsForReportIDs(allReportActions, reportIDs);
        },
        [ancestors],
    );

    const [ancestorsReportActions] = useOnyx(
        ONYXKEYS.COLLECTION.REPORT_ACTIONS,
        {
            selector: ancestorReportActionsSelector,
        },
        [ancestors],
    );
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    return (
        <View style={[styles.pRelative]}>
            <AnimatedEmptyStateBackground />
            <OfflineWithFeedback
                shouldDisableOpacity
                errors={
                    report?.errorFields?.createChatThread ?? (report?.errorFields?.createChat ? getMicroSecondOnyxErrorWithTranslationKey('report.genericCreateReportFailureMessage') : null)
                }
                errorRowStyles={[styles.ml10, styles.mr2]}
                onClose={() => navigateToConciergeChatAndDeleteReport(report?.reportID, conciergeReportID, undefined, true)}
            >
                {ancestors.map((ancestor) => {
                    const {report: ancestorReport, reportAction: ancestorReportAction} = ancestor;
                    const canUserPerformWriteAction = canUserPerformWriteActionReportUtils(ancestorReport, isReportArchived);
                    const shouldDisplayThreadDivider = !isTripPreview(ancestorReportAction);
                    const isAncestorReportArchived = isArchivedReport(ancestorsReportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${ancestorReport.reportID}`]);

                    const originalReportID = getOriginalReportID(
                        ancestorReport.reportID,
                        ancestorReportAction,
                        ancestorsReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${ancestorReport.reportID}`],
                    );
                    const reportDraftMessages = originalReportID ? allDraftMessages?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${originalReportID}`] : undefined;
                    const matchingDraftMessage = reportDraftMessages?.[ancestorReportAction.reportActionID];
                    const matchingDraftMessageString = matchingDraftMessage?.message;
                    const actionEmojiReactions = allEmojiReactions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${ancestorReportAction.reportActionID}`];

                    return (
                        <OfflineWithFeedback
                            key={ancestorReportAction.reportActionID}
                            shouldDisableOpacity={!!ancestorReportAction?.pendingAction}
                            pendingAction={ancestorReport?.pendingFields?.addWorkspaceRoom ?? ancestorReport?.pendingFields?.createChat}
                            errors={ancestorReport?.errorFields?.addWorkspaceRoom ?? ancestorReport?.errorFields?.createChat}
                            errorRowStyles={[styles.ml10, styles.mr2]}
                            onClose={() => navigateToConciergeChatAndDeleteReport(ancestorReport.reportID, conciergeReportID)}
                        >
                            {shouldDisplayThreadDivider && (
                                <ThreadDivider
                                    ancestor={ancestor}
                                    isLinkDisabled={!canCurrentUserOpenReport(ancestorReport, allBetas, isAncestorReportArchived)}
                                />
                            )}
                            <ReportActionItem
                                policies={policies}
                                onPress={
                                    canCurrentUserOpenReport(ancestorReport, allBetas, isAncestorReportArchived)
                                        ? () => navigateToLinkedReportAction(ancestor, isInNarrowPaneModal, canUserPerformWriteAction, isOffline)
                                        : undefined
                                }
                                parentReportAction={parentReportAction}
                                report={ancestorReport}
                                transactionThreadReport={transactionThreadReport}
                                action={ancestorReportAction}
                                displayAsGroup={false}
                                isMostRecentIOUReportAction={false}
                                shouldDisplayNewMarker={ancestor.shouldDisplayNewMarker}
                                index={index}
                                isFirstVisibleReportAction={isFirstVisibleReportAction}
                                shouldUseThreadDividerLine={shouldUseThreadDividerLine}
                                isThreadReportParentAction
                                userWalletTierName={userWalletTierName}
                                isUserValidated={isUserValidated}
                                personalDetails={personalDetails}
                                draftMessage={matchingDraftMessageString}
                                emojiReactions={actionEmojiReactions}
                                linkedTransactionRouteError={linkedTransactionRouteError}
                                userBillingFundID={userBillingFundID}
                                isTryNewDotNVPDismissed={isTryNewDotNVPDismissed}
                            />
                        </OfflineWithFeedback>
                    );
                })}
            </OfflineWithFeedback>
            {shouldDisplayReplyDivider && <RepliesDivider shouldHideThreadDividerLine={shouldHideThreadDividerLine} />}
        </View>
    );
}

export default ReportActionItemParentAction;
