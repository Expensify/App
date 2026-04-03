import {useRoute} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';
import useMoneyReportHeaderStatusBar from '@hooks/useMoneyReportHeaderStatusBar';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useOptimisticNextStep from '@hooks/useOptimisticNextStep';
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
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import MoneyReportHeaderStatusBar from './MoneyReportHeaderStatusBar';
import MoneyReportHeaderStatusBarSection from './MoneyReportHeaderStatusBarSection';
import MoneyReportHeaderStatusBarSkeleton from './MoneyReportHeaderStatusBarSkeleton';
import MoneyRequestReportNavigation from './MoneyRequestReportView/MoneyRequestReportNavigation';

type MoneyReportHeaderMoreContentProps = {
    reportID: string | undefined;
};

function MoneyReportHeaderMoreContent({reportID}: MoneyReportHeaderMoreContentProps) {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const shouldDisplayNarrowVersion = shouldUseNarrowLayout || isMediumScreenWidth;
    const {isWideRHPDisplayedOnWideLayout, isSuperWideRHPDisplayedOnWideLayout} = useResponsiveLayoutOnWideRHP();
    const shouldDisplayNarrowMoreButton = !shouldDisplayNarrowVersion || isWideRHPDisplayedOnWideLayout || isSuperWideRHPDisplayedOnWideLayout;

    const route = useRoute<
        | PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>
        | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.EXPENSE_REPORT>
        | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT>
        | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.SEARCH_REPORT>
    >();
    const isReportInSearch = route.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT || route.name === SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT;

    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(moneyRequestReport?.policyID)}`);
    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`);
    const isLoadingInitialReportActions = reportMetadata?.isLoadingInitialReportActions;
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${moneyRequestReport?.chatReportID}`);

    const {reportActions: unfilteredReportActions} = usePaginatedReportActions(moneyRequestReport?.reportID);
    const reportActions = getFilteredReportActionsForReportView(unfilteredReportActions);

    // Derive iouTransactionID for the single-transaction case
    const allReportTransactions = useReportTransactionsCollection(reportID);
    const nonDeletedTransactions = getAllNonDeletedTransactions(allReportTransactions, reportActions, isOffline, true);
    const visibleTransactionsForThreadID = nonDeletedTransactions?.filter((t) => isOffline || t.pendingAction !== 'delete');
    const reportTransactionIDs = visibleTransactionsForThreadID?.map((t) => t.transactionID);
    const transactionThreadReportID = getOneTransactionThreadReportID(moneyRequestReport, chatReport, reportActions ?? [], isOffline, reportTransactionIDs);
    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`);

    const requestParentReportAction =
        reportActions && transactionThreadReport?.parentReportActionID ? reportActions.find((action) => action.reportActionID === transactionThreadReport.parentReportActionID) : null;

    const iouTransactionID = isMoneyRequestAction(requestParentReportAction) ? getOriginalMessage(requestParentReportAction)?.IOUTransactionID : undefined;

    // Status bar and next step
    const {shouldShowStatusBar, statusBarType} = useMoneyReportHeaderStatusBar(reportID, moneyRequestReport?.chatReportID);
    const optimisticNextStep = useOptimisticNextStep(reportID);

    const policyType = policy?.type;
    const isFromPaidPolicy = policyType === CONST.POLICY.TYPE.TEAM || policyType === CONST.POLICY.TYPE.CORPORATE;
    const isInvoiceReport = isInvoiceReportUtil(moneyRequestReport);
    const shouldShowNextStep = isFromPaidPolicy && !isInvoiceReport && !shouldShowStatusBar;

    const showNextStepBar = shouldShowNextStep && !!optimisticNextStep && (('message' in optimisticNextStep && !!optimisticNextStep.message?.length) || 'messageKey' in optimisticNextStep);
    const showNextStepSkeleton = shouldShowNextStep && !optimisticNextStep && !!isLoadingInitialReportActions && !isOffline;
    const shouldShowMoreContent = showNextStepBar || showNextStepSkeleton || !!statusBarType || isReportInSearch;

    if (!shouldShowMoreContent) {
        return null;
    }

    const nextStepSkeletonReasonAttributes: SkeletonSpanReasonAttributes = {
        context: 'MoneyReportHeaderMoreContent',
        shouldShowNextStep,
        isLoadingInitialReportActions: !!isLoadingInitialReportActions,
        isOffline,
        hasOptimisticNextStep: !!optimisticNextStep,
    };

    return (
        <View style={[styles.flexRow, styles.gap2, styles.justifyContentStart, styles.flexNoWrap, styles.ph5, styles.pb3]}>
            <View style={[styles.flexShrink1, styles.flexGrow1, styles.mnw0, styles.flexWrap, styles.justifyContentCenter]}>
                {showNextStepBar && <MoneyReportHeaderStatusBar nextStep={optimisticNextStep} />}
                {showNextStepSkeleton && <MoneyReportHeaderStatusBarSkeleton reasonAttributes={nextStepSkeletonReasonAttributes} />}
                <MoneyReportHeaderStatusBarSection
                    reportID={reportID}
                    statusBarType={statusBarType}
                    iouTransactionID={iouTransactionID}
                />
            </View>
            {isReportInSearch && (
                <MoneyRequestReportNavigation
                    reportID={moneyRequestReport?.reportID}
                    shouldDisplayNarrowVersion={!shouldDisplayNarrowMoreButton}
                />
            )}
        </View>
    );
}

export default MoneyReportHeaderMoreContent;
