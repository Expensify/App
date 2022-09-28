import React from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import {Keyboard, Platform, View} from 'react-native';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import lodashFindLast from 'lodash/findLast';
import styles from '../../styles/styles';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderView from './HeaderView';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import * as Report from '../../libs/actions/Report';
import ONYXKEYS from '../../ONYXKEYS';
import Permissions from '../../libs/Permissions';
import * as ReportUtils from '../../libs/ReportUtils';
import ReportActionsView from './report/ReportActionsView';
import ReportActionCompose from './report/ReportActionCompose';
import SwipeableView from '../../components/SwipeableView';
import CONST from '../../CONST';
import ReportActionsSkeletonView from '../../components/ReportActionsSkeletonView';
import reportActionPropTypes from './report/reportActionPropTypes';
import ArchivedReportFooter from '../../components/ArchivedReportFooter';
import toggleReportActionComposeView from '../../libs/toggleReportActionComposeView';
import addViewportResizeListener from '../../libs/VisualViewport';
import {withNetwork} from '../../components/OnyxProvider';
import compose from '../../libs/compose';
import networkPropTypes from '../../components/networkPropTypes';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import OfflineIndicator from '../../components/OfflineIndicator';
import OfflineWithFeedback from '../../components/OfflineWithFeedback';
import withDrawerState, {withDrawerPropTypes} from '../../components/withDrawerState';
import FullPageNotFoundView from '../../components/BlockingViews/FullPageNotFoundView';

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

    /** Whether or not to show the Compose Input */
    session: PropTypes.shape({
        shouldShowComposeInput: PropTypes.bool,
    }),

    /** The report currently being looked at */
    report: PropTypes.shape({
        /** The largest sequenceNumber on this report */
        maxSequenceNumber: PropTypes.number,

        /** Whether there is an outstanding amount in IOU */
        hasOutstandingIOU: PropTypes.bool,

        /** Flag to check if the report actions data are loading */
        isLoadingReportActions: PropTypes.bool,

        /** ID for the report */
        reportID: PropTypes.number,
    }),

    /** Array of report actions for this report */
    reportActions: PropTypes.objectOf(PropTypes.shape(reportActionPropTypes)),

    /** Whether the composer is full size */
    isComposerFullSize: PropTypes.bool,

    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** The policies which the user has access to */
    policies: PropTypes.objectOf(PropTypes.shape({
        /** The policy name */
        name: PropTypes.string,

        /** The type of the policy */
        type: PropTypes.string,
    })),

    /** Information about the network */
    network: networkPropTypes.isRequired,

    ...windowDimensionsPropTypes,
    ...withDrawerPropTypes,
};

const defaultProps = {
    isSidebarLoaded: false,
    session: {
        shouldShowComposeInput: true,
    },
    reportActions: {},
    report: {
        maxSequenceNumber: 0,
        hasOutstandingIOU: false,
        isLoadingReportActions: false,
    },
    isComposerFullSize: false,
    betas: [],
    policies: {},
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
    return route.params.reportID.toString();
}

class ReportScreen extends React.Component {
    constructor(props) {
        super(props);

        this.onSubmitComment = this.onSubmitComment.bind(this);
        this.updateViewportOffsetTop = this.updateViewportOffsetTop.bind(this);
        this.removeViewportResizeListener = () => {};

        this.state = {
            skeletonViewContainerHeight: 0,
            viewportOffsetTop: 0,
        };
    }

    componentDidMount() {
        this.storeCurrentlyViewedReport();
        this.removeViewportResizeListener = addViewportResizeListener(this.updateViewportOffsetTop);
    }

    componentDidUpdate(prevProps) {
        if (this.props.route.params.reportID === prevProps.route.params.reportID) {
            return;
        }
        this.storeCurrentlyViewedReport();
    }

    componentWillUnmount() {
        this.removeViewportResizeListener();
    }

    /**
     * @param {String} text
     */
    onSubmitComment(text) {
        Report.addComment(getReportID(this.props.route), text);
    }

    setChatFooterStyles(isOffline) {
        return {...styles.chatFooter, minHeight: !isOffline ? CONST.CHAT_FOOTER_MIN_HEIGHT : 0};
    }

    /**
     * When reports change there's a brief time content is not ready to be displayed
     * It Should show the loader if it's the first time we are opening the report
     *
     * @returns {Boolean}
     */
    shouldShowLoader() {
        // This means there are no reportActions at all to display, but it is still in the process of loading the next set of actions.
        const isLoadingInitialReportActions = _.isEmpty(this.props.reportActions) && this.props.report.isLoadingReportActions;
        return !getReportID(this.props.route) || isLoadingInitialReportActions || !this.props.report.reportID;
    }

    /**
     * Persists the currently viewed report id
     */
    storeCurrentlyViewedReport() {
        const reportIDFromPath = getReportID(this.props.route);

        // Always reset the state of the composer view when the current reportID changes
        toggleReportActionComposeView(true);
        Report.updateCurrentlyViewedReportID(reportIDFromPath);

        // It possible that we may not have the report object yet in Onyx yet e.g. we navigated to a URL for an accessible report that
        // is not stored locally yet. If props.report.reportID exists, then the report has been stored locally and nothing more needs to be done.
        // If it doesn't exist, then we fetch the report from the API.
        if (this.props.report.reportID) {
            return;
        }

        Report.fetchChatReportsByIDs([reportIDFromPath], true);
    }

