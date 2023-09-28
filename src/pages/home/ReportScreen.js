import React, {useRef, useState, useEffect, useMemo, useCallback} from 'react';
import {withOnyx} from 'react-native-onyx';
import {useFocusEffect} from '@react-navigation/native';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import styles from '../../styles/styles';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderView from './HeaderView';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import * as Report from '../../libs/actions/Report';
import ONYXKEYS from '../../ONYXKEYS';
import * as ReportUtils from '../../libs/ReportUtils';
import ReportActionsView from './report/ReportActionsView';
import ReportActionsSkeletonView from '../../components/ReportActionsSkeletonView';
import reportActionPropTypes from './report/reportActionPropTypes';
import compose from '../../libs/compose';
import Visibility from '../../libs/Visibility';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import useLocalize from '../../hooks/useLocalize';
import OfflineWithFeedback from '../../components/OfflineWithFeedback';
import ReportFooter from './report/ReportFooter';
import Banner from '../../components/Banner';
import reportPropTypes from '../reportPropTypes';
import reportMetadataPropTypes from '../reportMetadataPropTypes';
import FullPageNotFoundView from '../../components/BlockingViews/FullPageNotFoundView';
import withViewportOffsetTop, {viewportOffsetTopPropTypes} from '../../components/withViewportOffsetTop';
import * as ReportActionsUtils from '../../libs/ReportActionsUtils';
import personalDetailsPropType from '../personalDetailsPropType';
import getIsReportFullyVisible from '../../libs/getIsReportFullyVisible';
import MoneyRequestHeader from '../../components/MoneyRequestHeader';
import MoneyReportHeader from '../../components/MoneyReportHeader';
import * as ComposerActions from '../../libs/actions/Composer';
import {ActionListContext, ReactionListContext} from './ReportScreenContext';
import TaskHeaderActionButton from '../../components/TaskHeaderActionButton';
import DragAndDropProvider from '../../components/DragAndDrop/Provider';
import usePrevious from '../../hooks/usePrevious';
import CONST from '../../CONST';
import withCurrentReportID, {withCurrentReportIDPropTypes, withCurrentReportIDDefaultProps} from '../../components/withCurrentReportID';

const propTypes = {
    /** Navigation route context info provided by react navigation */
    route: PropTypes.shape({
        /** Route specific parameters used on this screen */
        params: PropTypes.shape({
            /** The ID of the report this screen should display */
            reportID: PropTypes.string,

            /** The reportActionID to scroll to */
            reportActionID: PropTypes.string,
        }).isRequired,
    }).isRequired,

    /** Tells us if the sidebar has rendered */
    isSidebarLoaded: PropTypes.bool,

    /** The report currently being looked at */
    report: reportPropTypes,

    /** The report metadata loading states */
    reportMetadata: reportMetadataPropTypes,

    /** Array of report actions for this report */
    reportActions: PropTypes.arrayOf(PropTypes.shape(reportActionPropTypes)),

    /** Whether the composer is full size */
    isComposerFullSize: PropTypes.bool,

    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** The policies which the user has access to */
    policies: PropTypes.objectOf(
        PropTypes.shape({
            /** The policy name */
            name: PropTypes.string,

            /** The type of the policy */
            type: PropTypes.string,
        }),
    ),

    /** The account manager report ID */
    accountManagerReportID: PropTypes.string,

    /** All of the personal details for everyone */
    personalDetails: PropTypes.objectOf(personalDetailsPropType),

    /** Onyx function that marks the component ready for hydration */
    markReadyForHydration: PropTypes.func,

    /** Whether user is leaving the current report */
    userLeavingStatus: PropTypes.bool,

    ...viewportOffsetTopPropTypes,
    ...withCurrentReportIDPropTypes,
};

const defaultProps = {
    isSidebarLoaded: false,
    reportActions: [],
    report: {
        hasOutstandingIOU: false,
    },
    reportMetadata: {
        isLoadingReportActions: false,
        isLoadingMoreReportActions: false,
    },
    isComposerFullSize: false,
    betas: [],
    policies: {},
    accountManagerReportID: null,
    userLeavingStatus: false,
    personalDetails: {},
    markReadyForHydration: null,
    ...withCurrentReportIDDefaultProps,
};

/**
 *
 * Function to check weather the report available in props is default
 *
 * @param {Object} report
 * @returns {Boolean}
 */
const checkDefaultReport = (report) => report === defaultProps.report;

/**
 * Get the currently viewed report ID as number
 *
 * @param {Object} route
 * @param {Object} route.params
 * @param {String} route.params.reportID
 * @returns {String}
 */
function getReportID(route) {
    return String(lodashGet(route, 'params.reportID', null));
}

