import {useRoute} from '@react-navigation/native';
import type {ReactNode} from 'react';
import React, {useEffect} from 'react';
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

type ReportNotFoundGuardProps = {
    children: ReactNode;
};

/**
 * The outer guard subscribes to lightweight keys and handles
 * all "obvious" not-found cases (invalid path, report missing after load).
 *
 */
// eslint-disable-next-line rulesdir/no-negated-variables
function ReportNotFoundGuard({children}: ReportNotFoundGuardProps) {
    const route = useRoute();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
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
    const reportExists = !!reportID || isOptimisticDelete || userLeavingStatus;

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = !deleteTransactionNavigateBackUrl && (isInvalidReportPath || (!isLoading && !reportExists));

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
            reportIDFromPath: routeParams?.reportID,
            deleteTransactionNavigateBackUrl,
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
        routeParams?.reportID,
        deleteTransactionNavigateBackUrl,
    ]);

    if (shouldShowNotFoundPage) {
        return (
            <FullPageNotFoundView
                shouldShow
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

    if (!deleteTransactionNavigateBackUrl && isReportTransactionThread(report)) {
        return <ReportNotFoundInnerGuard reportIDFromPath={routeParams?.reportID}>{children}</ReportNotFoundInnerGuard>;
    }

    return children;
}

type ReportNotFoundInnerGuardProps = {
    reportIDFromPath: string | undefined;
    children: ReactNode;
};

/**
 * Inner guard for transaction threads only. Subscribes to the expensive
 * parentReportMetadata and parentReportAction to detect deleted parent actions.
 */
// eslint-disable-next-line rulesdir/no-negated-variables
function ReportNotFoundInnerGuard({reportIDFromPath, children}: ReportNotFoundInnerGuardProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isOffline} = useNetwork();

    const reportIDFromRoute = getNonEmptyStringOnyxID(reportIDFromPath);

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`);
    const [parentReportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${report?.parentReportID}`);
    const parentReportAction = useParentReportAction(report);

    const {isParentActionMissingAfterLoad, isParentActionDeleted} = getParentReportActionDeletionStatus({
        parentReportID: report?.parentReportID,
        parentReportActionID: report?.parentReportActionID,
        parentReportAction,
        parentReportMetadata,
        isOffline,
    });
    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = isParentActionDeleted || isParentActionMissingAfterLoad;

    useEffect(() => {
        if (!shouldShowNotFoundPage) {
            return;
        }
        Log.info('[ReportScreen] Displaying NotFound Page (deleted transaction thread)', false, {
            reportIDFromPath,
            isParentActionDeleted,
            isParentActionMissingAfterLoad,
        });
    }, [shouldShowNotFoundPage, reportIDFromPath, isParentActionDeleted, isParentActionMissingAfterLoad]);

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
