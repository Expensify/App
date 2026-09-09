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
    hasExpensifyGuidesEmails,
    isArchivedReport,
    navigateToLinkedReportAction,
} from '@libs/ReportUtils';

import {navigateToConciergeChatAndDeleteReport} from '@userActions/Report';

import ONYXKEYS from '@src/ONYXKEYS';
import {getStableReportSelector} from '@src/selectors/Report';
import type {Beta, IntroSelected, PersonalDetails, Report, ReportAction, ReportNameValuePairs} from '@src/types/onyx';
import type {Errors} from '@src/types/onyx/OnyxCommon';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {personalDetailsSelector} from '@selectors/PersonalDetails';
import React from 'react';

import ReportActionItem from './ReportActionItem';
import ThreadDivider from './ThreadDivider';

type AncestorReportActionItemProps = {
    /** Report for this action */
    report: Report;

    reportAction: ReportAction;

    /** Should we display the new marker on top of the comment? */
    shouldDisplayNewMarker: boolean;

    reportNameValuePairs: OnyxCollection<ReportNameValuePairs>;

    /** Beta features list */
    allBetas: OnyxEntry<Beta[]>;

    conciergePersonalDetail: OnyxEntry<PersonalDetails>;
    conciergeReportID: string | undefined;
    currentUserAccountID: number;

    /** Model of onboarding */
    introSelected: OnyxEntry<IntroSelected>;

    isFirstVisibleReportAction: boolean;
    isReportArchived: boolean;

    /** Whether the user has viewed the self-guided tour */
    isSelfTourViewed: boolean | undefined;

    linkedTransactionRouteError: Errors | undefined;
    parentReportAction: OnyxEntry<ReportAction>;
    shouldUseThreadDividerLine: boolean;
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
    const [guideAccountIDs] = useOnyx(ONYXKEYS.DERIVED.GUIDE_ACCOUNT_IDS);
    const hasGuidesEmails = hasExpensifyGuidesEmails(Object.keys(report?.participants ?? {}).map(Number), guideAccountIDs);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.chatReportID)}`, {selector: getStableReportSelector});

    const shouldDisplayThreadDivider = !isTripPreview(reportAction);
    const isAncestorReportArchived = isArchivedReport(reportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`]);
    const canOpenAncestorReport = canCurrentUserOpenReport(report, allBetas, hasGuidesEmails, isAncestorReportArchived);

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
