import {PortalHost} from '@gorhom/portal';
import React, {useCallback, useEffect, useMemo} from 'react';
// We use Animated for all functionality related to wide RHP to make it easier
// to interact with react-navigation components (e.g., CardContainer, interpolator), which also use Animated.
// eslint-disable-next-line no-restricted-imports
import {Animated, InteractionManager, ScrollView, View} from 'react-native';
import type {LayoutChangeEvent} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import MoneyReportHeader from '@components/MoneyReportHeader';
import MoneyRequestHeader from '@components/MoneyRequestHeader';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import MoneyRequestReceiptView from '@components/ReportActionItem/MoneyRequestReceiptView';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import ReportHeaderSkeletonView from '@components/ReportHeaderSkeletonView';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {removeFailedReport} from '@libs/actions/Report';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Log from '@libs/Log';
import {getAllNonDeletedTransactions, shouldDisplayReportTableView, shouldWaitForTransactions as shouldWaitForTransactionsUtil} from '@libs/MoneyRequestReportUtils';
import navigationRef from '@libs/Navigation/navigationRef';
import {getFilteredReportActionsForReportView, getOneTransactionThreadReportID} from '@libs/ReportActionsUtils';
import {getReportOfflinePendingActionAndErrors, isReportTransactionThread} from '@libs/ReportUtils';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import {cancelSpan} from '@libs/telemetry/activeSpans';
import markOpenReportEnd from '@libs/telemetry/markOpenReportEnd';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import Navigation from '@navigation/Navigation';
import ReportActionsView from '@pages/inbox/report/ReportActionsView';
import ReportFooter from '@pages/inbox/report/ReportFooter';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type {ThemeStyles} from '@src/styles';
import type * as OnyxTypes from '@src/types/onyx';
import MoneyRequestReportActionsList from './MoneyRequestReportActionsList';

const loadingAppReasonAttributes: SkeletonSpanReasonAttributes = {context: 'MoneyRequestReportView.isLoadingApp'};

type MoneyRequestReportViewProps = {
    /** The report */
    report: OnyxEntry<OnyxTypes.Report>;

    /** Metadata for report */
    reportMetadata: OnyxEntry<OnyxTypes.ReportMetadata>;

    /** Whether Report footer (that includes Composer) should be displayed */
    shouldDisplayReportFooter: boolean;

    /** The `backTo` route that should be used when clicking back button */
    backToRoute: Route | undefined;

    /** Callback executed on layout */
    onLayout?: (event: LayoutChangeEvent) => void;
};

function goBackFromSearchMoneyRequest() {
    const rootState = navigationRef.getRootState();
    const lastRoute = rootState.routes.at(-1);

    if (!lastRoute) {
        Log.hmmm('[goBackFromSearchMoneyRequest()] No last route found in root state.');
        return;
    }

    if (lastRoute?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR) {
        Navigation.goBack();
        return;
    }

    if (lastRoute?.name !== NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR) {
        Log.hmmm('[goBackFromSearchMoneyRequest()] goBackFromSearchMoneyRequest was called from a different navigator than SearchFullscreenNavigator.');
        return;
    }

    if (rootState.routes.length > 1) {
        Navigation.goBack();
        return;
    }

    Navigation.goBack(ROUTES.SEARCH_ROOT.getRoute({query: buildCannedSearchQuery()}));
}

function InitialLoadingSkeleton({styles, onLayout, reasonAttributes}: {styles: ThemeStyles; onLayout?: (event: LayoutChangeEvent) => void; reasonAttributes: SkeletonSpanReasonAttributes}) {
    return (
        <View
            style={[styles.flex1]}
            onLayout={onLayout}
        >
            <View style={[styles.appContentHeader, styles.borderBottom]}>
                <ReportHeaderSkeletonView
                    onBackButtonPress={() => {}}
                    reasonAttributes={reasonAttributes}
                />
            </View>
            <ReportActionsSkeletonView />
        </View>
    );
}

