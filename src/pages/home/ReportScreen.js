import React from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import ReportView from './report/ReportView';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderView from './HeaderView';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import FullScreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';
import {updateCurrentlyViewedReportID} from '../../libs/actions/Report';
import ONYXKEYS from '../../ONYXKEYS';

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
};

const defaultProps = {
    isSidebarLoaded: false,
};

class ReportScreen extends React.Component {
    constructor(props) {
        super(props);

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
     * Configures a small loading transition of fixed time and proceeds with rendering available data
     */
    prepareTransition() {
        this.setState({isLoading: true});

        clearTimeout(this.loadingTimerId);
        this.loadingTimerId = setTimeout(() => this.setState({isLoading: false}), 150);
    }

    /**
     * Persists the currently viewed report id
     */
    storeCurrentlyViewedReport() {
        const reportID = this.getReportID();
        updateCurrentlyViewedReportID(reportID);
    }

    render() {
        if (!this.props.isSidebarLoaded) {
            return null;
        }

        return (
            <ScreenWrapper style={[styles.appContent, styles.flex1]}>
                <HeaderView
                    reportID={this.getReportID()}
                    onNavigationMenuButtonClicked={() => Navigation.navigate(ROUTES.HOME)}
                />

                <FullScreenLoadingIndicator visible={this.shouldShowLoader()} />

                {!this.shouldShowLoader() && <ReportView reportID={this.getReportID()} />}
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
})(ReportScreen);
