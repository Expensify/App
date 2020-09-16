import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import ReportView from './report/ReportView';
import IONKEYS from '../../IONKEYS';
import styles from '../../style/StyleSheet';
import {withRouter} from '../../lib/Router';
import compose from '../../lib/compose';
import withIon from '../../components/withIon';
import withBatchedRendering from '../../components/withBatchedRendering';

const propTypes = {
    // This comes from withRouter
    // eslint-disable-next-line react/forbid-prop-types
    match: PropTypes.object.isRequired,

    /* From withIon() */
    // The reports from Ion that exist and will have a view rendered for them
    // eslint-disable-next-line react/no-unused-prop-types
    reports: PropTypes.objectOf(PropTypes.shape({
        reportID: PropTypes.number,
    })),

    /* From withBatchedRendering() */
    // The specific items that need to be rendered
    itemsToRender: PropTypes.PropTypes.objectOf(PropTypes.shape({
        reportID: PropTypes.number,
    })),
};

const defaultProps = {
    reports: {},
    itemsToRender: {},
};

// Since this component is connected to an Ion collection, it's props are updated anytime a single report
// in the collection changes.
// When reports are first fetched, this component is rendered n times (where n is the number of reports).
// There are only two pieces of data this component cares about:
// - reportID comes from the collection and is used to render ReportView, this data will never change after first render
// - match.params.reportID comes from React Router and will change anytime a report is selected from LHN
class MainView extends React.PureComponent {
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
        if (!_.size(this.props.itemsToRender)) {
            return null;
        }

        // The styles for each of our report views. Basically, they are all hidden except for the one matching the
        // reportID in the URL
        const reportStyles = _.reduce(this.props.itemsToRender, (memo, report) => {
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
                {_.map(this.props.itemsToRender, report => report.reportName && (
                    <ReportView
                        key={report.reportID}
                        style={reportStyles[report.reportID]}
                        reportID={report.reportID}
                        isActiveReport={this.isReportIDMatchingURL(report.reportID)}
                    />
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
    withBatchedRendering((props) => {
        const reportIDInURL = parseInt(props.match.params.reportID, 10);
        const isReportVisible = report => report.isUnread || report.pinnedReport || report.reportID === reportIDInURL;
        return [
            {items: _.pick(props.reports, isReportVisible), delay: 0},
            {items: props.reports, delay: 5000},
        ];
    }),
)(MainView);
