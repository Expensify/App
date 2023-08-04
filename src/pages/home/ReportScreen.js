import React, { useState, useEffect, useRef } from 'react';
import {withOnyx} from 'react-native-onyx';
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
import CONST from '../../CONST';
import ReportActionsSkeletonView from '../../components/ReportActionsSkeletonView';
import reportActionPropTypes from './report/reportActionPropTypes';
import {withNetwork} from '../../components/OnyxProvider';
import compose from '../../libs/compose';
import Visibility from '../../libs/Visibility';
import networkPropTypes from '../../components/networkPropTypes';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import OfflineWithFeedback from '../../components/OfflineWithFeedback';
import ReportFooter from './report/ReportFooter';
import Banner from '../../components/Banner';
import withLocalize from '../../components/withLocalize';
import reportPropTypes from '../reportPropTypes';
import FullPageNotFoundView from '../../components/BlockingViews/FullPageNotFoundView';
import withViewportOffsetTop, {viewportOffsetTopPropTypes} from '../../components/withViewportOffsetTop';
import * as ReportActionsUtils from '../../libs/ReportActionsUtils';
import personalDetailsPropType from '../personalDetailsPropType';
import getIsReportFullyVisible from '../../libs/getIsReportFullyVisible';
import * as EmojiPickerAction from '../../libs/actions/EmojiPickerAction';
import MoneyRequestHeader from '../../components/MoneyRequestHeader';
import MoneyReportHeader from '../../components/MoneyReportHeader';
import * as ComposerActions from '../../libs/actions/Composer';
import ReportScreenContext from './ReportScreenContext';
import TaskHeaderActionButton from '../../components/TaskHeaderActionButton';
import DragAndDropProvider from '../../components/DragAndDrop/Provider';

const propTypes = {
    /** Navigation route context info provided by react navigation */
    route: PropTypes.shape({
        /** Route specific parameters used on this screen */
        params: PropTypes.shape({
            /** The ID of the report this screen should display */
            reportID: PropTypes.string,
        }).isRequired,
    }).isRequired,

    /** Tells us if the sidebar has rendered */
    isSidebarLoaded: PropTypes.bool,

    /** The report currently being looked at */
    report: reportPropTypes,

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

    /** Information about the network */
    network: networkPropTypes.isRequired,

    /** The account manager report ID */
    accountManagerReportID: PropTypes.string,

    /** All of the personal details for everyone */
    personalDetails: PropTypes.objectOf(personalDetailsPropType),

    ...windowDimensionsPropTypes,
    ...viewportOffsetTopPropTypes,
};

const defaultProps = {
    isSidebarLoaded: false,
    reportActions: [],
    report: {
        hasOutstandingIOU: false,
        isLoadingReportActions: false,
    },
    isComposerFullSize: false,
    betas: [],
    policies: {},
    accountManagerReportID: null,
    personalDetails: {},
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
    return String(lodashGet(route, 'params.reportID', null));
}

// Keep a reference to the list view height so we can use it when a new ReportScreen component mounts
let reportActionsListViewHeight = 0;

