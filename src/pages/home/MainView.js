import React, {Component} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import ReportView from './report/ReportView';
import ONYXKEYS from '../../ONYXKEYS';
import styles from '../../styles/styles';
import compose from '../../libs/compose';

const propTypes = {
    /* Onyx Props */
    // List of reports to display
    reports: PropTypes.objectOf(PropTypes.shape({
        reportID: PropTypes.number,
    })),

    // ID of Report being viewed
    currentlyViewedReportID: PropTypes.string,
};

const defaultProps = {
    reports: {},
    currentlyViewedReportID: '',
};

class MainView extends Component {
    shouldComponentUpdate(nextProps) {
        if (nextProps.currentlyViewedReportID !== this.props.currentlyViewedReportID) {
            return true;
        }

        const nextPropsReports = _.mapObject(nextProps.reports, (val) => {
            const reportObject = {...val};
            delete reportObject.lastVisitedTimestamp;
            return reportObject;
        });

        const currentPropsReports = _.mapObject(this.props.reports, (val) => {
            const reportObject = {...val};
            delete reportObject.lastVisitedTimestamp;
            return reportObject;
        });

        if (!_.isEqual(nextPropsReports, currentPropsReports)) {
            return true;
        }

        return false;
    }

    render() {
        let activeReportID = parseInt(this.props.currentlyViewedReportID, 10);

        // The styles for each of our reports. Basically, they are all hidden except for the one matching the
        // reportID in the URL
        const reportStyles = _.reduce(this.props.reports, (memo, report) => {
            const isActiveReport = activeReportID === report.reportID;
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
                || report.reportID === activeReportID
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
    withOnyx({
        reports: {
            key: ONYXKEYS.COLLECTION.REPORT,
        },
        currentlyViewedReportID: {
            key: ONYXKEYS.CURRENTLY_VIEWED_REPORTID,
        },
    }),
)(MainView);