function ReportScreen({
    betas,
    route,
    report,
    reportMetadata,
    reportActions,
    accountManagerReportID,
    personalDetails,
    markReadyForHydration,
    policies,
    isSidebarLoaded,
    viewportOffsetTop,
    isComposerFullSize,
    errors,
    userLeavingStatus,
    currentReportID,
}) {
    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();

    const firstRenderRef = useRef(true);
    const flatListRef = useRef();
    const reactionListRef = useRef();
    const prevReport = usePrevious(report);
    const prevUserLeavingStatus = usePrevious(userLeavingStatus);
    const [isBannerVisible, setIsBannerVisible] = useState(true);

    const reportID = getReportID(route);
    const {addWorkspaceRoomOrChatPendingAction, addWorkspaceRoomOrChatErrors} = ReportUtils.getReportOfflinePendingActionAndErrors(report);
    const screenWrapperStyle = [styles.appContent, styles.flex1, {marginTop: viewportOffsetTop}];

    // There are no reportActions at all to display and we are still in the process of loading the next set of actions.
    const isLoadingInitialReportActions = _.isEmpty(reportActions) && reportMetadata.isLoadingReportActions;

    const isOptimisticDelete = lodashGet(report, 'statusNum') === CONST.REPORT.STATUS.CLOSED;

    const shouldHideReport = !ReportUtils.canAccessReport(report, policies, betas);

    const isLoading = !reportID || !isSidebarLoaded || _.isEmpty(personalDetails);

    const parentReportAction = ReportActionsUtils.getParentReportAction(report);
    const isDeletedParentAction = ReportActionsUtils.isDeletedParentAction(parentReportAction);
    const isSingleTransactionView = ReportUtils.isMoneyRequest(report);

    const policy = policies[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`] || {};

    const isTopMostReportId = currentReportID === getReportID(route);
    const didSubscribeToReportLeavingEvents = useRef(false);

    const isDefaultReport = checkDefaultReport(report);

    let headerView = (
        <HeaderView
            reportID={reportID}
            onNavigationMenuButtonClicked={() => Navigation.goBack(ROUTES.HOME, false, true)}
            personalDetails={personalDetails}
            report={report}
        />
    );

    if (isSingleTransactionView && !isDeletedParentAction) {
        headerView = (
            <MoneyRequestHeader
                report={report}
                policy={policy}
                personalDetails={personalDetails}
                isSingleTransactionView={isSingleTransactionView}
                parentReportAction={parentReportAction}
            />
        );
    }

    if (ReportUtils.isMoneyRequestReport(report)) {
        headerView = (
            <MoneyReportHeader
                report={report}
                policy={policy}
                personalDetails={personalDetails}
                isSingleTransactionView={isSingleTransactionView}
                parentReportAction={parentReportAction}
            />
        );
    }

    /**
     * When false the ReportActionsView will completely unmount and we will show a loader until it returns true.
     *
     * @returns {Boolean}
     */
    const isReportReadyForDisplay = useMemo(() => {
        const reportIDFromPath = getReportID(route);

        // This is necessary so that when we are retrieving the next report data from Onyx the ReportActionsView will remount completely
        const isTransitioning = report && report.reportID !== reportIDFromPath;
        return reportIDFromPath !== '' && report.reportID && !isTransitioning;
    }, [route, report]);

    const fetchReportIfNeeded = useCallback(() => {
        const reportIDFromPath = getReportID(route);

        // Report ID will be empty when the reports collection is empty.
        // This could happen when we are loading the collection for the first time after logging in.
        if (!reportIDFromPath) {
            return;
        }

        // It possible that we may not have the report object yet in Onyx yet e.g. we navigated to a URL for an accessible report that
        // is not stored locally yet. If report.reportID exists, then the report has been stored locally and nothing more needs to be done.
        // If it doesn't exist, then we fetch the report from the API.
        if (report.reportID && report.reportID === getReportID(route)) {
            return;
        }
        Report.openReport(reportIDFromPath);
    }, [report.reportID, route]);

    const dismissBanner = useCallback(() => {
        setIsBannerVisible(false);
    }, []);

    const chatWithAccountManager = useCallback(() => {
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(accountManagerReportID));
    }, [accountManagerReportID]);

    /**
     * @param {String} text
     */
    const onSubmitComment = useCallback(
        (text) => {
            Report.addComment(getReportID(route), text);
        },
        [route],
    );

    useFocusEffect(
        useCallback(() => {
            const unsubscribeVisibilityListener = Visibility.onVisibilityChange(() => {
                const isTopMostReportID = Navigation.getTopmostReportId() === getReportID(route);
                // If the report is not fully visible (AKA on small screen devices and LHR is open) or the report is optimistic (AKA not yet created)
                // we don't need to call openReport
                if (!getIsReportFullyVisible(isTopMostReportID) || report.isOptimisticReport) {
                    return;
                }

                Report.openReport(report.reportID);
            });

            return () => unsubscribeVisibilityListener();
            // The effect should run only on the first focus to attach listener
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []),
    );

    useEffect(() => {
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

    useEffect(() => {
        // We don't want this effect to run on the first render.
        if (firstRenderRef.current) {
            firstRenderRef.current = false;
            return;
        }

        const onyxReportID = report.reportID;
        const prevOnyxReportID = prevReport.reportID;
        const routeReportID = getReportID(route);

        // Navigate to the Concierge chat if the room was removed from another device (e.g. user leaving a room)
        if (
            // non-optimistic case
            (!prevUserLeavingStatus && userLeavingStatus) ||
            // optimistic case
            (prevOnyxReportID && prevOnyxReportID === routeReportID && !onyxReportID && prevReport.statusNum === CONST.REPORT.STATUS.OPEN && report.statusNum === CONST.REPORT.STATUS.CLOSED)
        ) {
            Navigation.goBack();
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
    }, [route, report, errors, fetchReportIfNeeded, prevReport.reportID, prevUserLeavingStatus, userLeavingStatus, prevReport.statusNum]);

    useEffect(() => {
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

    const onListLayout = useCallback(() => {
        if (!markReadyForHydration) {
            return;
        }

        markReadyForHydration();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = useMemo(
        () =>
            (!firstRenderRef.current &&
                !_.isEmpty(report) &&
                !isDefaultReport &&
                !report.reportID &&
                !isOptimisticDelete &&
                !report.isLoadingReportActions &&
                !isLoading &&
                !userLeavingStatus) ||
            shouldHideReport,
        [report, isLoading, shouldHideReport, isDefaultReport, isOptimisticDelete, userLeavingStatus],
    );

    return (
        <ActionListContext.Provider value={flatListRef}>
            <ReactionListContext.Provider value={reactionListRef}>
                <ScreenWrapper
                    style={screenWrapperStyle}
                    shouldEnableKeyboardAvoidingView={isTopMostReportId}
                    testID={ReportScreen.displayName}
                >
                    <FullPageNotFoundView
                        shouldShow={shouldShowNotFoundPage}
                        subtitleKey="notFound.noAccess"
                        shouldShowCloseButton={false}
                        shouldShowBackButton={isSmallScreenWidth}
                        onBackButtonPress={Navigation.goBack}
                        shouldShowLink={false}
                    >
                        <OfflineWithFeedback
                            pendingAction={addWorkspaceRoomOrChatPendingAction}
                            errors={addWorkspaceRoomOrChatErrors}
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
                        <DragAndDropProvider isDisabled={!isReportReadyForDisplay}>
                            <View
                                style={[styles.flex1, styles.justifyContentEnd, styles.overflowHidden]}
                                onLayout={onListLayout}
                            >
                                {isReportReadyForDisplay && !isLoadingInitialReportActions && !isLoading && (
                                    <ReportActionsView
                                        reportActions={reportActions}
                                        report={report}
                                        isLoadingReportActions={reportMetadata.isLoadingReportActions}
                                        isLoadingMoreReportActions={reportMetadata.isLoadingMoreReportActions}
                                        isComposerFullSize={isComposerFullSize}
                                        policy={policy}
                                    />
                                )}

                                {/* Note: The ReportActionsSkeletonView should be allowed to mount even if the initial report actions are not loaded.
                                    If we prevent rendering the report while they are loading then
                                    we'll unnecessarily unmount the ReportActionsView which will clear the new marker lines initial state. */}
                                {(!isReportReadyForDisplay || isLoadingInitialReportActions || isLoading) && <ReportActionsSkeletonView />}

                                {isReportReadyForDisplay ? (
                                    <ReportFooter
                                        pendingAction={addWorkspaceRoomOrChatPendingAction}
                                        reportActions={reportActions}
                                        report={report}
                                        isComposerFullSize={isComposerFullSize}
                                        onSubmitComment={onSubmitComment}
                                        policies={policies}
                                    />
                                ) : (
                                    <ReportFooter shouldDisableCompose />
                                )}
                            </View>
                        </DragAndDropProvider>
                    </FullPageNotFoundView>
                </ScreenWrapper>
            </ReactionListContext.Provider>
        </ActionListContext.Provider>
    );
}

ReportScreen.propTypes = propTypes;
ReportScreen.defaultProps = defaultProps;
ReportScreen.displayName = 'ReportScreen';

export default compose(
    withViewportOffsetTop,
    withCurrentReportID,
    withOnyx(
        {
            isSidebarLoaded: {
                key: ONYXKEYS.IS_SIDEBAR_LOADED,
            },
            reportActions: {
                key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getReportID(route)}`,
                canEvict: false,
                selector: ReportActionsUtils.getSortedReportActionsForDisplay,
            },
            report: {
                key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${getReportID(route)}`,
                allowStaleData: true,
            },
            reportMetadata: {
                key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT_METADATA}${getReportID(route)}`,
                initialValue: {
                    isLoadingReportActions: false,
                    isLoadingMoreReportActions: false,
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
            personalDetails: {
                key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            },
            userLeavingStatus: {
                key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT_USER_IS_LEAVING_ROOM}${getReportID(route)}`,
                initialValue: false,
            },
        },
        true,
    ),
)(ReportScreen);
