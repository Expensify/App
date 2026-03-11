import {useRoute} from '@react-navigation/native';
import type {ReactNode} from 'react';
import React, {useEffect, useMemo, useState} from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import useIsReportReadyToDisplay from '@hooks/useIsReportReadyToDisplay';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useParentReportAction from '@hooks/useParentReportAction';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import {isReportTransactionThread, isTaskReport, isValidReportIDFromPath} from '@libs/ReportUtils';
import {getParentReportActionDeletionStatus} from '@libs/TransactionNavigationUtils';
import {readNewestAction} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import LinkedActionNotFoundGuard from './LinkedActionNotFoundGuard';

const defaultReportMetadata = {
    hasOnceLoadedReportActions: false,
    isLoadingInitialReportActions: true,
    isLoadingOlderReportActions: false,
    hasLoadingOlderReportActionsError: false,
    isLoadingNewerReportActions: false,
    hasLoadingNewerReportActionsError: false,
    isOptimisticReport: false,
};

type ReportNotFoundGuardProps = {
    children: ReactNode;
};

/**
 * Owns not-found rendering logic. Renders FullPageNotFoundView or children.
 * Navigation-on-removal is handled by ReportNavigateAwayHandler (sibling).
 * Linked action not-found logic is delegated to LinkedActionNotFoundGuard (child).
 */
// eslint-disable-next-line rulesdir/no-negated-variables
function ReportNotFoundGuard({children}: ReportNotFoundGuardProps) {
    const styles = useThemeStyles();
    const route = useRoute();
    const routeParams = route.params as {reportID?: string} | undefined;
    const reportIDFromRoute = getNonEmptyStringOnyxID(routeParams?.reportID);

    const {isOffline} = useNetwork();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const [firstRender, setFirstRender] = useState(true);

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`);
    const [parentReportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${report?.parentReportID}`);
    const [userLeavingStatus = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_LEAVING_ROOM}${reportIDFromRoute}`);
    const [reportMetadata = defaultReportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportIDFromRoute}`);
    const [isLoadingReportData = true] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA);
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [deleteTransactionNavigateBackUrl] = useOnyx(ONYXKEYS.NVP_DELETE_TRANSACTION_NAVIGATE_BACK_URL);

    const parentReportAction = useParentReportAction(report);
    const reportID = report?.reportID;
    const isOptimisticDelete = report?.statusNum === CONST.REPORT.STATUS_NUM.CLOSED;

    const isReportArchived = useReportIsArchived(report?.reportID);
    const {isEditingDisabled} = useIsReportReadyToDisplay(report, reportIDFromRoute, isReportArchived);

    // --- Parent action deletion status ---
    const {isParentActionMissingAfterLoad, isParentActionDeleted} = getParentReportActionDeletionStatus({
        parentReportID: report?.parentReportID,
        parentReportActionID: report?.parentReportActionID,
        parentReportAction,
        parentReportMetadata,
        isOffline,
    });
    const isDeletedTransactionThread = isReportTransactionThread(report) && (isParentActionDeleted || isParentActionMissingAfterLoad);

    const currentReportIDFormRoute = (route.params as {reportID?: string} | undefined)?.reportID;

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = useMemo((): boolean => {
        const isInvalidReportPath = !!currentReportIDFormRoute && !isValidReportIDFromPath(currentReportIDFormRoute);
        const isLoading = isLoadingApp !== false || isLoadingReportData || (!isOffline && !!reportMetadata?.isLoadingInitialReportActions);
        const reportExists = !!reportID || (!isDeletedTransactionThread && isOptimisticDelete) || userLeavingStatus;

        if (deleteTransactionNavigateBackUrl) {
            return false;
        }
        if (isDeletedTransactionThread) {
            return true;
        }
        if (isInvalidReportPath) {
            return true;
        }
        if (isLoading) {
            return false;
        }
        if (firstRender) {
            return false;
        }
        return !reportExists;
    }, [
        isLoadingApp,
        isLoadingReportData,
        isOffline,
        reportMetadata?.isLoadingInitialReportActions,
        reportID,
        isOptimisticDelete,
        userLeavingStatus,
        currentReportIDFormRoute,
        firstRender,
        deleteTransactionNavigateBackUrl,
        isDeletedTransactionThread,
    ]);

    // --- Track firstRender ---
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFirstRender(false);
    }, []);

    // --- Task report init ---
    useEffect(() => {
        if (!!report?.lastReadTime || !isTaskReport(report)) {
            return;
        }
        readNewestAction(report?.reportID, !!reportMetadata?.hasOnceLoadedReportActions);
    }, [report, reportMetadata?.hasOnceLoadedReportActions]);

    return (
        <FullPageNotFoundView
            shouldShow={shouldShowNotFoundPage}
            subtitleKey="notFound.noAccess"
            subtitleStyle={[styles.textSupporting]}
            shouldShowBackButton={shouldUseNarrowLayout}
            onBackButtonPress={Navigation.goBack}
            shouldDisplaySearchRouter
        >
            <DragAndDropProvider isDisabled={isEditingDisabled}>
                <LinkedActionNotFoundGuard>{children}</LinkedActionNotFoundGuard>
            </DragAndDropProvider>
        </FullPageNotFoundView>
    );
}

export default ReportNotFoundGuard;
