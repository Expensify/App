import {useIsFocused} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
import lodashIsEqual from 'lodash/isEqual';
import React, {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {FlatList, ViewStyle} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {WithOnyxInstanceState} from 'react-native-onyx/dist/types';
import type {LayoutChangeEvent} from 'react-native/Libraries/Types/CoreEventTypes';
import Banner from '@components/Banner';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import MoneyReportHeader from '@components/MoneyReportHeader';
import MoneyRequestHeader from '@components/MoneyRequestHeader';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import ScreenWrapper from '@components/ScreenWrapper';
import TaskHeaderActionButton from '@components/TaskHeaderActionButton';
import withCurrentReportID from '@components/withCurrentReportID';
import type {CurrentReportIDContextValue} from '@components/withCurrentReportID';
import withViewportOffsetTop from '@components/withViewportOffsetTop';
import type {ViewportOffsetTopProps} from '@components/withViewportOffsetTop';
import useAppFocusEvent from '@hooks/useAppFocusEvent';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Timing from '@libs/actions/Timing';
import Navigation from '@libs/Navigation/Navigation';
import clearReportNotifications from '@libs/Notification/clearReportNotifications';
import reportWithoutHasDraftSelector from '@libs/OnyxSelectors/reportWithoutHasDraftSelector';
import type {ReportWithoutHasDraft} from '@libs/OnyxSelectors/reportWithoutHasDraftSelector';
import Performance from '@libs/Performance';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import type {CentralPaneNavigatorParamList} from '@navigation/types';
import * as ComposerActions from '@userActions/Composer';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import HeaderView from './HeaderView';
import ReportActionsView from './report/ReportActionsView';
import ReportFooter from './report/ReportFooter';
import {ActionListContext, ReactionListContext} from './ReportScreenContext';
import type {ActionListContextType, ReactionListRef, ScrollPosition} from './ReportScreenContext';

type ReportScreenOnyxProps = {
    /** Tells us if the sidebar has rendered */
    isSidebarLoaded: OnyxEntry<boolean>;

    /** Beta features list */
    betas: OnyxEntry<OnyxTypes.Beta[]>;

    /** The policies which the user has access to */
    policies: OnyxCollection<OnyxTypes.Policy>;

    /** The account manager report ID */
    accountManagerReportID: OnyxEntry<string>;

    /** Whether user is leaving the current report */
    userLeavingStatus: OnyxEntry<boolean>;

    /** Whether the composer is full size */
    isComposerFullSize: OnyxEntry<boolean>;

    /** All the report actions for this report */
    reportActions: OnyxTypes.ReportAction[];

    /** The report currently being looked at */
    report: OnyxEntry<ReportWithoutHasDraft>;

    /** The report metadata loading states */
    reportMetadata: OnyxEntry<OnyxTypes.ReportMetadata>;

    /** The report's parentReportAction */
    parentReportAction: OnyxEntry<OnyxTypes.ReportAction>;
};

type OnyxHOCProps = {
    /** Onyx function that marks the component ready for hydration */
    markReadyForHydration?: () => void;
};

type ReportScreenNavigationProps = StackScreenProps<CentralPaneNavigatorParamList, typeof SCREENS.REPORT>;

type ReportScreenProps = OnyxHOCProps & ViewportOffsetTopProps & CurrentReportIDContextValue & ReportScreenOnyxProps & ReportScreenNavigationProps;

/** Get the currently viewed report ID as number */
function getReportID(route: ReportScreenNavigationProps['route']): string {
    // The report ID is used in an onyx key. If it's an empty string, onyx will return
    // a collection instead of an individual report.
    return String(route.params?.reportID || 0);
}

function ReportScreen({
    betas = [],
    route,
    report: reportProp,
    reportMetadata = {
        isLoadingInitialReportActions: true,
        isLoadingOlderReportActions: false,
        isLoadingNewerReportActions: false,
    },
    reportActions = [],
    parentReportAction,
    accountManagerReportID,
    markReadyForHydration,
    policies = {},
    isSidebarLoaded = false,
    viewportOffsetTop,
    isComposerFullSize = false,
    userLeavingStatus = false,
    currentReportID = '',
    navigation,
}: ReportScreenProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();
    const isFocused = useIsFocused();
    const prevIsFocused = usePrevious(isFocused);
    const firstRenderRef = useRef(true);
    const flatListRef = useRef<FlatList>(null);
    const reactionListRef = useRef<ReactionListRef>(null);
    /**
     * Create a lightweight Report so as to keep the re-rendering as light as possible by
     * passing in only the required props.
     *
     * Also, this plays nicely in contrast with Onyx,
     * which creates a new object every time collection changes. Because of this we can't
     * put this into onyx selector as it will be the same.
     */
    const report = useMemo(
        (): OnyxTypes.Report => ({
            lastReadTime: reportProp?.lastReadTime,
            reportID: reportProp?.reportID ?? '',
            policyID: reportProp?.policyID,
            lastVisibleActionCreated: reportProp?.lastVisibleActionCreated,
            statusNum: reportProp?.statusNum,
            stateNum: reportProp?.stateNum,
            writeCapability: reportProp?.writeCapability,
            type: reportProp?.type,
            errorFields: reportProp?.errorFields,
            isPolicyExpenseChat: reportProp?.isPolicyExpenseChat,
            parentReportID: reportProp?.parentReportID,
            parentReportActionID: reportProp?.parentReportActionID,
            chatType: reportProp?.chatType,
            pendingFields: reportProp?.pendingFields,
            isDeletedParentAction: reportProp?.isDeletedParentAction,
            reportName: reportProp?.reportName,
            description: reportProp?.description,
            managerID: reportProp?.managerID,
            total: reportProp?.total,
            nonReimbursableTotal: reportProp?.nonReimbursableTotal,
            reportFields: reportProp?.reportFields,
            ownerAccountID: reportProp?.ownerAccountID,
            currency: reportProp?.currency,
            participantAccountIDs: reportProp?.participantAccountIDs,
            isWaitingOnBankAccount: reportProp?.isWaitingOnBankAccount,
            iouReportID: reportProp?.iouReportID,
            isOwnPolicyExpenseChat: reportProp?.isOwnPolicyExpenseChat,
            notificationPreference: reportProp?.notificationPreference,
            isPinned: reportProp?.isPinned,
            chatReportID: reportProp?.chatReportID,
            visibility: reportProp?.visibility,
            oldPolicyName: reportProp?.oldPolicyName,
            policyName: reportProp?.policyName,
            isOptimisticReport: reportProp?.isOptimisticReport,
            lastMentionedTime: reportProp?.lastMentionedTime,
        }),
        [
            reportProp?.lastReadTime,
            reportProp?.reportID,
            reportProp?.policyID,
            reportProp?.lastVisibleActionCreated,
            reportProp?.statusNum,
            reportProp?.stateNum,
            reportProp?.writeCapability,
            reportProp?.type,
            reportProp?.errorFields,
            reportProp?.isPolicyExpenseChat,
            reportProp?.parentReportID,
            reportProp?.parentReportActionID,
            reportProp?.chatType,
            reportProp?.pendingFields,
            reportProp?.isDeletedParentAction,
            reportProp?.reportName,
            reportProp?.description,
            reportProp?.managerID,
            reportProp?.total,
            reportProp?.nonReimbursableTotal,
            reportProp?.reportFields,
            reportProp?.ownerAccountID,
            reportProp?.currency,
            reportProp?.participantAccountIDs,
            reportProp?.isWaitingOnBankAccount,
            reportProp?.iouReportID,
            reportProp?.isOwnPolicyExpenseChat,
            reportProp?.notificationPreference,
            reportProp?.isPinned,
            reportProp?.chatReportID,
            reportProp?.visibility,
            reportProp?.oldPolicyName,
            reportProp?.policyName,
            reportProp?.isOptimisticReport,
            reportProp?.lastMentionedTime,
        ],
    );

    const prevReport = usePrevious(report);
    const prevUserLeavingStatus = usePrevious(userLeavingStatus);
    const [isBannerVisible, setIsBannerVisible] = useState(true);
    const [listHeight, setListHeight] = useState(0);
    const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({});

    const wasReportAccessibleRef = useRef(false);
    if (firstRenderRef.current) {
        Timing.start(CONST.TIMING.CHAT_RENDER);
        Performance.markStart(CONST.TIMING.CHAT_RENDER);
    }

    const reportID = getReportID(route);
    const {reportPendingAction, reportErrors} = ReportUtils.getReportOfflinePendingActionAndErrors(report);
    const screenWrapperStyle: ViewStyle[] = [styles.appContent, styles.flex1, {marginTop: viewportOffsetTop}];
    const isEmptyChat = useMemo((): boolean => reportActions.length === 0, [reportActions]);
    // There are no reportActions at all to display and we are still in the process of loading the next set of actions.
    const isLoadingInitialReportActions = reportActions.length === 0 && !!reportMetadata?.isLoadingInitialReportActions;
    const isOptimisticDelete = report.statusNum === CONST.REPORT.STATUS_NUM.CLOSED;
    const shouldHideReport = !ReportUtils.canAccessReport(report, policies, betas);

    const isLoading = !reportID || !isSidebarLoaded || PersonalDetailsUtils.isPersonalDetailsEmpty();
    const lastReportAction: OnyxEntry<OnyxTypes.ReportAction> = useMemo(
        () =>
            reportActions.length
                ? [...reportActions, parentReportAction].find((action) => ReportUtils.canEditReportAction(action) && !ReportActionsUtils.isMoneyRequestAction(action)) ?? null
                : null,
        [reportActions, parentReportAction],
    );
    const isSingleTransactionView = ReportUtils.isMoneyRequest(report);
    const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`] ?? null;
    const isTopMostReportId = currentReportID === getReportID(route);
    const didSubscribeToReportLeavingEvents = useRef(false);

    useEffect(() => {
        if (!report.reportID || shouldHideReport) {
            wasReportAccessibleRef.current = false;
            return;
        }
        wasReportAccessibleRef.current = true;
    }, [shouldHideReport, report]);

    const goBack = useCallback(() => {
        Navigation.goBack(undefined, false, true);
    }, []);

    let headerView = (
        <HeaderView
            reportID={reportID}
            onNavigationMenuButtonClicked={goBack}
            report={report}
            parentReportAction={parentReportAction}
        />
    );

    if (isSingleTransactionView) {
        headerView = (
            <MoneyRequestHeader
                report={report}
                policy={policy}
                parentReportAction={parentReportAction}
            />
        );
    }

    if (ReportUtils.isMoneyRequestReport(report)) {
        headerView = (
            <MoneyReportHeader
                report={report}
                policy={policy}
            />
        );
    }

    /**
     * When false the ReportActionsView will completely unmount and we will show a loader until it returns true.
     */
    const isReportReadyForDisplay = useMemo((): boolean => {
        const reportIDFromPath = getReportID(route);

        // This is necessary so that when we are retrieving the next report data from Onyx the ReportActionsView will remount completely
        const isTransitioning = report && report.reportID !== reportIDFromPath;
        return reportIDFromPath !== '' && !!report.reportID && !isTransitioning;
    }, [route, report]);

    useEffect(() => {
        if (!report.reportID || !isFocused) {
            return;
        }
        Report.updateLastVisitTime(report.reportID);
    }, [report.reportID, isFocused]);

    const fetchReportIfNeeded = useCallback(() => {
        const reportIDFromPath = getReportID(route);

        // Report ID will be empty when the reports collection is empty.
        // This could happen when we are loading the collection for the first time after logging in.
        if (!ReportUtils.isValidReportIDFromPath(reportIDFromPath)) {
            return;
        }

        // It possible that we may not have the report object yet in Onyx yet e.g. we navigated to a URL for an accessible report that
        // is not stored locally yet. If report.reportID exists, then the report has been stored locally and nothing more needs to be done.
        // If it doesn't exist, then we fetch the report from the API.
        if (report.reportID === getReportID(route) && !isLoadingInitialReportActions) {
            return;
        }

        Report.openReport(reportIDFromPath);
    }, [report.reportID, route, isLoadingInitialReportActions]);

    const dismissBanner = useCallback(() => {
        setIsBannerVisible(false);
    }, []);

    const chatWithAccountManager = useCallback(() => {
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(accountManagerReportID ?? ''));
    }, [accountManagerReportID]);

    // Clear notifications for the current report when it's opened and re-focused
    const clearNotifications = useCallback(() => {
        // Check if this is the top-most ReportScreen since the Navigator preserves multiple at a time
        if (!isTopMostReportId) {
            return;
        }

        clearReportNotifications(report.reportID);
    }, [report.reportID, isTopMostReportId]);

    useEffect(clearNotifications, [clearNotifications]);
    useAppFocusEvent(clearNotifications);

    useEffect(() => {
        Timing.end(CONST.TIMING.CHAT_RENDER);
        Performance.markEnd(CONST.TIMING.CHAT_RENDER);

        fetchReportIfNeeded();
        ComposerActions.setShouldShowComposeInput(true);
        return () => {
            if (!didSubscribeToReportLeavingEvents) {
                return;
            }

            Report.unsubscribeFromLeavingRoomReportChannel(report.reportID);
        };

        // I'm disabling the warning, as it expects to use exhaustive deps, even though we want this useEffect to run only on the first render.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // If a user has chosen to leave a thread, and then returns to it (e.g. with the back button), we need to call `openReport` again in order to allow the user to rejoin and to receive real-time updates
    useEffect(() => {
        if (!isFocused || prevIsFocused || !ReportUtils.isChatThread(report) || report.notificationPreference !== CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN) {
            return;
        }
        Report.openReport(report.reportID);

        // We don't want to run this useEffect every time `report` is changed
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prevIsFocused, report.notificationPreference, isFocused]);

    useEffect(() => {
        // We don't want this effect to run on the first render.
        if (firstRenderRef.current) {
            firstRenderRef.current = false;
            return;
        }

        const onyxReportID = report.reportID;
        const prevOnyxReportID = prevReport.reportID;
        const routeReportID = getReportID(route);

        // Navigate to the Concierge chat if the room was removed from another device (e.g. user leaving a room or removed from a room)
        if (
            // non-optimistic case
            (!prevUserLeavingStatus && !!userLeavingStatus) ||
            // optimistic case
            (!!prevOnyxReportID &&
                prevOnyxReportID === routeReportID &&
                !onyxReportID &&
                prevReport.statusNum === CONST.REPORT.STATUS_NUM.OPEN &&
                (report.statusNum === CONST.REPORT.STATUS_NUM.CLOSED || (!report.statusNum && !prevReport.parentReportID && prevReport.chatType === CONST.REPORT.CHAT_TYPE.POLICY_ROOM))) ||
            ((ReportUtils.isMoneyRequest(prevReport) || ReportUtils.isMoneyRequestReport(prevReport)) && isEmptyObject(report))
        ) {
            Navigation.dismissModal();
            if (Navigation.getTopmostReportId() === prevOnyxReportID) {
                Navigation.setShouldPopAllStateOnUP();
                Navigation.goBack(undefined, false, true);
            }
            if (prevReport.parentReportID) {
                // Prevent navigation to the Money Request Report if it is pending deletion.
                const parentReport = ReportUtils.getReport(prevReport.parentReportID);
                if (ReportUtils.isMoneyRequestReportPendingDeletion(parentReport)) {
                    return;
                }
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(prevReport.parentReportID));
                return;
            }
            Report.navigateToConciergeChat();
            return;
        }

        // If you already have a report open and are deeplinking to a new report on native,
        // the ReportScreen never actually unmounts and the reportID in the route also doesn't change.
        // Therefore, we need to compare if the existing reportID is the same as the one in the route
        // before deciding that we shouldn't call OpenReport.
        if (onyxReportID === prevReport.reportID && (!onyxReportID || onyxReportID === routeReportID)) {
            return;
        }

        fetchReportIfNeeded();
        ComposerActions.setShouldShowComposeInput(true);
    }, [route, report, fetchReportIfNeeded, prevReport.reportID, prevUserLeavingStatus, userLeavingStatus, prevReport.statusNum, prevReport.parentReportID, prevReport.chatType, prevReport]);

    useEffect(() => {
        if (!ReportUtils.isValidReportIDFromPath(reportID)) {
            return;
        }
        // Ensures subscription event succeeds when the report/workspace room is created optimistically.
        // Check if the optimistic `OpenReport` or `AddWorkspaceRoom` has succeeded by confirming
        // any `pendingFields.createChat` or `pendingFields.addWorkspaceRoom` fields are set to null.
        // Existing reports created will have empty fields for `pendingFields`.
        const didCreateReportSuccessfully = !report.pendingFields || (!report.pendingFields.addWorkspaceRoom && !report.pendingFields.createChat);
        if (!didSubscribeToReportLeavingEvents.current && didCreateReportSuccessfully) {
            Report.subscribeToReportLeavingEvents(reportID);
            didSubscribeToReportLeavingEvents.current = true;
        }
    }, [report, didSubscribeToReportLeavingEvents, reportID]);

    const onListLayout = useCallback((event: LayoutChangeEvent) => {
        setListHeight((prev) => event.nativeEvent?.layout?.height ?? prev);
        if (!markReadyForHydration) {
            return;
        }

        markReadyForHydration();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const reportIDFromParams = route.params.reportID;
    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = useMemo(
        (): boolean =>
            (!wasReportAccessibleRef.current &&
                !firstRenderRef.current &&
                !report.reportID &&
                !isOptimisticDelete &&
                !reportMetadata?.isLoadingInitialReportActions &&
                !isLoading &&
                !userLeavingStatus) ||
            shouldHideReport ||
            (!!reportIDFromParams && !ReportUtils.isValidReportIDFromPath(reportIDFromParams)),
        [report, reportMetadata, isLoading, shouldHideReport, isOptimisticDelete, userLeavingStatus, reportIDFromParams],
    );

    const actionListValue = useMemo((): ActionListContextType => ({flatListRef, scrollPosition, setScrollPosition}), [flatListRef, scrollPosition, setScrollPosition]);

    return (
        <ActionListContext.Provider value={actionListValue}>
            <ReactionListContext.Provider value={reactionListRef}>
                <ScreenWrapper
                    navigation={navigation}
                    style={screenWrapperStyle}
                    shouldEnableKeyboardAvoidingView={isTopMostReportId}
                    testID={ReportScreen.displayName}
                >
                    <FullPageNotFoundView
                        shouldShow={shouldShowNotFoundPage}
                        subtitleKey="notFound.noAccess"
                        shouldShowBackButton={isSmallScreenWidth}
                        onBackButtonPress={Navigation.goBack}
                        shouldShowLink={false}
                    >
                        <OfflineWithFeedback
                            pendingAction={reportPendingAction}
                            errors={reportErrors}
                            shouldShowErrorMessages={false}
                            needsOffscreenAlphaCompositing
                        >
                            {headerView}
                            {ReportUtils.isTaskReport(report) && isSmallScreenWidth && ReportUtils.isOpenTaskReport(report, parentReportAction) && (
                                <View style={[styles.borderBottom]}>
                                    <View style={[styles.appBG, styles.pl0]}>
                                        <View style={[styles.ph5, styles.pb3]}>
                                            <TaskHeaderActionButton report={report} />
                                        </View>
                                    </View>
                                </View>
                            )}
                        </OfflineWithFeedback>
                        {!!accountManagerReportID && ReportUtils.isConciergeChatReport(report) && isBannerVisible && (
                            <Banner
                                containerStyles={[styles.mh4, styles.mt4, styles.p4, styles.bgDark]}
                                textStyles={[styles.colorReversed]}
                                text={translate('reportActionsView.chatWithAccountManager')}
                                onClose={dismissBanner}
                                onPress={chatWithAccountManager}
                                shouldShowCloseButton
                            />
                        )}
                        <DragAndDropProvider isDisabled={!isReportReadyForDisplay || !ReportUtils.canUserPerformWriteAction(report)}>
                            <View
                                style={[styles.flex1, styles.justifyContentEnd, styles.overflowHidden]}
                                onLayout={onListLayout}
                            >
                                {isReportReadyForDisplay && !isLoadingInitialReportActions && !isLoading && (
                                    <ReportActionsView
                                        reportActions={reportActions}
                                        report={report}
                                        parentReportAction={parentReportAction}
                                        isLoadingInitialReportActions={reportMetadata?.isLoadingInitialReportActions}
                                        isLoadingNewerReportActions={reportMetadata?.isLoadingNewerReportActions}
                                        isLoadingOlderReportActions={reportMetadata?.isLoadingOlderReportActions}
                                    />
                                )}

                                {/* Note: The ReportActionsSkeletonView should be allowed to mount even if the initial report actions are not loaded.
                     If we prevent rendering the report while they are loading then
                     we'll unnecessarily unmount the ReportActionsView which will clear the new marker lines initial state. */}
                                {(!isReportReadyForDisplay || isLoadingInitialReportActions || isLoading) && <ReportActionsSkeletonView />}

                                {isReportReadyForDisplay ? (
                                    <ReportFooter
                                        report={report}
                                        pendingAction={reportPendingAction}
                                        isComposerFullSize={!!isComposerFullSize}
                                        listHeight={listHeight}
                                        isEmptyChat={isEmptyChat}
                                        lastReportAction={lastReportAction}
                                    />
                                ) : (
                                    <ReportFooter isReportReadyForDisplay={false} />
                                )}
                            </View>
                        </DragAndDropProvider>
                    </FullPageNotFoundView>
                </ScreenWrapper>
            </ReactionListContext.Provider>
        </ActionListContext.Provider>
    );
}

ReportScreen.displayName = 'ReportScreen';

export default withViewportOffsetTop(
    withCurrentReportID(
        withOnyx<ReportScreenProps, ReportScreenOnyxProps>(
            {
                isSidebarLoaded: {
                    key: ONYXKEYS.IS_SIDEBAR_LOADED,
                },
                reportActions: {
                    key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getReportID(route)}`,
                    canEvict: false,
                    selector: (reportActions: OnyxEntry<OnyxTypes.ReportActions>) => ReportActionsUtils.getSortedReportActionsForDisplay(reportActions, true),
                },
                report: {
                    key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${getReportID(route)}`,
                    allowStaleData: true,
                    selector: reportWithoutHasDraftSelector,
                },
                reportMetadata: {
                    key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT_METADATA}${getReportID(route)}`,
                    initialValue: {
                        isLoadingInitialReportActions: true,
                        isLoadingOlderReportActions: false,
                        isLoadingNewerReportActions: false,
                    },
                },
                isComposerFullSize: {
                    key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${getReportID(route)}`,
                    initialValue: false,
                },
                betas: {
                    key: ONYXKEYS.BETAS,
                },
                policies: {
                    key: ONYXKEYS.COLLECTION.POLICY,
                    allowStaleData: true,
                },
                accountManagerReportID: {
                    key: ONYXKEYS.ACCOUNT_MANAGER_REPORT_ID,
                    initialValue: null,
                },
                userLeavingStatus: {
                    key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT_USER_IS_LEAVING_ROOM}${getReportID(route)}`,
                    initialValue: false,
                },
                parentReportAction: {
                    key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report ? report.parentReportID : 0}`,
                    selector: (parentReportActions: OnyxEntry<OnyxTypes.ReportActions>, props: WithOnyxInstanceState<ReportScreenOnyxProps>): OnyxEntry<OnyxTypes.ReportAction> => {
                        const parentReportActionID = props?.report?.parentReportActionID;
                        if (!parentReportActionID) {
                            return null;
                        }
                        return parentReportActions?.[parentReportActionID] ?? null;
                    },
                    canEvict: false,
                },
            },
            true,
        )(
            memo(
                ReportScreen,
                (prevProps, nextProps) =>
                    prevProps.isSidebarLoaded === nextProps.isSidebarLoaded &&
                    lodashIsEqual(prevProps.reportActions, nextProps.reportActions) &&
                    lodashIsEqual(prevProps.reportMetadata, nextProps.reportMetadata) &&
                    prevProps.isComposerFullSize === nextProps.isComposerFullSize &&
                    lodashIsEqual(prevProps.betas, nextProps.betas) &&
                    lodashIsEqual(prevProps.policies, nextProps.policies) &&
                    prevProps.accountManagerReportID === nextProps.accountManagerReportID &&
                    prevProps.userLeavingStatus === nextProps.userLeavingStatus &&
                    prevProps.currentReportID === nextProps.currentReportID &&
                    prevProps.viewportOffsetTop === nextProps.viewportOffsetTop &&
                    lodashIsEqual(prevProps.parentReportAction, nextProps.parentReportAction) &&
                    lodashIsEqual(prevProps.report, nextProps.report),
            ),
        ),
    ),
);