function ReportScreen(props) {
    const [skeletonViewContainerHeight, setSkeletonViewContainerHeight] = useState(reportActionsListViewHeight)
    const [isBannerVisible, setIsBannerVisible] = useState(false)
    const [isReportRemoved, setIsReportRemoved] = useState(false)
    const firstRenderRef = useRef(reportActionsListViewHeight === 0)
    const flatListRef = useRef()
    const reactionListRef = useRef()
    const prevProps = useRef(props)

    /**
     * @param {String} text
     */
    const onSubmitComment = (text) => {
        Report.addComment(getReportID(props.route), text)
    }

    const chatWithAccountManager = () => {
        Navigation.navigate(ROUTES.getReportRoute(props.accountManagerReportID))
    }

    const dismissBanner = () => {
        setIsBannerVisible(false)
    }

    /**
     * When false the ReportActionsView will completely unmount and we will show a loader until it returns true.
     *
     * @returns {Boolean}
     */
    const isReportReadyForDisplay = () => {
        const reportIDFromPath = getReportID(props.route);

        // This is necessary so that when we are retrieving the next report data from Onyx the ReportActionsView will remount completely
        const isTransitioning = props.report && props.report.reportID !== reportIDFromPath;
        return reportIDFromPath !== '' && props.report.reportID && !isTransitioning;
    }

    const fetchReportIfNeeded = () => {
        const reportIDFromPath = getReportID(props.route);

        // Report ID will be empty when the reports collection is empty.
        // This could happen when we are loading the collection for the first time after logging in.
        if (!reportIDFromPath) {
            return;
        }

        // It possible that we may not have the report object yet in Onyx yet e.g. we navigated to a URL for an accessible report that
        // is not stored locally yet. If props.report.reportID exists, then the report has been stored locally and nothing more needs to be done.
        // If it doesn't exist, then we fetch the report from the API.
        if (props.report.reportID && props.report.reportID === getReportID(props.route)) {
            return;
        }

        Report.openReport(reportIDFromPath);
    }

    const reportID = getReportID(props.route)
    
    const isLoading = !reportID || !props.isSidebarLoaded || _.isEmpty(props.personalDetails) || firstRenderRef.current;
    firstRenderRef.current = false;
    
    const parentReportAction = ReportActionsUtils.getParentReportAction(props.report);
    const isDeletedParentAction = ReportActionsUtils.isDeletedParentAction(parentReportAction);
    const isSingleTransactionView = ReportUtils.isMoneyRequest(props.report);
    
    let headerView = (
        <HeaderView
            reportID={reportID}
            onNavigationMenuButtonClicked={() => Navigation.goBack(ROUTES.HOME, false, true)}
            personalDetails={props.personalDetails}
            report={props.report}
        />        
    )

    if (isSingleTransactionView && !isDeletedParentAction) {
        headerView = (
            <MoneyRequestHeader
                report={props.report}
                policies={props.policies}
                personalDetails={props.personalDetails}
                isSingleTransactionView={isSingleTransactionView}
                parentReportAction={parentReportAction}
            />
        );
    }
    
    if (ReportUtils.isMoneyRequestReport(props.report)) {
        headerView = (
            <MoneyReportHeader
                report={props.report}
                policies={props.policies}
                personalDetails={props.personalDetails}
                isSingleTransactionView={isSingleTransactionView}
                parentReportAction={parentReportAction}
            />
        );
    }
    
    // There are no reportActions at all to display and we are still in the process of loading the next set of actions.
    const isLoadingInitialReportActions = _.isEmpty(props.reportActions) && props.report.isLoadingReportActions;
    
    const policy = props.policies[`${ONYXKEYS.COLLECTION.POLICY}${props.report.policyID}`];
    
    const isTopMostReportId = Navigation.getTopmostReportId() === getReportID(props.route);
    const shouldHideReport = !ReportUtils.canAccessReport(props.report, props.policies, props.betas);
    
    const screenWrapperStyle = [styles.appContent, styles.flex1, { marginTop: props.viewportOffsetTop }]
    const { addWorkspaceRoomOrChatPendingAction, addWorkspaceRoomOrChatErrors} = ReportUtils.getReportOfflinePendingActionAndErrors(props.report)
    
    useEffect(() => {
        const unsubscribeVisibilityListener = Visibility.onVisibilityChange(() => {
            // If the report is not fully visible (AKA on small screen devices and LHR is open) or the report is optimistic (AKA not yet created)
            // we don't need to call openReport
            if (!getIsReportFullyVisible(isTopMostReportId) || props.report.isOptimisticReport) {
                return;
            }

            Report.openReport(props.report.reportID);
        });

        fetchReportIfNeeded();
        ComposerActions.setShouldShowComposeInput(true);

        return () => {
            if (!unsubscribeVisibilityListener) {
                return;
            }
            unsubscribeVisibilityListener();
        }
    }, [])

    useEffect(() => {
        // If composer should be hidden, hide emoji picker as well
        if (ReportUtils.shouldHideComposer(props.report, props.errors)) {
            EmojiPickerAction.hideEmojiPicker(true);
        }
        const onyxReportID = props.report.reportID;
        const prevOnyxReportID = prevProps.current.report.reportID;
        const routeReportID = getReportID(props.route);

        // navigate to concierge when the room removed from another device (e.g. user leaving a room)
        // the report will not really null when removed, it will have defaultProps properties and values
        if (
            prevOnyxReportID &&
            prevOnyxReportID === routeReportID &&
            !onyxReportID &&
            // non-optimistic case
            (_.isEqual(props.report, defaultProps.report) ||
                // optimistic case
                (prevProps.current.report.statusNum === CONST.REPORT.STATUS.OPEN && props.report.statusNum === CONST.REPORT.STATUS.CLOSED))
        ) {
            Navigation.goBack();
            Report.navigateToConciergeChat();
            // isReportRemoved will prevent <FullPageNotFoundView> showing when navigating
            setIsReportRemoved(true);
            prevProps.current = props
            return;
        }

        // If you already have a report open and are deeplinking to a new report on native,
        // the ReportScreen never actually unmounts and the reportID in the route also doesn't change.
        // Therefore, we need to compare if the existing reportID is the same as the one in the route
        // before deciding that we shouldn't call OpenReport.
        if (onyxReportID === prevOnyxReportID && (!onyxReportID || onyxReportID === routeReportID)) {
            prevProps.current = props;
            return;
        }

        fetchReportIfNeeded();
        ComposerActions.setShouldShowComposeInput(true);
        prevProps.current = props;
    })

    return(
        <ReportScreenContext.Provider
            value={{
                flatListRef,
                reactionListRef,
            }}
        >
            <ScreenWrapper
                style={screenWrapperStyle}
                shouldEnableKeyboardAvoidingView={isTopMostReportId}
            >
                <FullPageNotFoundView
                    shouldShow={(!props.report.reportID && !props.report.isLoadingReportActions && !isLoading && !isReportRemoved) || shouldHideReport}
                    subtitleKey="notFound.noAccess"
                    shouldShowCloseButton={false}
                    shouldShowBackButton={props.isSmallScreenWidth}
                    onBackButtonPress={Navigation.goBack}
                >
                    <OfflineWithFeedback
                        pendingAction={addWorkspaceRoomOrChatPendingAction}
                        errors={addWorkspaceRoomOrChatErrors}
                        shouldShowErrorMessages={false}
                        needsOffscreenAlphaCompositing
                    >
                        {headerView}
                        {ReportUtils.isTaskReport(props.report) && props.isSmallScreenWidth && ReportUtils.isOpenTaskReport(props.report) && (
                            <View style={[styles.borderBottom]}>
                                <View style={[styles.appBG, styles.pl0]}>
                                    <View style={[styles.ph5, styles.pb3]}>
                                        <TaskHeaderActionButton report={props.report} />
                                    </View>
                                </View>
                            </View>
                        )}
                    </OfflineWithFeedback>
                    {Boolean(props.accountManagerReportID) && ReportUtils.isConciergeChatReport(props.report) && isBannerVisible && (
                        <Banner
                            containerStyles={[styles.mh4, styles.mt4, styles.p4, styles.bgDark]}
                            textStyles={[styles.colorReversed]}
                            text={props.translate('reportActionsView.chatWithAccountManager')}
                            onClose={dismissBanner}
                            onPress={chatWithAccountManager}
                            shouldShowCloseButton
                        />
                    )}
                    <DragAndDropProvider isDisabled={!isReportReadyForDisplay()}>
                        <View
                            style={[styles.flex1, styles.justifyContentEnd, styles.overflowHidden]}
                            onLayout={(event) => {
                                // Rounding this value for comparison because they can look like this: 411.9999694824219
                                const currentSkeletonViewContainerHeight = Math.round(event.nativeEvent.layout.height);

                                // Only set state when the height changes to avoid unnecessary renders
                                if (reportActionsListViewHeight === currentSkeletonViewContainerHeight) return;

                                // The height can be 0 if the component unmounts - we are not interested in this value and want to know how much space it
                                // takes up so we can set the skeleton view container height.
                                if (currentSkeletonViewContainerHeight === 0) {
                                    return;
                                }
                                reportActionsListViewHeight = currentSkeletonViewContainerHeight;
                                setSkeletonViewContainerHeight(currentSkeletonViewContainerHeight)
                            }}
                        >
                            {isReportReadyForDisplay() && !isLoadingInitialReportActions && !isLoading && (
                                <ReportActionsView
                                    reportActions={props.reportActions}
                                    report={props.report}
                                    isComposerFullSize={props.isComposerFullSize}
                                    parentViewHeight={skeletonViewContainerHeight}
                                    policy={policy}
                                />
                            )}

                            {/* Note: The report should be allowed to mount even if the initial report actions are not loaded. If we prevent rendering the report while they are loading then
                        we'll unnecessarily unmount the ReportActionsView which will clear the new marker lines initial state. */}
                            {(!isReportReadyForDisplay() || isLoadingInitialReportActions || isLoading) && (
                                <ReportActionsSkeletonView containerHeight={skeletonViewContainerHeight} />
                            )}

                            {isReportReadyForDisplay() && (
                                <>
                                    <ReportFooter
                                        errors={addWorkspaceRoomOrChatErrors}
                                        pendingAction={addWorkspaceRoomOrChatPendingAction}
                                        isOffline={props.network.isOffline}
                                        reportActions={props.reportActions}
                                        report={props.report}
                                        isComposerFullSize={props.isComposerFullSize}
                                        onSubmitComment={onSubmitComment}
                                        policies={props.policies}
                                    />
                                </>
                            )}

                            {!isReportReadyForDisplay() && (
                                <ReportFooter
                                    shouldDisableCompose
                                    isOffline={props.network.isOffline}
                                />
                            )}
                        </View>
                    </DragAndDropProvider>
                </FullPageNotFoundView>
            </ScreenWrapper>
        </ReportScreenContext.Provider>
    );
}

ReportScreen.propTypes = propTypes;
ReportScreen.defaultProps = defaultProps;

export default compose(
    withViewportOffsetTop,
    withLocalize,
    withWindowDimensions,
    withNetwork(),
    withOnyx({
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
        },
        isComposerFullSize: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${getReportID(route)}`,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
        policies: {
            key: ONYXKEYS.COLLECTION.POLICY,
        },
        accountManagerReportID: {
            key: ONYXKEYS.ACCOUNT_MANAGER_REPORT_ID,
        },
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
    }),
)(ReportScreen);
