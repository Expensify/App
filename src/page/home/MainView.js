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
import {fetchReportByIDIfNotExists} from '../../lib/actions/Report';

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
        if (!_.size(this.props.reports)) {
            return null;
        }

        const reportIDInURL = parseInt(this.props.match.params.reportID, 10);

        // The styles for each of our reports. Basically, they are all hidden except for the one matching the
        // reportID in the URL
        let activeReportID;
        const reportStyles = _.reduce(this.props.reports, (memo, report) => {
            const isActiveReport = reportIDInURL === report.reportID;
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

        return (
            <>
                {_.map(this.props.reports, report => (
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
            key: `${IONKEYS.REPORT}_[0-9]+$`,
            addAsCollection: true,
            collectionID: 'reportID',
        },

        // Let's check if the we need to fetch the report from reportID provided in the URL. In most cases, it would
        // be in Ion but if its not we need to make sure we can fetch and add the report to Ion. When Ion is aware of
        // the new report this component will re-render with the new this.props.reports values.
        // Since this is not directly used in the component and its instead used to update Ion which updates
        // this.props.values, we have no reason to define this in propTypes.
        reportFromURL: {
            key: `${IONKEYS.REPORT}_%DATAFROMPROPS%`,
            loader: fetchReportByIDIfNotExists,
            loaderParams: ['%DATAFROMPROPS%'],
            pathForProps: 'match.params.reportID',
        }
    }),
)(MainView);
