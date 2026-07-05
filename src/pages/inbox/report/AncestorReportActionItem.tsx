import OfflineWithFeedback from '@components/OfflineWithFeedback';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isTripPreview} from '@libs/ReportActionsUtils';
import {
    canCurrentUserOpenReport,
    canUserPerformWriteAction as canUserPerformWriteActionReportUtils,
    isArchivedReport,
    navigateToLinkedReportAction,
    resolveHasGuidesEmails,
} from '@libs/ReportUtils';

import {navigateToConciergeChatAndDeleteReport} from '@userActions/Report';

import ONYXKEYS from '@src/ONYXKEYS';
import {getStableReportSelector} from '@src/selectors/Report';
import type {Beta, IntroSelected, PersonalDetails, Report, ReportAction, ReportNameValuePairs} from '@src/types/onyx';
import type {Errors} from '@src/types/onyx/OnyxCommon';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {hasExpensifyGuidesEmailsSelector, personalDetailsSelector} from '@selectors/PersonalDetails';
import React, {useMemo} from 'react';

import ReportActionItem from './ReportActionItem';
import ThreadDivider from './ThreadDivider';

type AncestorReportActionItemProps = {
    /** Report for this action */
    report: Report;

    /** All the data of the action item */
    reportAction: ReportAction;

    /** Should we display the new marker on top of the comment? */
    shouldDisplayNewMarker: boolean;

    /** Report name value pairs for the ancestor reports */
    reportNameValuePairs: OnyxCollection<ReportNameValuePairs>;

    /** Beta features list */
    allBetas: OnyxEntry<Beta[]>;

    /** Concierge personal details */
    conciergePersonalDetail: OnyxEntry<PersonalDetails>;

    /** The user's Concierge reportID */
    conciergeReportID: string | undefined;

    /** Account ID of the current user */
    currentUserAccountID: number;

    /** Model of onboarding */
    introSelected: OnyxEntry<IntroSelected>;

    /** If this is the first visible report action */
    isFirstVisibleReportAction: boolean;

    /** Whether the current report is archived */
    isReportArchived: boolean;

    /** Whether the user has viewed the self-guided tour */
    isSelfTourViewed: boolean | undefined;

    /** Linked transaction route error */
    linkedTransactionRouteError: Errors | undefined;

    /** Report action belonging to the report's parent */
    parentReportAction: OnyxEntry<ReportAction>;

    /** If the thread divider line will be used */
    shouldUseThreadDividerLine: boolean;

    /** The transaction thread report associated with the current report, if any */
    transactionThreadReport: OnyxEntry<Report>;
};

function AncestorReportActionItem({
    report,
    reportAction,
    shouldDisplayNewMarker,
    reportNameValuePairs,
    allBetas,
    conciergePersonalDetail,
    conciergeReportID,
    currentUserAccountID,
    introSelected,
    isFirstVisibleReportAction,
    isReportArchived,
    isSelfTourViewed,
    linkedTransactionRouteError,
    parentReportAction,
    shouldUseThreadDividerLine,
    transactionThreadReport,
}: AncestorReportActionItemProps) {
    const styles = useThemeStyles();
    const currentUserPersonalDetail = useCurrentUserPersonalDetails();
    const [reportOwnerPersonalDetail] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        selector: personalDetailsSelector(report?.ownerAccountID),
    });
    const participantAccountIDs = useMemo(() => Object.keys(report?.participants ?? {}).map(Number), [report?.participants]);
    const guidesEmailsSelector = useMemo(() => hasExpensifyGuidesEmailsSelector(participantAccountIDs), [participantAccountIDs]);
    const [hasGuidesEmails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: guidesEmailsSelector}, [guidesEmailsSelector]);
    const resolvedHasGuidesEmails = useMemo(() => resolveHasGuidesEmails({participantAccountIDs, hasGuidesEmails}), [participantAccountIDs, hasGuidesEmails]);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.chatReportID)}`, {selector: getStableReportSelector});

    const shouldDisplayThreadDivider = !isTripPreview(reportAction);
    const isAncestorReportArchived = isArchivedReport(reportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`]);
    const canOpenAncestorReport = canCurrentUserOpenReport(report, allBetas, resolvedHasGuidesEmails, isAncestorReportArchived);

    const {isOffline} = useNetwork();
    const {isInNarrowPaneModal} = useResponsiveLayout();

    const openLinkedAncestorReport = (isArchived: boolean) => {
        navigateToLinkedReportAction(
            {
                report,
                reportAction,
                shouldDisplayNewMarker,
            },
            isInNarrowPaneModal,
            canUserPerformWriteActionReportUtils(report, isArchived),
            isOffline,
        );
    };

    const openAncestorReport = () => {
        openLinkedAncestorReport(isReportArchived);
    };

    const openAncestorReportFromThreadDivider = () => {
        openLinkedAncestorReport(isAncestorReportArchived);
    };

    const deleteAncestorReportAndNavigateToConcierge = () => {
        navigateToConciergeChatAndDeleteReport(
            report?.reportID,
            conciergeReportID,
            currentUserAccountID,
            introSelected,
            isSelfTourViewed,
            allBetas,
            reportOwnerPersonalDetail,
            currentUserPersonalDetail,
            conciergePersonalDetail,
        );
    };

    return (
        <OfflineWithFeedback
            shouldDisableOpacity={!!reportAction?.pendingAction}
            pendingAction={report?.pendingFields?.addWorkspaceRoom ?? report?.pendingFields?.createChat}
            errors={report?.errorFields?.addWorkspaceRoom ?? report?.errorFields?.createChat}
            errorRowStyles={[styles.ml10, styles.mr2]}
            onClose={deleteAncestorReportAndNavigateToConcierge}
        >
            {shouldDisplayThreadDivider && (
                <ThreadDivider
                    shouldDisplayNewMarker={shouldDisplayNewMarker}
                    onPress={canOpenAncestorReport ? openAncestorReportFromThreadDivider : undefined}
                />
            )}
            <ReportActionItem
                report={report}
                action={reportAction}
                onPress={canOpenAncestorReport ? openAncestorReport : undefined}
                parentReportAction={parentReportAction}
                transactionThreadReport={transactionThreadReport}
                chatReport={chatReport}
                displayAsGroup={false}
                shouldDisplayNewMarker={shouldDisplayNewMarker}
                isFirstVisibleReportAction={isFirstVisibleReportAction}
                shouldUseThreadDividerLine={shouldUseThreadDividerLine}
                isThreadReportParentAction
                linkedTransactionRouteError={linkedTransactionRouteError}
            />
        </OfflineWithFeedback>
    );
}

export default AncestorReportActionItem;