function MoneyRequestReportView({report, reportMetadata, shouldDisplayReportFooter, backToRoute, onLayout}: MoneyRequestReportViewProps) {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();

    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    const reportID = report?.reportID;
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const {reportPendingAction, reportErrors} = getReportOfflinePendingActionAndErrors(report);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.chatReportID)}`);

    const {reportActions: unfilteredReportActions} = usePaginatedReportActions(reportID);

    const reportActions = useMemo(() => {
        return getFilteredReportActionsForReportView(unfilteredReportActions);
    }, [unfilteredReportActions]);

    const reportTransactions = useReportTransactionsCollection(reportID);
    const transactions = useMemo(() => getAllNonDeletedTransactions(reportTransactions, reportActions, isOffline, true), [reportTransactions, reportActions, isOffline]);

    const visibleTransactions = useMemo(() => {
        if (isOffline) {
            return transactions;
        }

        // When there are no pending delete transactions, which is most of the time, we can return the same transactions keeping the same reference avoiding extra work
        const hasPendingDelete = transactions.some((transaction) => transaction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
        if (!hasPendingDelete) {
            return transactions;
        }

        return transactions.filter((transaction) => transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    }, [transactions, isOffline]);
    const reportTransactionIDs = visibleTransactions.map((transaction) => transaction.transactionID);
    const transactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, reportActions ?? [], isOffline, reportTransactionIDs);

    const isLoadingInitialReportActions = reportMetadata?.isLoadingInitialReportActions;
    const dismissReportCreationError = useCallback(() => {
        goBackFromSearchMoneyRequest();
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => removeFailedReport(reportID));
    }, [reportID]);

    // Special case handling a report that is a transaction thread
    // If true we will use standard `ReportActionsView` to display report data and a special header, anything else is handled via `MoneyRequestReportActionsList`
    const isTransactionThreadView = isReportTransactionThread(report);

    // Prevent the empty state flash by ensuring transaction data is fully loaded before deciding which view to render
    // We need to wait for both the selector to finish AND ensure we're not in a loading state where transactions could still populate
    const shouldWaitForTransactions = shouldWaitForTransactionsUtil(report, transactions, reportMetadata, isOffline);

    const shouldShowOpenReportLoadingSkeleton = !!(isLoadingInitialReportActions && reportActions.length === 0 && !isOffline) || shouldWaitForTransactions;

    const isEmptyTransactionReport = visibleTransactions && visibleTransactions.length === 0 && transactionThreadReportID === undefined;
    const shouldDisplayMoneyRequestActionsList = !!isEmptyTransactionReport || shouldDisplayReportTableView(report, visibleTransactions ?? []);

    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`);
    const shouldShowWideRHPReceipt = visibleTransactions.length === 1 && !isSmallScreenWidth && !!transactionThreadReport;

    const reportHeaderView = useMemo(
        () =>
            isTransactionThreadView ? (
                <MoneyRequestHeader
                    reportID={report?.reportID}
                    onBackButtonPress={() => {
                        if (!backToRoute) {
                            goBackFromSearchMoneyRequest();
                            return;
                        }
                        Navigation.goBack(backToRoute);
                    }}
                />
            ) : (
                <MoneyReportHeader
                    reportID={report?.reportID}
                    shouldDisplayBackButton
                    onBackButtonPress={() => {
                        if (!backToRoute) {
                            goBackFromSearchMoneyRequest();
                            return;
                        }
                        Navigation.goBack(backToRoute);
                    }}
                />
            ),
        [backToRoute, isTransactionThreadView, report?.reportID],
    );

    // We need to cancel telemetry span when user leaves the screen before full report data is loaded
    useEffect(() => {
        return () => {
            cancelSpan(`${CONST.TELEMETRY.SPAN_OPEN_REPORT}_${reportID}`);
        };
    }, [reportID]);

    useEffect(() => {
        if (!shouldShowOpenReportLoadingSkeleton || !report) {
            return;
        }
        markOpenReportEnd(report, {warm: false});
    }, [report, shouldShowOpenReportLoadingSkeleton]);

    if (shouldShowOpenReportLoadingSkeleton) {
        const skeletonReasonAttributes: SkeletonSpanReasonAttributes = {
            context: 'MoneyRequestReportView.InitialLoadingSkeleton',
            isLoadingInitialReportActions: !!isLoadingInitialReportActions,
            shouldWaitForTransactions,
        };
        return (
            <InitialLoadingSkeleton
                styles={styles}
                reasonAttributes={skeletonReasonAttributes}
            />
        );
    }

    if (reportActions.length === 0) {
        return <ReportActionsSkeletonView shouldAnimate={false} />;
    }

    if (!report) {
        return;
    }

    if (isLoadingApp) {
        return (
            <View style={styles.flex1}>
                <ReportHeaderSkeletonView reasonAttributes={loadingAppReasonAttributes} />
                <ReportActionsSkeletonView />
                {shouldDisplayReportFooter ? <ReportFooter /> : null}
            </View>
        );
    }

    return (
        <View style={styles.flex1}>
            <OfflineWithFeedback
                pendingAction={reportPendingAction ?? report?.pendingFields?.reimbursed}
                errors={reportErrors}
                needsOffscreenAlphaCompositing
                shouldShowErrorMessages={false}
            >
                {reportHeaderView}
            </OfflineWithFeedback>
            <OfflineWithFeedback
                pendingAction={reportPendingAction}
                errors={reportErrors}
                onClose={dismissReportCreationError}
                needsOffscreenAlphaCompositing
                style={styles.flex1}
                contentContainerStyle={styles.flex1}
                errorRowStyles={[styles.ph5, styles.mv2]}
            >
                <View style={[styles.flex1, styles.flexRow]}>
                    {shouldShowWideRHPReceipt && (
                        <Animated.View style={styles.wideRHPMoneyRequestReceiptViewContainer}>
                            <ScrollView contentContainerStyle={styles.wideRHPMoneyRequestReceiptViewScrollViewContainer}>
                                <MoneyRequestReceiptView
                                    report={transactionThreadReport}
                                    fillSpace
                                    isDisplayedInWideRHP
                                    hasParentPendingAction={!!reportPendingAction}
                                />
                            </ScrollView>
                        </Animated.View>
                    )}
                    <View style={[styles.overflowHidden, styles.justifyContentEnd, styles.flex1]}>
                        {shouldDisplayMoneyRequestActionsList ? (
                            <MoneyRequestReportActionsList onLayout={onLayout} />
                        ) : (
                            <ReportActionsView
                                reportID={reportID}
                                onLayout={onLayout}
                            />
                        )}
                        {shouldDisplayReportFooter ? (
                            <>
                                <ReportFooter />
                                <PortalHost name="suggestions" />
                            </>
                        ) : null}
                    </View>
                </View>
            </OfflineWithFeedback>
        </View>
    );
}

export default MoneyRequestReportView;
