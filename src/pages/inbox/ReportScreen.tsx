import {PortalHost} from '@gorhom/portal';
import React, {useCallback, useMemo} from 'react';
import type {ViewStyle} from 'react-native';
// We use Animated for all functionality related to wide RHP to make it easier
// to interact with react-navigation components (e.g., CardContainer, interpolator), which also use Animated.
// eslint-disable-next-line no-restricted-imports
import {Animated, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import MoneyReportHeader from '@components/MoneyReportHeader';
import MoneyRequestHeader from '@components/MoneyRequestHeader';
import MoneyRequestReportActionsList from '@components/MoneyRequestReportView/MoneyRequestReportActionsList';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import MoneyRequestReceiptView from '@components/ReportActionItem/MoneyRequestReceiptView';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useShowWideRHPVersion from '@components/WideRHPContextProvider/useShowWideRHPVersion';
import WideRHPOverlayWrapper from '@components/WideRHPOverlayWrapper';
import useActionListContextValue from '@hooks/useActionListContextValue';
import {useCurrentReportIDState} from '@hooks/useCurrentReportID';
import useDocumentTitle from '@hooks/useDocumentTitle';
import useIsInSidePanel from '@hooks/useIsInSidePanel';
import useIsReportReadyToDisplay from '@hooks/useIsReportReadyToDisplay';
import useNetwork from '@hooks/useNetwork';
import useNewTransactions from '@hooks/useNewTransactions';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useParentReportAction from '@hooks/useParentReportAction';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSidePanelActions from '@hooks/useSidePanelActions';
import useSubmitToDestinationVisible from '@hooks/useSubmitToDestinationVisible';
import useThemeStyles from '@hooks/useThemeStyles';
import useViewportOffsetTop from '@hooks/useViewportOffsetTop';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getAllNonDeletedTransactions, shouldDisplayReportTableView, shouldWaitForTransactions as shouldWaitForTransactionsUtil} from '@libs/MoneyRequestReportUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getFilteredReportActionsForReportView, getOneTransactionThreadReportID, isTransactionThread} from '@libs/ReportActionsUtils';
import {getReportName} from '@libs/ReportNameUtils';
import {getReportOfflinePendingActionAndErrors, isInvoiceReport, isMoneyRequestReport, isReportTransactionThread} from '@libs/ReportUtils';
import type {ReportsSplitNavigatorParamList, RightModalNavigatorParamList} from '@navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import {reportByIDsSelector} from '@src/selectors/Attributes';
import type * as OnyxTypes from '@src/types/onyx';
import AccountManagerBanner from './AccountManagerBanner';
import {AgentZeroStatusProvider} from './AgentZeroStatusContext';
import DeleteTransactionNavigateBackHandler from './DeleteTransactionNavigateBackHandler';
import HeaderView from './HeaderView';
import LinkedActionNotFoundGuard from './LinkedActionNotFoundGuard';
import ReactionListWrapper from './ReactionListWrapper';
import ReportActionsView from './report/ReportActionsView';
import ReportFooter from './report/ReportFooter';
import ReportFetchHandler from './ReportFetchHandler';
import ReportLifecycleHandler from './ReportLifecycleHandler';
import ReportNavigateAwayHandler from './ReportNavigateAwayHandler';
import ReportNotFoundGuard from './ReportNotFoundGuard';
import ReportRouteParamHandler from './ReportRouteParamHandler';
import {ActionListContext} from './ReportScreenContext';

type ReportScreenNavigationProps =
    | PlatformStackScreenProps<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>
    | PlatformStackScreenProps<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.SEARCH_REPORT>;

type ReportScreenProps = ReportScreenNavigationProps;

const defaultReportMetadata = {
    hasOnceLoadedReportActions: false,
    isLoadingInitialReportActions: true,
    isLoadingOlderReportActions: false,
    hasLoadingOlderReportActionsError: false,
    isLoadingNewerReportActions: false,
    hasLoadingNewerReportActionsError: false,
    isOptimisticReport: false,
};

