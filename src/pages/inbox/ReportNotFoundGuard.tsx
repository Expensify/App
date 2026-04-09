import {useRoute} from '@react-navigation/native';
import type {ReactNode} from 'react';
import React, {useEffect} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useParentReportAction from '@hooks/useParentReportAction';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import {isReportTransactionThread, isValidReportIDFromPath} from '@libs/ReportUtils';
import {getParentReportActionDeletionStatus} from '@libs/TransactionNavigationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isLoadingInitialReportActionsSelector} from '@src/selectors/ReportMetaData';
import type * as OnyxTypes from '@src/types/onyx';

type ReportNotFoundGuardProps = {
    children: ReactNode;
};

/**
 * Two-level gate: the outer guard subscribes to lightweight keys to determine
 * whether the report clearly exists. When it does (and the report is not a
 * transaction thread), children render directly without the cost of
 * parentReportMetadata / useParentReportAction subscriptions.
 *
 * The inner gate mounts only when the "not found" path is plausible:
 * the report is missing, the path is invalid, or the report is a transaction
 * thread whose parent action may have been deleted.
 */
// eslint-disable-next-line rulesdir/no-negated-variables
function ReportNotFoundGuard({children}: ReportNotFoundGuardProps) {
    const route = useRoute();
    const routeParams = route.params as {reportID?: string} | undefined;
    const reportIDFromRoute = getNonEmptyStringOnyxID(routeParams?.reportID);

    const {isOffline} = useNetwork();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`);
    const [userLeavingStatus = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_LEAVING_ROOM}${reportIDFromRoute}`);
    const [isLoadingInitialReportActions = true] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportIDFromRoute}`, {
        selector: isLoadingInitialReportActionsSelector,
    });
    const [isLoadingReportData = true] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA);
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [deleteTransactionNavigateBackUrl] = useOnyx(ONYXKEYS.NVP_DELETE_TRANSACTION_NAVIGATE_BACK_URL);

    const reportID = report?.reportID;
    const isOptimisticDelete = report?.statusNum === CONST.REPORT.STATUS_NUM.CLOSED;
    const isInvalidReportPath = !!routeParams?.reportID && !isValidReportIDFromPath(routeParams.reportID);
    const isLoading = isLoadingApp !== false || isLoadingReportData || (!isOffline && !!isLoadingInitialReportActions);
    const mayBeTransactionThread = isReportTransactionThread(report);

    // Fast path: skip the expensive inner guard (parentReportMetadata, useParentReportAction)
    // when we can determine shouldShowNotFoundPage is definitely false.
    //
    // shouldShowNotFoundPage is false when:
    //  - deleteTransactionNavigateBackUrl is set (always suppresses not-found), OR
    //  - path is valid AND report is not a transaction thread AND (still loading OR report exists)
    const reportClearlyExists = !!reportID || isOptimisticDelete || userLeavingStatus;
    const canSkipInnerGuard = !!deleteTransactionNavigateBackUrl || (!isInvalidReportPath && !mayBeTransactionThread && (isLoading || reportClearlyExists));
    if (canSkipInnerGuard) {
        return children;
    }

    return (
        <ReportNotFoundInnerGuard
            report={report}
            reportIDFromPath={routeParams?.reportID}
            reportID={reportID}
            isOptimisticDelete={isOptimisticDelete}
            isInvalidReportPath={isInvalidReportPath}
            isLoading={isLoading}
            isLoadingApp={isLoadingApp}
            isLoadingReportData={isLoadingReportData}
            isLoadingInitialReportActions={isLoadingInitialReportActions}
            isOffline={isOffline}
            userLeavingStatus={userLeavingStatus}
            deleteTransactionNavigateBackUrl={deleteTransactionNavigateBackUrl}
        >
            {children}
        </ReportNotFoundInnerGuard>
    );
}

type ReportNotFoundInnerGuardProps = {
    report: OnyxEntry<OnyxTypes.Report>;
    reportIDFromPath: string | undefined;
    reportID: string | undefined;
    isOptimisticDelete: boolean;
    isInvalidReportPath: boolean;
    isLoading: boolean;
    isLoadingApp: OnyxEntry<boolean>;
    isLoadingReportData: boolean;
    isLoadingInitialReportActions: boolean;
    isOffline: boolean;
    userLeavingStatus: boolean;
    deleteTransactionNavigateBackUrl: OnyxEntry<string>;
    children: ReactNode;
};

// eslint-disable-next-line rulesdir/no-negated-variables
function ReportNotFoundInnerGuard({
    report,
    reportIDFromPath,
    reportID,
    isOptimisticDelete,
    isInvalidReportPath,
    isLoading,
    isLoadingApp,
    isLoadingReportData,
    isLoadingInitialReportActions,
    isOffline,
    userLeavingStatus,
    deleteTransactionNavigateBackUrl,
    children,
}: ReportNotFoundInnerGuardProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const [parentReportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${report?.parentReportID}`);
    const parentReportAction = useParentReportAction(report);

    const {isParentActionMissingAfterLoad, isParentActionDeleted} = getParentReportActionDeletionStatus({
        parentReportID: report?.parentReportID,
        parentReportActionID: report?.parentReportActionID,
        parentReportAction,
        parentReportMetadata,
        isOffline,
    });
    const isDeletedTransactionThread = isReportTransactionThread(report) && (isParentActionDeleted || isParentActionMissingAfterLoad);

    const reportExists = !!reportID || (!isDeletedTransactionThread && isOptimisticDelete) || userLeavingStatus;

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = !deleteTransactionNavigateBackUrl && (isDeletedTransactionThread || isInvalidReportPath || (!isLoading && !reportExists));

    useEffect(() => {
        if (!shouldShowNotFoundPage) {
            return;
        }

        Log.info('[ReportScreen] Displaying NotFound Page', false, {
            isLoadingApp,
            isLoadingReportData,
            isOffline,
            isLoadingInitialReportActions,
            reportID,
            isOptimisticDelete,
            userLeavingStatus,
            reportIDFromPath,
            deleteTransactionNavigateBackUrl,
            isDeletedTransactionThread,
            isParentActionDeleted,
            isParentActionMissingAfterLoad,
        });
    }, [
        shouldShowNotFoundPage,
        isLoadingApp,
        isLoadingReportData,
        isOffline,
        isLoadingInitialReportActions,
        reportID,
        isOptimisticDelete,
        userLeavingStatus,
        reportIDFromPath,
        deleteTransactionNavigateBackUrl,
        isDeletedTransactionThread,
        isParentActionDeleted,
        isParentActionMissingAfterLoad,
    ]);

    return (
        <FullPageNotFoundView
            shouldShow={shouldShowNotFoundPage}
            subtitleKey="notFound.noAccess"
            subtitleStyle={[styles.textSupporting]}
            shouldShowBackButton={shouldUseNarrowLayout}
            onBackButtonPress={Navigation.goBack}
            shouldShowLink={false}
            shouldDisplaySearchRouter
        >
            {children}
        </FullPageNotFoundView>
    );
}

ReportNotFoundGuard.displayName = 'ReportNotFoundGuard';

export default ReportNotFoundGuard;
