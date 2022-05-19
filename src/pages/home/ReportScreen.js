import React from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import {Keyboard, View} from 'react-native';
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
import * as ReportUtils from '../../libs/reportUtils';
import ReportActionsView from './report/ReportActionsView';
import ReportActionCompose from './report/ReportActionCompose';
import KeyboardAvoidingView from '../../components/KeyboardAvoidingView';
import SwipeableView from '../../components/SwipeableView';
import CONST from '../../CONST';
import FullScreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';
import reportActionPropTypes from './report/reportActionPropTypes';
import ArchivedReportFooter from '../../components/ArchivedReportFooter';

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

    isComposerFullSize: PropTypes.bool,

    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),
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
    isComposerFullSize: false,
    betas: [],
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

        const isArchivedRoom = ReportUtils.isArchivedRoom(this.props.report);
        let reportClosedAction;
        if (isArchivedRoom) {
            reportClosedAction = lodashFindLast(this.props.reportActions, action => action.actionName === CONST.REPORT.ACTIONS.TYPE.CLOSED);
        }

        return (
            <ScreenWrapper style={[styles.appContent, styles.flex1]}>
                <KeyboardAvoidingView>
                    <HeaderView
                        reportID={reportID}
                        onNavigationMenuButtonClicked={() => Navigation.navigate(ROUTES.HOME)}
                    />

                    <View
                        nativeID={CONST.REPORT.DROP_NATIVE_ID}
                        style={[styles.flex1, styles.justifyContentEnd, styles.overflowHidden]}
                    >
                        {this.shouldShowLoader() && <FullScreenLoadingIndicator />}
                        {!this.shouldShowLoader() && !this.props.isComposerFullSize && (
                        <ReportActionsView
                            reportID={reportID}
                            reportActions={this.props.reportActions}
                            report={this.props.report}
                            session={this.props.session}
                        />
                        )}
                        {(isArchivedRoom || this.props.session.shouldShowComposeInput) && (
                        <View style={[styles.chatFooter, this.props.isComposerFullSize && styles.chatFooterFullCompose]}>
                            {
                                isArchivedRoom
                                    ? (
                                        <ArchivedReportFooter
                                            reportClosedAction={reportClosedAction}
                                            report={this.props.report}
                                        />
                                    ) : (
                                        <SwipeableView onSwipeDown={Keyboard.dismiss}>
                                            <ReportActionCompose
                                                onSubmit={this.onSubmitComment}
                                                reportID={reportID}
                                                reportActions={this.props.reportActions}
                                                report={this.props.report}
                                                isComposerFullSize={this.props.isComposerFullSize}
                                            />
                                        </SwipeableView>
                                    )
                            }
                        </View>
                        )}
                    </View>
                </KeyboardAvoidingView>
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
    isComposerFullSize: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${getReportID(route)}`,
    },
    betas: {
        key: ONYXKEYS.BETAS,
    },
})(ReportScreen);
