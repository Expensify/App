import {useRoute} from '@react-navigation/native';
import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import MoneyReportHeader from '@components/MoneyReportHeader';
import MoneyRequestHeader from '@components/MoneyRequestHeader';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useDocumentTitle from '@hooks/useDocumentTitle';
import useIsInSidePanel from '@hooks/useIsInSidePanel';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSidePanelActions from '@hooks/useSidePanelActions';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import {getReportName} from '@libs/ReportNameUtils';
import {getReportOfflinePendingActionAndErrors, isInvoiceReport, isMoneyRequestReport, isReportTransactionThread} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import {reportByIDsSelector} from '@src/selectors/Attributes';
import type * as OnyxTypes from '@src/types/onyx';
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
    const {isInNarrowPaneModal} = useResponsiveLayout();
    const {closeSidePanel} = useSidePanelActions();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`);
    const reportID = report?.reportID;

    const reportAttributesSelector = (attributes: OnyxEntry<OnyxTypes.ReportAttributesDerivedValue>) => reportByIDsSelector(reportID ? [reportID] : [])(attributes);
    const [reportAttributes] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {selector: reportAttributesSelector});
    useDocumentTitle(getReportName(report, reportAttributes));

    const isTransactionThreadView = isReportTransactionThread(report);
    const isMoneyRequestOrInvoiceReport = isMoneyRequestReport(report) || isInvoiceReport(report);
    const {reportPendingAction, reportErrors} = getReportOfflinePendingActionAndErrors(report);
    const pendingAction = reportPendingAction ?? report?.pendingFields?.reimbursed;

    const onBackButtonPress = (prioritizeBackTo = false) => {
        if (isInSidePanel) {
            closeSidePanel();
            return;
        }
        if (backTo === SCREENS.RIGHT_MODAL.SEARCH_REPORT) {
            Navigation.goBack();
            return;
        }
        if (prioritizeBackTo && backTo) {
            Navigation.goBack(backTo as Route);
            return;
        }
        if (isInNarrowPaneModal) {
            Navigation.goBack();
            return;
        }
        if (backTo) {
            Navigation.goBack(backTo as Route);
            return;
        }
        Navigation.goBack();
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