function ReportScreen({route, navigation}: ReportScreenProps) {
    const styles = useThemeStyles();
    const reportIDFromRoute = getNonEmptyStringOnyxID(route.params?.reportID);
    const reportActionIDFromRoute = route?.params?.reportActionID;
    const {isOffline} = useNetwork();
    const {isInNarrowPaneModal} = useResponsiveLayout();
    const isInSidePanel = useIsInSidePanel();

    const {currentReportID: currentReportIDValue} = useCurrentReportIDState();

    const [reportOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`);
    const [reportNameValuePairsOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportIDFromRoute}`);
    const [reportMetadata = defaultReportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportIDFromRoute}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(reportOnyx?.policyID)}`);

    const parentReportAction = useParentReportAction(reportOnyx);

    /**
     * Create a lightweight Report so as to keep the re-rendering as light as possible by
     * passing in only the required props.
     *
     * Also, this plays nicely in contrast with Onyx,
     * which creates a new object every time collection changes. Because of this we can't
     * put this into onyx selector as it will be the same.
     */
    const report = useMemo(
        () =>
            reportOnyx && {
                created: reportOnyx.created,
                hasParentAccess: reportOnyx.hasParentAccess,
                lastReadTime: reportOnyx.lastReadTime,
                reportID: reportOnyx.reportID,
                policyID: reportOnyx.policyID,
                lastVisibleActionCreated: reportOnyx.lastVisibleActionCreated,
                statusNum: reportOnyx.statusNum,
                stateNum: reportOnyx.stateNum,
                writeCapability: reportOnyx.writeCapability,
                type: reportOnyx.type,
                errorFields: reportOnyx.errorFields,
                parentReportID: reportOnyx.parentReportID,
                parentReportActionID: reportOnyx.parentReportActionID,
                chatType: reportOnyx.chatType,
                pendingFields: reportOnyx.pendingFields,
                isDeletedParentAction: reportOnyx.isDeletedParentAction,
                reportName: reportOnyx.reportName,
                description: reportOnyx.description,
                managerID: reportOnyx.managerID,
                total: reportOnyx.total,
                nonReimbursableTotal: reportOnyx.nonReimbursableTotal,
                fieldList: reportOnyx.fieldList,
                ownerAccountID: reportOnyx.ownerAccountID,
                currency: reportOnyx.currency,
                unheldTotal: reportOnyx.unheldTotal,
                unheldNonReimbursableTotal: reportOnyx.unheldNonReimbursableTotal,
                participants: reportOnyx.participants,
                isWaitingOnBankAccount: reportOnyx.isWaitingOnBankAccount,
                iouReportID: reportOnyx.iouReportID,
                isOwnPolicyExpenseChat: reportOnyx.isOwnPolicyExpenseChat,
                isPinned: reportOnyx.isPinned,
                chatReportID: reportOnyx.chatReportID,
                visibility: reportOnyx.visibility,
                oldPolicyName: reportOnyx.oldPolicyName,
                policyName: reportOnyx.policyName,
                private_isArchived: reportNameValuePairsOnyx?.private_isArchived,
                lastMentionedTime: reportOnyx.lastMentionedTime,
                avatarUrl: reportOnyx.avatarUrl,
                permissions: reportOnyx?.permissions,
                invoiceReceiver: reportOnyx.invoiceReceiver,
                policyAvatar: reportOnyx.policyAvatar,
                nextStep: reportOnyx.nextStep,
            },
        [reportOnyx, reportNameValuePairsOnyx?.private_isArchived],
    );
    const reportID = report?.reportID;

    const reportAttributesSelector = useCallback((attributes: OnyxEntry<OnyxTypes.ReportAttributesDerivedValue>) => reportByIDsSelector(reportID ? [reportID] : [])(attributes), [reportID]);
    const [reportAttributes] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {selector: reportAttributesSelector});
    useDocumentTitle(getReportName(report, reportAttributes));

    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`);

    const {reportActions: unfilteredReportActions, hasNewerActions, hasOlderActions} = usePaginatedReportActions(reportID, reportActionIDFromRoute);
    // wrapping in useMemo because this is array operation and can cause performance issues
    const reportActions = useMemo(() => getFilteredReportActionsForReportView(unfilteredReportActions), [unfilteredReportActions]);
    const viewportOffsetTop = useViewportOffsetTop();

    const {reportPendingAction, reportErrors} = getReportOfflinePendingActionAndErrors(report);
    const screenWrapperStyle: ViewStyle[] = [styles.appContent, styles.flex1, {marginTop: viewportOffsetTop}];

    const allReportTransactions = useReportTransactionsCollection(reportIDFromRoute);
    const hasPendingDeletionTransaction = Object.values(allReportTransactions ?? {}).some((transaction) => transaction?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);

    const reportTransactions = useMemo(() => getAllNonDeletedTransactions(allReportTransactions, reportActions, isOffline, true), [allReportTransactions, reportActions, isOffline]);
    // wrapping in useMemo because this is array operation and can cause performance issues
    const visibleTransactions = useMemo(
        () => reportTransactions?.filter((transaction) => isOffline || transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE),
        [reportTransactions, isOffline],
    );
    const reportTransactionIDs = useMemo(() => visibleTransactions?.map((transaction) => transaction.transactionID), [visibleTransactions]);

    const transactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, reportActions ?? [], isOffline, reportTransactionIDs);
    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`);
    const isTopMostReportId = currentReportIDValue === reportIDFromRoute;
    const isTransactionThreadView = isReportTransactionThread(report);
    const isMoneyRequestOrInvoiceReport = isMoneyRequestReport(report) || isInvoiceReport(report);
    // Prevent the empty state flash by ensuring transaction data is fully loaded before deciding which view to render
    // We need to wait for both the selector to finish AND ensure we're not in a loading state where transactions could still populate
    const shouldWaitForTransactions = shouldWaitForTransactionsUtil(report, reportTransactions, reportMetadata, isOffline);

    const newTransactions = useNewTransactions(reportMetadata?.hasOnceLoadedReportActions, reportTransactions);

    const {closeSidePanel} = useSidePanelActions();

    const backTo = route?.params?.backTo as string;
    const onBackButtonPress = useCallback(
        (prioritizeBackTo = false) => {
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
        },
        [isInSidePanel, backTo, isInNarrowPaneModal, closeSidePanel],
    );

    const headerView = useMemo(() => {
        if (isTransactionThreadView) {
            return (
                <MoneyRequestHeader
                    reportID={reportIDFromRoute}
                    onBackButtonPress={onBackButtonPress}
                />
            );
        }

        if (isMoneyRequestOrInvoiceReport) {
            return (
                <MoneyReportHeader
                    reportID={reportIDFromRoute}
                    onBackButtonPress={onBackButtonPress}
                />
            );
        }

        return (
            <HeaderView
                reportID={reportIDFromRoute}
                onNavigationMenuButtonClicked={onBackButtonPress}
            />
        );
    }, [isTransactionThreadView, isMoneyRequestOrInvoiceReport, onBackButtonPress, reportIDFromRoute]);

    const isReportArchived = useReportIsArchived(report?.reportID);
    const {isEditingDisabled} = useIsReportReadyToDisplay(report, reportIDFromRoute, isReportArchived);

    const actionListValue = useActionListContextValue();

    // wrapping into useMemo to stabilize children re-renders as reportMetadata is changed frequently
    const showReportActionsLoadingState = useMemo(
        () => reportMetadata?.isLoadingInitialReportActions && !reportMetadata?.hasOnceLoadedReportActions,
        [reportMetadata?.isLoadingInitialReportActions, reportMetadata?.hasOnceLoadedReportActions],
    );

    // In this case we want to use this value. The  shouldUseNarrowLayout will always be true as this case is handled when we display ReportScreen in RHP.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    // If true reports that are considered MoneyRequest | InvoiceReport will get the new report table view
    const shouldDisplayMoneyRequestActionsList = isMoneyRequestOrInvoiceReport && shouldDisplayReportTableView(report, visibleTransactions ?? []);

    // WideRHP should be visible only on wide layout when report is opened in RHP and contains only one expense.
    // This view is only available for reports of type CONST.REPORT.TYPE.EXPENSE or CONST.REPORT.TYPE.IOU.
    const shouldShowWideRHP =
        route.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT &&
        !isSmallScreenWidth &&
        !shouldDisplayMoneyRequestActionsList &&
        (isTransactionThread(parentReportAction) ||
            parentReportAction?.childType === CONST.REPORT.TYPE.EXPENSE ||
            parentReportAction?.childType === CONST.REPORT.TYPE.IOU ||
            report?.type === CONST.REPORT.TYPE.EXPENSE ||
            report?.type === CONST.REPORT.TYPE.IOU);

    useShowWideRHPVersion(shouldShowWideRHP);

    useSubmitToDestinationVisible(
        [CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT, CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY],
        reportIDFromRoute,
        CONST.TELEMETRY.SUBMIT_TO_DESTINATION_VISIBLE_TRIGGER.FOCUS,
    );

    return (
        // Wide RHP overlays should be rendered only for the report screen displayed in RHP
        <WideRHPOverlayWrapper shouldWrap={route.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT}>
            <ActionListContext.Provider value={actionListValue}>
                <ReactionListWrapper>
                    <ScreenWrapper
                        navigation={navigation}
                        style={screenWrapperStyle}
                        shouldEnableKeyboardAvoidingView={isTopMostReportId || isInNarrowPaneModal}
                        testID={`report-screen-${reportID}`}
                    >
                        <DeleteTransactionNavigateBackHandler />
                        <ReportRouteParamHandler />
                        <ReportFetchHandler />
                        <ReportNavigateAwayHandler />
                        <ReportNotFoundGuard>
                            <LinkedActionNotFoundGuard>
                                <DragAndDropProvider isDisabled={isEditingDisabled}>
                                    <ReportLifecycleHandler reportID={reportIDFromRoute} />
                                    <OfflineWithFeedback
                                        pendingAction={reportPendingAction ?? report?.pendingFields?.reimbursed}
                                        errors={reportErrors}
                                        shouldShowErrorMessages={false}
                                        needsOffscreenAlphaCompositing
                                    >
                                        {headerView}
                                    </OfflineWithFeedback>
                                    <AccountManagerBanner reportID={reportIDFromRoute} />
                                    <View style={[styles.flex1, styles.flexRow]}>
                                        {shouldShowWideRHP && (
                                            <Animated.View style={styles.wideRHPMoneyRequestReceiptViewContainer}>
                                                <ScrollView contentContainerStyle={styles.wideRHPMoneyRequestReceiptViewScrollViewContainer}>
                                                    <MoneyRequestReceiptView
                                                        report={transactionThreadReport ?? report}
                                                        fillSpace
                                                        isDisplayedInWideRHP
                                                    />
                                                </ScrollView>
                                            </Animated.View>
                                        )}
                                        <AgentZeroStatusProvider
                                            reportID={reportIDFromRoute}
                                            chatType={report?.chatType}
                                        >
                                            <View
                                                style={[styles.flex1, styles.justifyContentEnd, styles.overflowHidden]}
                                                testID="report-actions-view-wrapper"
                                            >
                                                {(!report || shouldWaitForTransactions) && <ReportActionsSkeletonView />}
                                                {!!report && !shouldDisplayMoneyRequestActionsList && !shouldWaitForTransactions ? <ReportActionsView reportID={report.reportID} /> : null}
                                                {!!report && shouldDisplayMoneyRequestActionsList && !shouldWaitForTransactions ? (
                                                    <MoneyRequestReportActionsList
                                                        report={report}
                                                        hasPendingDeletionTransaction={hasPendingDeletionTransaction}
                                                        policy={policy}
                                                        reportActions={reportActions}
                                                        transactions={visibleTransactions}
                                                        newTransactions={newTransactions}
                                                        hasOlderActions={hasOlderActions}
                                                        hasNewerActions={hasNewerActions}
                                                        showReportActionsLoadingState={showReportActionsLoadingState}
                                                        reportPendingAction={reportPendingAction}
                                                    />
                                                ) : null}
                                                <ReportFooter />
                                            </View>
                                        </AgentZeroStatusProvider>
                                    </View>
                                    <PortalHost name="suggestions" />
                                </DragAndDropProvider>
                            </LinkedActionNotFoundGuard>
                        </ReportNotFoundGuard>
                    </ScreenWrapper>
                </ReactionListWrapper>
            </ActionListContext.Provider>
        </WideRHPOverlayWrapper>
    );
}

export default ReportScreen;