    /**
     * @param {SyntheticEvent} e
     */
    updateViewportOffsetTop(e) {
        const viewportOffsetTop = lodashGet(e, 'target.offsetTop', 0);
        this.setState({viewportOffsetTop});
    }

    render() {
        if (!this.props.isSidebarLoaded) {
            return null;
        }

        // We create policy rooms for all policies, however we don't show them unless
        // - It's a free plan workspace
        // - The report includes guides participants (@team.expensify.com) for 1:1 Assigned
        if (!Permissions.canUseDefaultRooms(this.props.betas)
            && ReportUtils.isDefaultRoom(this.props.report)
            && ReportUtils.getPolicyType(this.props.report, this.props.policies) !== CONST.POLICY.TYPE.FREE
            && !ReportUtils.hasExpensifyGuidesEmails(lodashGet(this.props.report, ['participants'], []))
        ) {
            return null;
        }

        if (!Permissions.canUsePolicyRooms(this.props.betas) && ReportUtils.isUserCreatedPolicyRoom(this.props.report)) {
            return null;
        }

        const reportID = getReportID(this.props.route);

        const isArchivedRoom = ReportUtils.isArchivedRoom(this.props.report);
        let reportClosedAction;
        if (isArchivedRoom) {
            reportClosedAction = lodashFindLast(this.props.reportActions, action => action.actionName === CONST.REPORT.ACTIONS.TYPE.CLOSED);
        }
        const addWorkspaceRoomPendingAction = lodashGet(this.props.report, 'pendingFields.addWorkspaceRoom');
        const addWorkspaceRoomErrors = lodashGet(this.props.report, 'errorFields.addWorkspaceRoom');
        const hideComposer = isArchivedRoom || !_.isEmpty(addWorkspaceRoomErrors);
        return (
            <ScreenWrapper
                style={[styles.appContent, styles.flex1, {marginTop: this.state.viewportOffsetTop}]}
                keyboardAvoidingViewBehavior={Platform.OS === 'android' ? '' : 'padding'}
            >
                <FullPageNotFoundView
                    shouldShow={!this.props.report.reportID}
                    subtitleKey="notFound.noAccess"
                >
                    <OfflineWithFeedback
                        pendingAction={addWorkspaceRoomPendingAction}
                        errors={addWorkspaceRoomErrors}
                        errorRowStyles={styles.dNone}
                    >
                        <HeaderView
                            reportID={reportID}
                            onNavigationMenuButtonClicked={() => Navigation.navigate(ROUTES.HOME)}
                        />
                    </OfflineWithFeedback>
                    <View
                        nativeID={CONST.REPORT.DROP_NATIVE_ID}
                        style={[styles.flex1, styles.justifyContentEnd, styles.overflowHidden]}
                        onLayout={event => this.setState({skeletonViewContainerHeight: event.nativeEvent.layout.height})}
                    >
                        {this.shouldShowLoader()
                            ? (
                                <ReportActionsSkeletonView
                                    containerHeight={this.state.skeletonViewContainerHeight}
                                />
                            )
                            : (
                                <ReportActionsView
                                    reportActions={this.props.reportActions}
                                    report={this.props.report}
                                    session={this.props.session}
                                    isComposerFullSize={this.props.isComposerFullSize}
                                    isDrawerOpen={this.props.isDrawerOpen}
                                />
                            )}
                        {(isArchivedRoom || hideComposer) && (
                            <View style={[styles.chatFooter]}>
                                {isArchivedRoom && (
                                    <ArchivedReportFooter
                                        reportClosedAction={reportClosedAction}
                                        report={this.props.report}
                                    />
                                )}
                                {!this.props.isSmallScreenWidth && (
                                    <View style={styles.offlineIndicatorRow}>
                                        {hideComposer && (
                                            <OfflineIndicator containerStyles={[styles.chatItemComposeSecondaryRow]} />
                                        )}
                                    </View>
                                )}
                            </View>
                        )}
                        {(!hideComposer && this.props.session.shouldShowComposeInput) && (
                            <View style={[this.setChatFooterStyles(this.props.network.isOffline), this.props.isComposerFullSize && styles.chatFooterFullCompose]}>
                                <SwipeableView onSwipeDown={Keyboard.dismiss}>
                                    <OfflineWithFeedback
                                        pendingAction={addWorkspaceRoomPendingAction}
                                    >
                                        <ReportActionCompose
                                            onSubmit={this.onSubmitComment}
                                            reportID={reportID}
                                            reportActions={this.props.reportActions}
                                            report={this.props.report}
                                            isComposerFullSize={this.props.isComposerFullSize}
                                        />
                                    </OfflineWithFeedback>
                                </SwipeableView>
                            </View>
                        )}
                    </View>
                </FullPageNotFoundView>
            </ScreenWrapper>
        );
    }
}

ReportScreen.propTypes = propTypes;
ReportScreen.defaultProps = defaultProps;

export default compose(
    withWindowDimensions,
    withDrawerState,
    withNetwork(),
    withOnyx({
        isSidebarLoaded: {
            key: ONYXKEYS.IS_SIDEBAR_LOADED,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
        reportActions: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getReportID(route)}`,
            canEvict: false,
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
    }),
)(ReportScreen);
