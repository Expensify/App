import MoneyReportHeader from '@components/MoneyReportHeader';
import MoneyRequestHeader from '@components/MoneyRequestHeader';
import OfflineWithFeedback from '@components/OfflineWithFeedback';

import useDocumentTitle from '@hooks/useDocumentTitle';
import useIsInConciergePage from '@hooks/useIsInConciergePage';
import useIsInSidePanel from '@hooks/useIsInSidePanel';
import useOnyx from '@hooks/useOnyx';
import {useDerivedReportNameByReportID} from '@hooks/useReportAttributes';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSidePanelActions from '@hooks/useSidePanelActions';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import closeConciergePage from '@libs/Navigation/helpers/closeConciergePage';
import Navigation from '@libs/Navigation/Navigation';
import {getReportName} from '@libs/ReportNameUtils';
import {getReportOfflinePendingActionAndErrors, isInvoiceReport, isMoneyRequestReport, isReportTransactionThread} from '@libs/ReportUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {useRoute} from '@react-navigation/native';
import React from 'react';

import HeaderView from './HeaderView';

/**
 * Owns header variant selection, back button logic, and OfflineWithFeedback wrapper.
 * Subscribes to report type internally — ReportScreen passes nothing.
 */
function ReportHeader() {
    const route = useRoute();
    const routeParams = route.params as {reportID?: string; backTo?: string} | undefined;
    const reportIDFromRoute = getNonEmptyStringOnyxID(routeParams?.reportID);
    const backTo = routeParams?.backTo;

    const isInSidePanel = useIsInSidePanel();
    const {isInNarrowPaneModal, shouldUseNarrowLayout} = useResponsiveLayout();
    const isInConciergePage = useIsInConciergePage();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const {closeSidePanel} = useSidePanelActions();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`);
    const reportID = report?.reportID;

    const derivedReportName = useDerivedReportNameByReportID(reportID);
    useDocumentTitle(getReportName(report, derivedReportName));

    const isTransactionThreadView = isReportTransactionThread(report);
    const isMoneyRequestOrInvoiceReport = isMoneyRequestReport(report) || isInvoiceReport(report);
    const {reportPendingAction, reportErrors} = getReportOfflinePendingActionAndErrors(report);
    const pendingAction = reportPendingAction ?? report?.pendingFields?.reimbursed;

    const onBackButtonPress = (prioritizeBackTo = false, options?: {afterTransition?: () => void}) => {
        if (isInSidePanel) {
            closeSidePanel({afterTransition: options?.afterTransition});
            return;
        }
        if (isInConciergePage && shouldUseNarrowLayout) {
            // The Concierge DM is the first screen of the narrow Concierge page, so going back from it closes the page
            if (reportIDFromRoute === conciergeReportID) {
                closeConciergePage(ROUTES.CONCIERGE_CHATS, options);
                return;
            }
            Navigation.goBack(ROUTES.CONCIERGE_CHATS, options);
            return;
        }
        if (backTo === SCREENS.RIGHT_MODAL.SEARCH_REPORT) {
            Navigation.goBack(undefined, options);
            return;
        }
        if (prioritizeBackTo && backTo) {
            Navigation.goBack(backTo as Route, options);
            return;
        }
        if (isInNarrowPaneModal) {
            Navigation.goBack(undefined, options);
            return;
        }
        if (backTo) {
            Navigation.goBack(backTo as Route, options);
            return;
        }
        Navigation.goBack(undefined, options);
    };

    if (isTransactionThreadView) {
        return (
            <OfflineWithFeedback
                pendingAction={pendingAction}
                errors={reportErrors}
                shouldShowErrorMessages={false}
                needsOffscreenAlphaCompositing
            >
                <MoneyRequestHeader
                    reportID={reportIDFromRoute}
                    onBackButtonPress={onBackButtonPress}
                />
            </OfflineWithFeedback>
        );
    }

    if (isMoneyRequestOrInvoiceReport) {
        return (
            <OfflineWithFeedback
                pendingAction={pendingAction}
                errors={reportErrors}
                shouldShowErrorMessages={false}
                needsOffscreenAlphaCompositing
            >
                <MoneyReportHeader
                    reportID={reportIDFromRoute}
                    onBackButtonPress={onBackButtonPress}
                />
            </OfflineWithFeedback>
        );
    }

    return (
        <OfflineWithFeedback
            pendingAction={pendingAction}
            errors={reportErrors}
            shouldShowErrorMessages={false}
            needsOffscreenAlphaCompositing
        >
            <HeaderView
                reportID={reportIDFromRoute}
                onNavigationMenuButtonClicked={onBackButtonPress}
            />
        </OfflineWithFeedback>
    );
}

export default ReportHeader;
