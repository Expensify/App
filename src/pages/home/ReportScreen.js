import React from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import {Platform, View} from 'react-native';
import lodashGet from 'lodash/get';
import _ from 'underscore';
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
import CONST from '../../CONST';
import ReportActionsSkeletonView from '../../components/ReportActionsSkeletonView';
import reportActionPropTypes from './report/reportActionPropTypes';
import toggleReportActionComposeView from '../../libs/toggleReportActionComposeView';
import addViewportResizeListener from '../../libs/VisualViewport';
import {withNetwork} from '../../components/OnyxProvider';
import compose from '../../libs/compose';
import networkPropTypes from '../../components/networkPropTypes';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import OfflineWithFeedback from '../../components/OfflineWithFeedback';
import withDrawerState, {withDrawerPropTypes} from '../../components/withDrawerState';
import ReportFooter from './report/ReportFooter';
import Banner from '../../components/Banner';
import withLocalize from '../../components/withLocalize';
import reportPropTypes from '../reportPropTypes';
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

    /** The report currently being looked at */
    report: reportPropTypes,

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
        this.chatWithAccountManager = this.chatWithAccountManager.bind(this);
        this.dismissBanner = this.dismissBanner.bind(this);
        this.removeViewportResizeListener = () => {};

        this.state = {
            skeletonViewContainerHeight: 0,
            viewportOffsetTop: 0,
            isBannerVisible: true,
        };
    }

    componentDidMount() {
        this.fetchReportIfNeeded();
        toggleReportActionComposeView(true);
        this.removeViewportResizeListener = addViewportResizeListener(this.updateViewportOffsetTop);
    }

    componentDidUpdate(prevProps) {
        const previousReportID = prevProps.route.params.reportID;
        const newReportID = this.props.route.params.reportID;
        if (previousReportID === newReportID) {
            return;
        }

        this.fetchReportIfNeeded();
        toggleReportActionComposeView(true);
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

    fetchReportIfNeeded() {
        const reportIDFromPath = getReportID(this.props.route);

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

    dismissBanner() {
        this.setState({isBannerVisible: false});
    }

    chatWithAccountManager() {
        Navigation.navigate(ROUTES.getReportRoute(this.props.accountManagerReportID));
    }

    render() {
        if (!this.props.isSidebarLoaded || _.isEmpty(this.props.personalDetails)) {
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
        const addWorkspaceRoomPendingAction = lodashGet(this.props.report, 'pendingFields.addWorkspaceRoom');
        const addWorkspaceRoomErrors = lodashGet(this.props.report, 'errorFields.addWorkspaceRoom');
        const isReportLoaded = this.props.report && this.props.report.reportID === reportID;
        const isTransitioning = !isReportLoaded;
        return (
            <ScreenWrapper
                style={[styles.appContent, styles.flex1, {marginTop: this.state.viewportOffsetTop}]}
                keyboardAvoidingViewBehavior={Platform.OS === 'android' ? '' : 'padding'}
            >
                <FullPageNotFoundView
                    shouldShow={!this.props.report.reportID}
                    subtitleKey="notFound.noAccess"
                    shouldShowCloseButton={false}
                    shouldShowBackButton={this.props.isSmallScreenWidth}
                    onBackButtonPress={() => {
                        Navigation.navigate(ROUTES.HOME);
                    }}
                >
                    <OfflineWithFeedback
                        pendingAction={addWorkspaceRoomPendingAction}
                        errors={addWorkspaceRoomErrors}
                        errorRowStyles={styles.dNone}
                    >
                        <HeaderView
                            reportID={reportID}
                            onNavigationMenuButtonClicked={() => Navigation.navigate(ROUTES.HOME)}
                            personalDetails={this.props.personalDetails}
                            report={this.props.report}
                            policies={this.props.policies}
                        />
                    </OfflineWithFeedback>
                    {this.props.accountManagerReportID && ReportUtils.isConciergeChatReport(this.props.report) && this.state.isBannerVisible && (
                        <Banner
                            containerStyles={[styles.mh4, styles.mt4, styles.p4, styles.bgDark]}
                            textStyles={[styles.colorReversed]}
                            text={this.props.translate('reportActionsView.chatWithAccountManager')}
                            onClose={this.dismissBanner}
                            onPress={this.chatWithAccountManager}
                            shouldShowCloseButton
                        />
                    )}
                    <View
                        nativeID={CONST.REPORT.DROP_NATIVE_ID}
                        style={[styles.flex1, styles.justifyContentEnd, styles.overflowHidden]}
                        onLayout={event => this.setState({skeletonViewContainerHeight: event.nativeEvent.layout.height})}
                    >
                        {(this.shouldShowLoader() || isTransitioning)
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
                        <ReportFooter
                            addWorkspaceRoomErrors={addWorkspaceRoomErrors}
                            addWorkspaceRoomPendingAction={addWorkspaceRoomPendingAction}
                            isOffline={this.props.network.isOffline}
                            reportActions={this.props.reportActions}
                            report={this.props.report}
                            isComposerFullSize={this.props.isComposerFullSize}
                            onSubmitComment={this.onSubmitComment}
                        />
                    </View>
                </FullPageNotFoundView>
            </ScreenWrapper>
        );
    }
}

ReportScreen.propTypes = propTypes;
ReportScreen.defaultProps = defaultProps;

export default compose(
    withLocalize,
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
        accountManagerReportID: {
            key: ONYXKEYS.ACCOUNT_MANAGER_REPORT_ID,
        },
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
    }),
)(ReportScreen);
