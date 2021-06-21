import React from 'react';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import ReportView from './report/ReportView';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderView from './HeaderView';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import {updateCurrentlyViewedReportID} from '../../libs/actions/Report';

const propTypes = {
    /** Navigation route context info provided by react navigation */
    route: PropTypes.shape({
        /** Route specific parameters used on this screen */
        params: PropTypes.shape({
            /** The ID of the report this screen should display */
            reportID: PropTypes.string,

            /** An ID of a past message to render the chat starting from that point */
            sequenceNumber: PropTypes.string,
        }).isRequired,
    }).isRequired,
};

class ReportScreen extends React.Component {
    componentDidMount() {
        this.storeCurrentlyViewedReport();
    }

    componentDidUpdate(prevProps) {
        const reportChanged = this.props.route.params.reportID !== prevProps.route.params.reportID;

        if (reportChanged) {
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
     * Get an initial anchor point for the chat report actions
     *
     * @returns {number}
     */
    getAnchorSequenceNumber() {
        const params = this.props.route.params;
        return Number.parseInt(params.sequenceNumber, 10) || -1;
    }

    /**
     * Persists the currently viewed report id
     */
    storeCurrentlyViewedReport() {
        const reportID = this.getReportID();
        updateCurrentlyViewedReportID(reportID);
    }

    render() {
        return (
            <ScreenWrapper style={[styles.appContent, styles.flex1]}>
                <HeaderView
                    reportID={this.getReportID()}
                    onNavigationMenuButtonClicked={() => Navigation.navigate(ROUTES.HOME)}
                />

                <ReportView
                    reportID={this.getReportID()}
                    anchorSequenceNumber={this.getAnchorSequenceNumber()}
                />
            </ScreenWrapper>
        );
    }
}

ReportScreen.propTypes = propTypes;
export default ReportScreen;
