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
import {handleInaccessibleReport, updateCurrentlyViewedReportID, addAction} from '../../libs/actions/Report';
import ONYXKEYS from '../../ONYXKEYS';

import ReportActionsView from './report/ReportActionsView';
import ReportActionCompose from './report/ReportActionCompose';
import KeyboardSpacer from '../../components/KeyboardSpacer';
import SwipeableView from '../../components/SwipeableView';
import CONST from '../../CONST';
import FullScreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';

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
};

const defaultProps = {
    isSidebarLoaded: false,
    session: {
        shouldShowComposeInput: true,
    },
};

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
        const reportChanged = this.props.route.params.reportID !== prevProps.route.params.reportID;
        if (reportChanged) {
            this.prepareTransition();
            this.storeCurrentlyViewedReport();
        }
    }

    componentWillUnmount() {
        clearTimeout(this.loadingTimerId);
    }

    /**
     * @param {String} text
     */
    onSubmitComment(text) {
        addAction(this.getReportID(), text);
    }

    /**
     * Get the currently viewed report ID as number
     *
     * @returns {Number}
     */
    getReportID() {
        const params = this.props.route.params;
        return Number.parseInt(params.reportID, 10);
    }

    /**
     * When reports change there's a brief time content is not ready to be displayed
     *
     * @returns {Boolean}
     */
    shouldShowLoader() {
        return this.state.isLoading || !this.getReportID();
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
        const reportID = this.getReportID();
        if (_.isNaN(reportID)) {
            handleInaccessibleReport();
            return;
        }
        updateCurrentlyViewedReportID(reportID);
    }

    render() {
        if (!this.props.isSidebarLoaded) {
            return null;
        }

        const reportID = this.getReportID();
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
                    <FullScreenLoadingIndicator visible={this.shouldShowLoader()} />
                    {!this.shouldShowLoader() && <ReportActionsView reportID={reportID} />}
                    {this.props.session.shouldShowComposeInput && (
                        <SwipeableView onSwipeDown={() => Keyboard.dismiss()}>
                            <ReportActionCompose
                                onSubmit={this.onSubmitComment}
                                reportID={reportID}
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
})(ReportScreen);
