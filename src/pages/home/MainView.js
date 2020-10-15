import React, {Component} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import ReportView from './report/ReportView';
import withIon from '../../components/withIon';
import IONKEYS from '../../IONKEYS';
import withBatchedRendering from '../../components/withBatchedRendering';
import styles from '../../styles/StyleSheet';
import {withRouter} from '../../libs/Router';
import compose from '../../libs/compose';

const propTypes = {
    // This comes from withRouter
    // eslint-disable-next-line react/forbid-prop-types
    match: PropTypes.object.isRequired,

    /* Ion Props */

    // List of reports to display
    reports: PropTypes.objectOf(PropTypes.shape({
        reportID: PropTypes.number,
    })),
};

const defaultProps = {
    reports: {},
};

class MainView extends Component {
    /**
     * Looks to see if the reportID matches the report ID in the URL because that
     * report needs to be the one that is visible while all the other reports are hidden
     *
     * @param {number} reportID
     *
     * @returns {boolean}
     */
    isReportIDMatchingURL(reportID) {
        const reportIDInURL = parseInt(this.props.match.params.reportID, 10);
        return reportID === reportIDInURL;
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
            report.pinnedReport
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
    withIon({
        reports: {
            key: IONKEYS.COLLECTION.REPORT,
        },
    }),

    // The rendering of report views is done in batches.
    // The first batch are all the reports that are visible in the LHN.
    // The second batch are all the reports.
    withBatchedRendering('reports', [
        {
            items: (props) => {
                const reportIDInURL = parseInt(props.match.params.reportID, 10);
                const isReportVisible = report => (
                    report.isUnread
                    || report.pinnedReport
                    || report.reportID === reportIDInURL
                );
                return _.pick(props.reports, isReportVisible);
            },
            delay: 0,
        },
        {
            items: props => props.reports,
            delay: 5000,
        },
    ]),
)(MainView);
