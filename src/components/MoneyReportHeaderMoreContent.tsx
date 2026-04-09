import {useRoute} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import useMoneyReportHeaderStatusBar from '@hooks/useMoneyReportHeaderStatusBar';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useResponsiveLayoutOnWideRHP from '@hooks/useResponsiveLayoutOnWideRHP';
import useThemeStyles from '@hooks/useThemeStyles';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList, RightModalNavigatorParamList} from '@libs/Navigation/types';
import {getFilteredReportActionsForReportView, getOneTransactionThreadReportID, getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {isInvoiceReport as isInvoiceReportUtil} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import MoneyReportHeaderNextStep from './MoneyReportHeaderNextStep';
import MoneyReportHeaderStatusBarSection from './MoneyReportHeaderStatusBarSection';
import MoneyRequestReportNavigation from './MoneyRequestReportView/MoneyRequestReportNavigation';

type MoneyReportHeaderMoreContentProps = {
    reportID: string | undefined;
};

/**
 * Cheap visibility gate — fetches minimal data to decide whether the more-content section
 * should render at all, avoiding expensive hooks in the body when nothing is shown.
 */
function MoneyReportHeaderMoreContent({reportID}: MoneyReportHeaderMoreContentProps) {
    const route = useRoute<
        | PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>
        | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.EXPENSE_REPORT>
        | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT>
        | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.SEARCH_REPORT>
    >();
    const isReportInSearch = route.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT || route.name === SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT;

    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(moneyRequestReport?.policyID)}`);
    const {shouldShowStatusBar, statusBarType} = useMoneyReportHeaderStatusBar(reportID, moneyRequestReport?.chatReportID);

    const policyType = policy?.type;
    const isFromPaidPolicy = policyType === CONST.POLICY.TYPE.TEAM || policyType === CONST.POLICY.TYPE.CORPORATE;
    const isInvoiceReport = isInvoiceReportUtil(moneyRequestReport);
    const shouldShowNextStep = isFromPaidPolicy && !isInvoiceReport && !shouldShowStatusBar;

    const shouldShowMoreContent = shouldShowNextStep || !!statusBarType || isReportInSearch;

    if (!shouldShowMoreContent) {
        return null;
    }

    return (
        <MoneyReportHeaderMoreContentBody
            moneyRequestReport={moneyRequestReport}
            statusBarType={statusBarType}
            isReportInSearch={isReportInSearch}
            shouldShowNextStep={shouldShowNextStep}
        />
    );
}

type MoneyReportHeaderMoreContentBodyProps = {
    moneyRequestReport: OnyxEntry<OnyxTypes.Report>;
    statusBarType: ValueOf<typeof CONST.REPORT.STATUS_BAR_TYPE> | undefined;
    isReportInSearch: boolean;
    shouldShowNextStep: boolean;
};

function MoneyReportHeaderMoreContentBody({moneyRequestReport, statusBarType, isReportInSearch, shouldShowNextStep}: MoneyReportHeaderMoreContentBodyProps) {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const shouldDisplayNarrowVersion = shouldUseNarrowLayout || isMediumScreenWidth;
    const {isWideRHPDisplayedOnWideLayout, isSuperWideRHPDisplayedOnWideLayout} = useResponsiveLayoutOnWideRHP();
    const shouldDisplayNarrowMoreButton = !shouldDisplayNarrowVersion || isWideRHPDisplayedOnWideLayout || isSuperWideRHPDisplayedOnWideLayout;

    const reportID = moneyRequestReport?.reportID;
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${moneyRequestReport?.chatReportID}`);

    const {reportActions: unfilteredReportActions} = usePaginatedReportActions(reportID);
    const reportActions = getFilteredReportActionsForReportView(unfilteredReportActions);

    const allReportTransactions = useReportTransactionsCollection(reportID);
    const nonDeletedTransactions = getAllNonDeletedTransactions(allReportTransactions, reportActions, isOffline, true);
    const visibleTransactionsForThreadID = nonDeletedTransactions?.filter((t) => isOffline || t.pendingAction !== 'delete');
    const reportTransactionIDs = visibleTransactionsForThreadID?.map((t) => t.transactionID);
    const transactionThreadReportID = getOneTransactionThreadReportID(moneyRequestReport, chatReport, reportActions ?? [], isOffline, reportTransactionIDs);
    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`);

    const requestParentReportAction =
        reportActions && transactionThreadReport?.parentReportActionID ? reportActions.find((action) => action.reportActionID === transactionThreadReport.parentReportActionID) : null;

    const iouTransactionID = isMoneyRequestAction(requestParentReportAction) ? getOriginalMessage(requestParentReportAction)?.IOUTransactionID : undefined;

    return (
        <View style={[styles.flexRow, styles.gap2, styles.justifyContentStart, styles.flexNoWrap, styles.ph5, styles.pb3]}>
            <View style={[styles.flexShrink1, styles.flexGrow1, styles.mnw0, styles.flexWrap, styles.justifyContentCenter]}>
                {shouldShowNextStep && <MoneyReportHeaderNextStep reportID={reportID} />}
                <MoneyReportHeaderStatusBarSection
                    reportID={reportID}
                    statusBarType={statusBarType}
                    iouTransactionID={iouTransactionID}
                />
            </View>
            {isReportInSearch && (
                <MoneyRequestReportNavigation
                    reportID={reportID}
                    shouldDisplayNarrowVersion={!shouldDisplayNarrowMoreButton}
                />
            )}
        </View>
    );
}

export default MoneyReportHeaderMoreContent;
