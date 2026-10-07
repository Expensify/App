import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useReportIsArchived from '@hooks/useReportIsArchived';

import {canAccessReport, hasExpensifyGuidesEmails} from '@libs/ReportUtils';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import useReportDeepLinkOnOpen from '@pages/inbox/report/useReportDeepLinkOnOpen';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {ReactElement} from 'react';
import type {OnyxEntry} from 'react-native-onyx';

import {useIsFocused} from '@react-navigation/native';
import React, {useState} from 'react';

import FullscreenLoadingIndicator from './FullscreenLoadingIndicator';

type ReportOrNotFoundDecision = 'null' | 'loading' | 'notFound' | 'content';

type ReportOrNotFoundDecisionParams = {
    shouldRequireReportID: boolean;
    isReportIdInRoute: boolean;
    isReportLoaded: boolean;
    report: OnyxEntry<OnyxTypes.Report>;
    isLoadingReportData: OnyxEntry<boolean>;
    shouldFetchReport: boolean;
    isDefaultRoomsBetaEnabled: boolean;
    hasGuidesEmails: boolean;
    isReportArchived: boolean;
    isFocused: boolean;
    hasShownContent: boolean;
    deleteTransactionNavigateBackUrl: OnyxEntry<string>;
};

function getReportOrNotFoundDecision({
    shouldRequireReportID,
    isReportIdInRoute,
    isReportLoaded,
    report,
    isLoadingReportData,
    shouldFetchReport,
    isDefaultRoomsBetaEnabled,
    hasGuidesEmails,
    isReportArchived,
    isFocused,
    hasShownContent,
    deleteTransactionNavigateBackUrl,
}: ReportOrNotFoundDecisionParams): ReportOrNotFoundDecision {
    if (!shouldRequireReportID && !isReportIdInRoute) {
        return 'content';
    }

    const shouldShowFullScreenLoadingIndicator = !isReportLoaded && (isLoadingReportData !== false || shouldFetchReport);
    const shouldShowNotFoundPage = !isReportLoaded || !canAccessReport(report, isDefaultRoomsBetaEnabled, hasGuidesEmails, isReportArchived);

    // If the content was shown, but it's not anymore, that means the report was deleted, and we are probably navigating out of this screen.
    // Return null for this case to avoid rendering FullScreenLoadingIndicator or NotFoundPage when animating transition.
    // We also suppress the NotFound page while a delete-transaction navigation is in flight (e.g. deleting an invoice
    // navigates back to the invoice room without synchronously removing focus from this details RHP), mirroring ReportNotFoundGuard.
    if (shouldShowNotFoundPage && hasShownContent && (!isFocused || !!deleteTransactionNavigateBackUrl)) {
        return 'null';
    }

    if (shouldShowFullScreenLoadingIndicator) {
        return 'loading';
    }

    if (shouldShowNotFoundPage) {
        return 'notFound';
    }

    return 'content';
}

type ReportOrNotFoundGuardProps = {
    reportID: string | undefined;
    shouldRequireReportID?: boolean;
    children: ReactElement;
};

function ReportOrNotFoundGuard({reportID, shouldRequireReportID = true, children}: ReportOrNotFoundGuardProps) {
    const {isBetaEnabled} = usePermissions();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [reportLoadingState] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${reportID}`);
    const [isLoadingReportData] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA);
    const [deleteTransactionNavigateBackUrl] = useOnyx(ONYXKEYS.NVP_DELETE_TRANSACTION_NAVIGATE_BACK_URL);
    const [guideAccountIDs] = useOnyx(ONYXKEYS.DERIVED.GUIDE_ACCOUNT_IDS);
    const hasGuidesEmails = hasExpensifyGuidesEmails(Object.keys(report?.participants ?? {}).map(Number), guideAccountIDs);
    const isFocused = useIsFocused();
    const isReportIdInRoute = !!reportID?.length;
    const isReportLoaded = !isEmptyObject(report) && !!report?.reportID;
    const isReportArchived = useReportIsArchived(report?.reportID);
    // The `isLoadingInitialReportActions` value will become `false` only after the first OpenReport API call is finished (either succeeded or failed)
    const shouldFetchReport = isReportIdInRoute && reportLoadingState?.isLoadingInitialReportActions !== false;

    useReportDeepLinkOnOpen({reportID, isReportLoaded, shouldFetchReport});

    const [hasShownContent, setHasShownContent] = useState(false);
    const isDefaultRoomsBetaEnabled = isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS);
    const decision = getReportOrNotFoundDecision({
        shouldRequireReportID,
        isReportIdInRoute,
        isReportLoaded,
        report,
        isLoadingReportData,
        shouldFetchReport,
        isDefaultRoomsBetaEnabled,
        hasGuidesEmails,
        isReportArchived,
        isFocused,
        hasShownContent,
        deleteTransactionNavigateBackUrl,
    });

    if (decision === 'content' && !hasShownContent) {
        setHasShownContent(true);
    }

    if (decision === 'null') {
        return null;
    }

    if (decision === 'loading') {
        return <FullscreenLoadingIndicator shouldUseGoBackButton />;
    }

    if (decision === 'notFound') {
        return <NotFoundPage isReportRelatedPage />;
    }

    return children;
}

export default ReportOrNotFoundGuard;
export {getReportOrNotFoundDecision};
