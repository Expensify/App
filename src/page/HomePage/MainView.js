import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import ReportView from './Report/ReportView';
import WithIon from '../../components/WithIon';
import IONKEYS from '../../IONKEYS';
import styles from '../../style/StyleSheet';
import {withRouter} from '../../lib/Router';

const propTypes = {
    // This comes from withRouter
    // eslint-disable-next-line react/forbid-prop-types
    match: PropTypes.object.isRequired,
};

class MainView extends React.Component {
    render() {
        if (!this.props.reports || this.props.reports.length === 0) {
            return null;
        }

        const reportIDInURL = parseInt(this.props.match.params.reportID, 10);

        // The styles for each of our reports. Basically, they are all hidden except for the one matching the
        // reportID in the URL
        const reportStyles = _.reduce(this.props.reports, (memo, report) => {
            const finalData = {...memo};
            const reportStyle = reportIDInURL === report.reportID
                ? [styles.dFlex, styles.flex1]
                : [styles.dNone];
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
                        <ReportView reportID={report.reportID} />
                    </View>
                ))}
            </>
        );
    }
}

MainView.propTypes = propTypes;

export default withRouter(WithIon({
    reports: {
        key: `${IONKEYS.REPORT}_[0-9]+$`,
        addAsCollection: true,
        collectionID: 'reportID',
    },
})(MainView));
