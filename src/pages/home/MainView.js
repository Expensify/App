import React, {Component} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import ReportView from './report/ReportView';
import ONYXKEYS from '../../ONYXKEYS';
import styles from '../../styles/StyleSheet';
import {withRouter} from '../../libs/Router';
import compose from '../../libs/compose';
import {fetchChatReport} from '../../libs/actions/Report';

const propTypes = {
    // This comes from withRouter
    // eslint-disable-next-line react/forbid-prop-types
    match: PropTypes.object.isRequired,

    /* Onyx Props */

    // List of reports to display
    reports: PropTypes.objectOf(PropTypes.shape({
        reportID: PropTypes.number,
    })),
};

const defaultProps = {
    reports: {},
};

class MainView extends Component {
    componentDidMount() {
        const reportID = parseInt(this.props.match.params.reportID, 10);
        this.fetchReportIfNeeded(reportID);
    }

    componentDidUpdate(prevProps) {
        const previousReportID = parseInt(prevProps.match.params.reportID, 10);
        const newReportID = parseInt(this.props.match.params.reportID, 10);

        if (previousReportID !== newReportID) {
            this.fetchReportIfNeeded(newReportID);
        }
    }

    fetchReportIfNeeded(reportID) {
        // Check to see if this report exists in the report list and if so do not fetch it.
        if (_.find(this.props.reports, report => report.reportID === reportID)) {
            return;
        }

        fetchChatReport(reportID);
    }

    render() {
        const reportIDInUrl = parseInt(this.props.match.params.reportID, 10);

        // The styles for each of our reports. Basically, they are all hidden except for the one matching the
        // reportID in the URL
        let activeReportID;
        const reportStyles = _.reduce(this.props.reports, (memo, report) => {
            const isActiveReport = reportIDInUrl === report.reportID;
            const finalData = {...memo};
            let reportStyle;

            if (isActiveReport) {
                activeReportID = report.reportID;
                reportStyle = [styles.dFlex, styles.flex1];
            } else {
                reportStyle = [styles.dNone];
            }

            finalData[report.reportID] = [reportStyle];
            return finalData;
        }, {});

        const reportsToDisplay = _.filter(this.props.reports, report => (
            report.isPinned
                || report.unreadActionCount > 0
                || report.reportID === reportIDInUrl
        ));

        return (
            <>
                {_.map(reportsToDisplay, report => (
                    <View
                        key={report.reportID}
                        style={reportStyles[report.reportID]}
                    >
                        <ReportView
                            reportID={report.reportID}
                            isActiveReport={report.reportID === activeReportID}
                        />
                    </View>
                ))}
            </>
        );
    }
}

MainView.propTypes = propTypes;
MainView.defaultProps = defaultProps;

export default compose(
    withRouter,
    withOnyx({
        reports: {
            key: ONYXKEYS.COLLECTION.REPORT,
        },
    }),
)(MainView);
