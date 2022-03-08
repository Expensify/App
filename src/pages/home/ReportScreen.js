import React from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import {Keyboard, View} from 'react-native';
import _ from 'underscore';
import styles from '../../styles/styles';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderView from './HeaderView';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import * as Report from '../../libs/actions/Report';
import ONYXKEYS from '../../ONYXKEYS';
import Permissions from '../../libs/Permissions';
import * as ReportUtils from '../../libs/reportUtils';
import ReportActionsView from './report/ReportActionsView';
import ReportActionCompose from './report/ReportActionCompose';
import KeyboardSpacer from '../../components/KeyboardSpacer';
import SwipeableView from '../../components/SwipeableView';
import CONST from '../../CONST';
import FullScreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';
import ChatGhostUI from '../../components/ChatGhostUI';
import reportActionPropTypes from './report/reportActionPropTypes';

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
        /** Number of actions unread */
        unreadActionCount: PropTypes.number,

        /** The largest sequenceNumber on this report */
        maxSequenceNumber: PropTypes.number,

        /** The current position of the new marker */
        newMarkerSequenceNumber: PropTypes.number,

        /** Whether there is an outstanding amount in IOU */
        hasOutstandingIOU: PropTypes.bool,
    }),

    /** Array of report actions for this report */
    reportActions: PropTypes.objectOf(PropTypes.shape(reportActionPropTypes)),

    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),

    isLoadingReportData: PropTypes.bool,
};

const defaultProps = {
    isSidebarLoaded: false,
    session: {
        shouldShowComposeInput: true,
    },
    reportActions: {},
    report: {
        unreadActionCount: 0,
        maxSequenceNumber: 0,
        hasOutstandingIOU: false,
    },
    betas: [],
    isLoadingReportData: false,
};

/**
 * Get the currently viewed report ID as number
 *
 * @param {Object} route
 * @param {Object} route.params
 * @param {String} route.params.reportID
 * @returns {Number}
 */
function getReportID(route) {
    const params = route.params;
    return Number.parseInt(params.reportID, 10);
}

class ReportScreen extends React.Component {
    constructor(props) {
        super(props);

        this.onSubmitComment = this.onSubmitComment.bind(this);

        this.state = {
            isLoading: true,
            isGhostScreenVisible: true,
        };
    }

    componentDidMount() {
        this.prepareTransition();
        this.storeCurrentlyViewedReport();
    }

    componentDidUpdate(prevProps) {
        if (this.props.route.params.reportID === prevProps.route.params.reportID) {
            return;
        }

        this.prepareTransition();
        this.storeCurrentlyViewedReport();
    }

    componentWillUnmount() {
        clearTimeout(this.loadingTimerId);
    }

    /**
     * When the report data is loaded, hide the ghost screen
     *
     * @static
     * @param {Object} props
     * @param {Object} state
     * @return {Object|null}
     */
    static getDerivedStateFromProps(props, state) {
        if (state.isGhostScreenVisible && props.isLoadingReportData === false) {
            return {isGhostScreenVisible: false};
        }
        return null;
    }

    /**
     * @param {String} text
     */
    onSubmitComment(text) {
        Report.addAction(getReportID(this.props.route), text);
    }

    /**
     * When reports change there's a brief time content is not ready to be displayed
     *
     * @returns {Boolean}
     */
    shouldShowLoader() {
        return this.state.isLoading || !getReportID(this.props.route);
    }

    /**
     * Configures a small loading transition and proceeds with rendering available data
     */
    prepareTransition() {
        this.setState({isLoading: true});
        clearTimeout(this.loadingTimerId);
        this.loadingTimerId = setTimeout(() => this.setState({isLoading: false}), 0);
    }

    /**
     * Persists the currently viewed report id
     */
    storeCurrentlyViewedReport() {
        const reportID = getReportID(this.props.route);
        if (_.isNaN(reportID)) {
            Report.handleInaccessibleReport();
            return;
        }
        Report.updateCurrentlyViewedReportID(reportID);
    }

    render() {
        if (!this.props.isSidebarLoaded) {
            return null;
        }

        if (!Permissions.canUseDefaultRooms(this.props.betas) && ReportUtils.isChatRoom(this.props.report)) {
            return null;
        }

        const reportID = getReportID(this.props.route);
        return (
            <ScreenWrapper style={[styles.appContent, styles.flex1]}>
                <HeaderView
                    reportID={reportID}
                    onNavigationMenuButtonClicked={() => Navigation.navigate(ROUTES.HOME)}
                />

                <View
                    nativeID={CONST.REPORT.DROP_NATIVE_ID}
                    style={[styles.flex1, styles.justifyContentEnd, styles.overflowHidden]}
                >
                    {
                      this.state.isGhostScreenVisible && <ChatGhostUI />
                    }
                    <FullScreenLoadingIndicator visible={!this.state.isGhostScreenVisible && this.shouldShowLoader()} />
                    {!this.state.isGhostScreenVisible && !this.shouldShowLoader() && (
                        <ReportActionsView
                            reportID={reportID}
                            reportActions={this.props.reportActions}
                            report={this.props.report}
                            session={this.props.session}
                        />
                    )}
                    {this.props.session.shouldShowComposeInput && (
                        <SwipeableView onSwipeDown={() => Keyboard.dismiss()}>
                            <ReportActionCompose
                                onSubmit={this.onSubmitComment}
                                reportID={reportID}
                                reportActions={this.props.reportActions}
                                report={this.props.report}
                            />
                        </SwipeableView>
                    )}
                    <KeyboardSpacer />
                </View>
            </ScreenWrapper>
        );
    }
}

ReportScreen.propTypes = propTypes;
ReportScreen.defaultProps = defaultProps;

export default withOnyx({
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
    betas: {
        key: ONYXKEYS.BETAS,
    },
    isLoadingReportData: {
        key: ONYXKEYS.IS_LOADING_REPORT_DATA,
    },
})(ReportScreen);
