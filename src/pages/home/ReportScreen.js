import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import Banner from '@components/Banner';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import MoneyReportHeader from '@components/MoneyReportHeader';
import MoneyRequestHeader from '@components/MoneyRequestHeader';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import ScreenWrapper from '@components/ScreenWrapper';
import TaskHeaderActionButton from '@components/TaskHeaderActionButton';
import withCurrentReportID, {withCurrentReportIDDefaultProps, withCurrentReportIDPropTypes} from '@components/withCurrentReportID';
import withViewportOffsetTop from '@components/withViewportOffsetTop';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import useWindowDimensions from '@hooks/useWindowDimensions';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import reportWithoutHasDraftSelector from '@libs/OnyxSelectors/reportWithoutHasDraftSelector';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import personalDetailsPropType from '@pages/personalDetailsPropType';
import reportMetadataPropTypes from '@pages/reportMetadataPropTypes';
import reportPropTypes from '@pages/reportPropTypes';
import useThemeStyles from '@styles/useThemeStyles';
import * as ComposerActions from '@userActions/Composer';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import HeaderView from './HeaderView';
import reportActionPropTypes from './report/reportActionPropTypes';
import ReportActionsView from './report/ReportActionsView';
import ReportFooter from './report/ReportFooter';
import {ActionListContext, ReactionListContext} from './ReportScreenContext';

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

    viewportOffsetTop: PropTypes.number.isRequired,
    ...withCurrentReportIDPropTypes,
};

const defaultProps = {
    isSidebarLoaded: false,
    reportActions: [],
    report: {
        hasOutstandingIOU: false,
    },
    reportMetadata: {
        isLoadingInitialReportActions: true,
        isLoadingOlderReportActions: false,
        isLoadingNewerReportActions: false,
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
 * Get the currently viewed report ID as number
 *
 * @param {Object} route
 * @param {Object} route.params
 * @param {String} route.params.reportID
 * @returns {String}
 */
function getReportID(route) {
    // The report ID is used in an onyx key. If it's an empty string, onyx will return
    // a collection instead of an individual report.
    // We can't use the default value functionality of `lodash.get()` because it only
    // provides a default value on `undefined`, and will return an empty string.
    // Placing the default value outside of `lodash.get()` is intentional.
    return String(lodashGet(route, 'params.reportID') || 0);
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
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();

    const firstRenderRef = useRef(true);
    const flatListRef = useRef();
    const reactionListRef = useRef();
    const prevReport = usePrevious(report);
    const prevUserLeavingStatus = usePrevious(userLeavingStatus);
    const [isBannerVisible, setIsBannerVisible] = useState(true);
    const [listHeight, setListHeight] = useState(0);

    const reportID = getReportID(route);
    const {addWorkspaceRoomOrChatPendingAction, addWorkspaceRoomOrChatErrors} = ReportUtils.getReportOfflinePendingActionAndErrors(report);
    const screenWrapperStyle = [styles.appContent, styles.flex1, {marginTop: viewportOffsetTop}];

    // There are no reportActions at all to display and we are still in the process of loading the next set of actions.
    const isLoadingInitialReportActions = _.isEmpty(reportActions) && reportMetadata.isLoadingInitialReportActions;

    const isOptimisticDelete = lodashGet(report, 'statusNum') === CONST.REPORT.STATUS.CLOSED;

    const shouldHideReport = !ReportUtils.canAccessReport(report, policies, betas);

    const isLoading = !reportID || !isSidebarLoaded || _.isEmpty(personalDetails);

    const parentReportAction = ReportActionsUtils.getParentReportAction(report);
    const isSingleTransactionView = ReportUtils.isMoneyRequest(report);

    const policy = policies[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`] || {};

    const isTopMostReportId = currentReportID === getReportID(route);
    const didSubscribeToReportLeavingEvents = useRef(false);

    const goBack = useCallback(() => {
        Navigation.goBack(ROUTES.HOME, false, true);
    }, []);

    let headerView = (
        <HeaderView
            reportID={reportID}
            onNavigationMenuButtonClicked={goBack}
            personalDetails={personalDetails}
            report={report}
        />
    );

    if (isSingleTransactionView) {
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
        if (!ReportUtils.isValidReportIDFromPath(reportIDFromPath)) {
            return;
        }

        // It possible that we may not have the report object yet in Onyx yet e.g. we navigated to a URL for an accessible report that
        // is not stored locally yet. If report.reportID exists, then the report has been stored locally and nothing more needs to be done.
        // If it doesn't exist, then we fetch the report from the API.
        if (report.reportID && report.reportID === getReportID(route) && !isLoadingInitialReportActions) {
            return;
        }

        Report.openReport(reportIDFromPath);
    }, [report.reportID, route, isLoadingInitialReportActions]);

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

            // We need to scroll to the bottom of the list after the comment is added
            const refID = setTimeout(() => {
                flatListRef.current.scrollToOffset({animated: false, offset: 0});
            }, 10);

            return () => clearTimeout(refID);
        },
        [route],
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

        // Navigate to the Concierge chat if the room was removed from another device (e.g. user leaving a room or removed from a room)
        if (
            // non-optimistic case
            (!prevUserLeavingStatus && userLeavingStatus) ||
            // optimistic case
            (prevOnyxReportID &&
                prevOnyxReportID === routeReportID &&
                !onyxReportID &&
                prevReport.statusNum === CONST.REPORT.STATUS.OPEN &&
                (report.statusNum === CONST.REPORT.STATUS.CLOSED || (!report.statusNum && !prevReport.parentReportID)))
        ) {
            Navigation.dismissModal();
            if (Navigation.getTopmostReportId() === prevOnyxReportID) {
                Navigation.setShouldPopAllStateOnUP();
                Navigation.goBack(ROUTES.HOME, false, true);
            }
            if (prevReport.parentReportID) {
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
    }, [route, report, errors, fetchReportIfNeeded, prevReport.reportID, prevUserLeavingStatus, userLeavingStatus, prevReport.statusNum, prevReport.parentReportID]);

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

    const onListLayout = useCallback((e) => {
        setListHeight((prev) => lodashGet(e, 'nativeEvent.layout.height', prev));
        if (!markReadyForHydration) {
            return;
        }

        markReadyForHydration();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = useMemo(
        () => (!firstRenderRef.current && !report.reportID && !isOptimisticDelete && !reportMetadata.isLoadingInitialReportActions && !isLoading && !userLeavingStatus) || shouldHideReport,
        [report, reportMetadata, isLoading, shouldHideReport, isOptimisticDelete, userLeavingStatus],
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
                        <DragAndDropProvider isDisabled={!isReportReadyForDisplay || !ReportUtils.canUserPerformWriteAction(report)}>
                            <View
                                style={[styles.flex1, styles.justifyContentEnd, styles.overflowHidden]}
                                onLayout={onListLayout}
                            >
                                {isReportReadyForDisplay && !isLoadingInitialReportActions && !isLoading && (
                                    <ReportActionsView
                                        reportActions={reportActions}
                                        report={report}
                                        isLoadingInitialReportActions={reportMetadata.isLoadingInitialReportActions}
                                        isLoadingNewerReportActions={reportMetadata.isLoadingNewerReportActions}
                                        isLoadingOlderReportActions={reportMetadata.isLoadingOlderReportActions}
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
                                        listHeight={listHeight}
                                        personalDetails={personalDetails}
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
