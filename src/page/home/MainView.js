import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import ReportView from './report/ReportView';
import withIon from '../../components/withIon';
import IONKEYS from '../../IONKEYS';
import styles from '../../style/StyleSheet';
import {withRouter} from '../../lib/Router';
import compose from '../../lib/compose';

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

// This is a PureComponent because since this method is connected to an Ion collection,
// it has setState() called on it anytime a single report in the collection changes. When
// reports are first fetched, this component is rendered n times (where n is the number of reports).
// By switching to a PureComponent, it will only re-render if the props change which is
// much more performant.
class MainView extends React.PureComponent {
    constructor(props) {
        super(props);
        this.areFirstReportsRendered = false;
        this.areAllReportsRendered = false;
        this.reportsToRender = null;
    }

    /**
     * This is an optimized method for rendering reports so that not too many
     * things are rendered on the first load of the page
     */
    componentDidUpdate() {
        // If all reports have been rendered, that's good, there is nothing additional to do
        if (this.areAllReportsRendered) {
            return;
        }

        // The first reports that get rendered are the ones that are unread, pinned, or matching the URL
        if (!this.areFirstReportsRendered) {
            this.areFirstReportsRendered = true;
            this.reportsToRender = _.filter(this.props.reports, report => report.isUnread || report.pinnedReport || this.isReportIDMatchingURL(report.reportID));
            this.forceUpdate();
            return;
        }

        // After the first reports are rendered, then the rest of the reports are rendered
        // after a brief delay to give the UI thread some breathing room
        if (!this.areAllReportsRendered) {
            this.areAllReportsRendered = true;
            this.reportsToRender = this.props.reports;
            setTimeout(() => this.forceUpdate(), 5000);
        }
    }

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
        if (!_.size(this.reportsToRender)) {
            return null;
        }

        // The styles for each of our report views. Basically, they are all hidden except for the one matching the
        // reportID in the URL
        const reportStyles = _.reduce(this.reportsToRender, (memo, report) => {
            const finalData = {...memo};
            let reportStyle;

            if (this.isReportIDMatchingURL(report.reportID)) {
                reportStyle = [styles.dFlex, styles.flex1];
            } else {
                reportStyle = [styles.dNone];
            }

            finalData[report.reportID] = [reportStyle];
            return finalData;
        }, {});

        return (
            <>
                {_.map(this.reportsToRender, report => report.reportName && (
                    <View
                        key={report.reportID}
                        style={reportStyles[report.reportID]}
                    >
                        <ReportView
                            reportID={report.reportID}
                            isActiveReport={this.isReportIDMatchingURL(report.reportID)}
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
            key: `${IONKEYS.REPORT}_[0-9]+$`,
            indexBy: 'reportID',
        },
    }),
)(MainView);
