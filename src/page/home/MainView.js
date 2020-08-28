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

class MainView extends React.Component {
    render() {
        const reports = this.props.reports;
        if (!_.size(reports)) {
            return null;
        }

        const reportIDInURL = parseInt(this.props.match.params.reportID, 10);

        // The styles for each of our reports. Basically, they are all hidden except for the one matching the
        // reportID in the URL
        const reportStyles = _.reduce(reports, (memo, report) => {
            const finalData = {...memo};
            const reportStyle = reportIDInURL === report.reportID
                ? [styles.dFlex, styles.flex1]
                : [styles.dNone];
            finalData[report.reportID] = [reportStyle];
            return finalData;
        }, {});

        // If we don't have the reportID in reports let's insert it. The lower components
        // will handle fetching the report and adding it to Ion
        if (reportIDInURL && !_.contains(_.pluck(reports, 'reportID'), reportIDInURL)) {
            reports[reportIDInURL] = {reportID: reportIDInURL};
        }

        return (
            <>
                {_.map(reports, report => (
                    <View
                        key={report.reportID}
                        style={reportStyles[report.reportID]}
                    >
                        <ReportView reportID={report.reportID} />
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
            addAsCollection: true,
            collectionID: 'reportID',
        },
    }),
)(MainView);
