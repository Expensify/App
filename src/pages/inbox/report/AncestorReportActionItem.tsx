import {personalDetailByAccountIDSelector} from '@selectors/PersonalDetails';
import React from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {isTripPreview} from '@libs/ReportActionsUtils';
import {canCurrentUserOpenReport, canUserPerformWriteAction as canUserPerformWriteActionReportUtils, isArchivedReport, navigateToLinkedReportAction} from '@libs/ReportUtils';
import {navigateToConciergeChatAndDeleteReport} from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Beta, IntroSelected, PersonalDetails, Report, ReportAction, ReportNameValuePairs} from '@src/types/onyx';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import ReportActionItem from './ReportActionItem';
import ThreadDivider from './ThreadDivider';

type AncestorReportActionItemProps = {
    report: Report;
    reportAction: ReportAction;
    shouldDisplayNewMarker: boolean;
    reportNameValuePairs: OnyxCollection<ReportNameValuePairs>;
    allBetas: OnyxEntry<Beta[]>;
    conciergePersonalDetail: OnyxEntry<PersonalDetails>;
    conciergeReportID: string | undefined;
    currentUserAccountID: number;
    index: number;
    introSelected: OnyxEntry<IntroSelected>;
    isFirstVisibleReportAction: boolean;
    isReportArchived: boolean;
    isSelfTourViewed: boolean | undefined;
    isTryNewDotNVPDismissed: boolean | undefined;
    linkedTransactionRouteError: Errors | undefined;
    parentReportAction: OnyxEntry<ReportAction>;
    shouldUseThreadDividerLine: boolean;
    transactionThreadReport: OnyxEntry<Report>;
    userBillingFundID: number | undefined;
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
    index,
    introSelected,
    isFirstVisibleReportAction,
    isReportArchived,
    isSelfTourViewed,
    isTryNewDotNVPDismissed,
    linkedTransactionRouteError,
    parentReportAction,
    shouldUseThreadDividerLine,
    transactionThreadReport,
    userBillingFundID,
}: AncestorReportActionItemProps) {
    const styles = useThemeStyles();
    const currentUserPersonalDetail = useCurrentUserPersonalDetails();
    const [reportOwnerPersonalDetail] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailByAccountIDSelector(report?.ownerAccountID)});

    const shouldDisplayThreadDivider = !isTripPreview(reportAction);
    const isAncestorReportArchived = isArchivedReport(reportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`]);
    const canOpenAncestorReport = canCurrentUserOpenReport(report, allBetas, isAncestorReportArchived);

    const {isOffline} = useNetwork();
    const {isInNarrowPaneModal} = useResponsiveLayout();

    const navigateToAncestorReportAction = (isArchived: boolean) => {
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

    const onPressReportActionItem = () => {
        navigateToAncestorReportAction(isReportArchived);
    };

    const onPressThreadDivider = () => {
        navigateToAncestorReportAction(isAncestorReportArchived);
    };

    const onCloseReportActionItem = () => {
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
            onClose={onCloseReportActionItem}
        >
            {shouldDisplayThreadDivider && (
                <ThreadDivider
                    shouldDisplayNewMarker={shouldDisplayNewMarker}
                    onPress={canOpenAncestorReport ? onPressThreadDivider : undefined}
                />
            )}
            <ReportActionItem
                report={report}
                action={reportAction}
                onPress={canOpenAncestorReport ? onPressReportActionItem : undefined}
                parentReportAction={parentReportAction}
                transactionThreadReport={transactionThreadReport}
                displayAsGroup={false}
                shouldDisplayNewMarker={shouldDisplayNewMarker}
                index={index}
                isFirstVisibleReportAction={isFirstVisibleReportAction}
                shouldUseThreadDividerLine={shouldUseThreadDividerLine}
                isThreadReportParentAction
                linkedTransactionRouteError={linkedTransactionRouteError}
                userBillingFundID={userBillingFundID}
                isTryNewDotNVPDismissed={isTryNewDotNVPDismissed}
            />
        </OfflineWithFeedback>
    );
}

export default AncestorReportActionItem;
