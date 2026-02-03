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
import {isTripPreview} from '@libs/ReportActionsUtils';
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
import type * as OnyxTypes from '@src/types/onyx';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import AnimatedEmptyStateBackground from './AnimatedEmptyStateBackground';
import RepliesDivider from './RepliesDivider';
import ReportActionItem from './ReportActionItem';
import ThreadDivider from './ThreadDivider';

type ReportActionItemParentActionProps = {
    /** All the data of the report collection */
    allReports: OnyxCollection<OnyxTypes.Report>;

    /** All the data of the policy collection */
    policies: OnyxCollection<OnyxTypes.Policy>;

    /** Flag to show, hide the thread divider line */
    shouldHideThreadDividerLine?: boolean;

    /** Position index of the report parent action in the overall report FlatList view */
    index: number;

    /** The id of the report */
    // eslint-disable-next-line react/no-unused-prop-types
    reportID: string;

    /** The current report is displayed */
    report: OnyxEntry<OnyxTypes.Report>;

    /** The transaction thread report associated with the current report, if any */
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;

    /** Array of report actions for this report */
    reportActions: OnyxTypes.ReportAction[];

    /** Report actions belonging to the report's parent */
    parentReportAction: OnyxEntry<OnyxTypes.ReportAction>;

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
    personalDetails: OnyxEntry<OnyxTypes.PersonalDetailsList>;

    /** All draft messages collection */
    allDraftMessages?: OnyxCollection<OnyxTypes.ReportActionsDrafts>;

    /** All emoji reactions collection */
    allEmojiReactions?: OnyxCollection<OnyxTypes.ReportActionReactions>;

    /** Linked transaction route error */
    linkedTransactionRouteError?: OnyxEntry<Errors>;

    /** User billing fund ID */
    userBillingFundID: number | undefined;

    /** Did the user dismiss trying out NewDot? If true, it means they prefer using OldDot */
    isTryNewDotNVPDismissed: boolean | undefined;

    /** Whether the report is archived */
    isReportArchived: boolean;
};

function ReportActionItemParentAction({
    allReports,
    policies,
    report,
    transactionThreadReport,
    reportActions,
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
    linkedTransactionRouteError,
    userBillingFundID,
    isTryNewDotNVPDismissed = false,
    isReportArchived = false,
}: ReportActionItemParentActionProps) {
    const styles = useThemeStyles();
    const ancestors = useAncestors(report, shouldExcludeAncestorReportAction);
    const {isOffline} = useNetwork();
    const {isInNarrowPaneModal} = useResponsiveLayout();

    const ancestorReportNameValuePairsSelector = useCallback(
        (allReportNameValuePairs: OnyxCollection<OnyxTypes.ReportNameValuePairs>) => {
            if (!allReportNameValuePairs) {
                return {};
            }
            const ancestorReportNameValuePairs: OnyxCollection<OnyxTypes.ReportNameValuePairs> = {};
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
            canBeMissing: true,
            selector: ancestorReportNameValuePairsSelector,
        },
        [ancestors],
    );

    return (
        <View style={[styles.pRelative]}>
            <AnimatedEmptyStateBackground />
            <OfflineWithFeedback
                shouldDisableOpacity
                errors={
                    report?.errorFields?.createChatThread ?? (report?.errorFields?.createChat ? getMicroSecondOnyxErrorWithTranslationKey('report.genericCreateReportFailureMessage') : null)
                }
                errorRowStyles={[styles.ml10, styles.mr2]}
                onClose={() => navigateToConciergeChatAndDeleteReport(report?.reportID, undefined, true)}
            >
                {ancestors.map((ancestor) => {
                    const {report: ancestorReport, reportAction: ancestorReportAction} = ancestor;
                    const canUserPerformWriteAction = canUserPerformWriteActionReportUtils(ancestorReport, isReportArchived);
                    const shouldDisplayThreadDivider = !isTripPreview(ancestorReportAction);
                    const isAncestorReportArchived = isArchivedReport(ancestorsReportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${ancestorReport.reportID}`]);

                    const originalReportID = getOriginalReportID(ancestorReport.reportID, ancestorReportAction);
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
                            onClose={() => navigateToConciergeChatAndDeleteReport(ancestorReport.reportID)}
                        >
                            {shouldDisplayThreadDivider && (
                                <ThreadDivider
                                    ancestor={ancestor}
                                    isLinkDisabled={!canCurrentUserOpenReport(ancestorReport, isAncestorReportArchived)}
                                />
                            )}
                            <ReportActionItem
                                allReports={allReports}
                                policies={policies}
                                onPress={
                                    canCurrentUserOpenReport(ancestorReport, isAncestorReportArchived)
                                        ? () => navigateToLinkedReportAction(ancestor, isInNarrowPaneModal, canUserPerformWriteAction, isOffline)
                                        : undefined
                                }
                                parentReportAction={parentReportAction}
                                report={ancestorReport}
                                reportActions={reportActions}
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
