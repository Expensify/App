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

// eslint-disable-next-line rulesdir/no-negated-variables
function ReportNotFoundGuard({children}: ReportNotFoundGuardProps) {
    const styles = useThemeStyles();
    const route = useRoute();
    const routeParams = route.params as {reportID?: string} | undefined;
    const reportIDFromRoute = getNonEmptyStringOnyxID(routeParams?.reportID);

    const {isOffline} = useNetwork();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`);
    const [parentReportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${report?.parentReportID}`);
    const [userLeavingStatus = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_LEAVING_ROOM}${reportIDFromRoute}`);
    const [isLoadingInitialReportActions = true] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportIDFromRoute}`, {
        selector: isLoadingInitialReportActionsSelector,
    });
    const [isLoadingReportData = true] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA);
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [deleteTransactionNavigateBackUrl] = useOnyx(ONYXKEYS.NVP_DELETE_TRANSACTION_NAVIGATE_BACK_URL);

    const parentReportAction = useParentReportAction(report);
    const reportID = report?.reportID;
    const isOptimisticDelete = report?.statusNum === CONST.REPORT.STATUS_NUM.CLOSED;

    const {isParentActionMissingAfterLoad, isParentActionDeleted} = getParentReportActionDeletionStatus({
        parentReportID: report?.parentReportID,
        parentReportActionID: report?.parentReportActionID,
        parentReportAction,
        parentReportMetadata,
        isOffline,
    });
    const isDeletedTransactionThread = isReportTransactionThread(report) && (isParentActionDeleted || isParentActionMissingAfterLoad);

    const isInvalidReportPath = !!routeParams?.reportID && !isValidReportIDFromPath(routeParams.reportID);
    const isLoading = isLoadingApp !== false || isLoadingReportData || (!isOffline && !!isLoadingInitialReportActions);
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
            reportIDFromPath: routeParams?.reportID,
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
        routeParams?.reportID,
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
