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
    constructor(props) {
        super(props);

        this.renderedReports = {};

        this.state = {};
    }

    render() {
        if (!this.state || !this.state.reports || this.state.reports.length === 0) {
            return null;
        }

        const reportIDInURL = parseInt(this.props.match.params.reportID, 10);

        const reportStyles = _.reduce(this.state.reports, (memo, report) => {
            const finalData = {...memo};
            const reportStyle = reportIDInURL === report.reportID
                ? [styles.dFlex, styles.flex1]
                : [styles.dNone];
            finalData[report.reportID] = [reportStyle];
            return finalData;
        }, {});

        return (
            <>
                {_.map(this.state.reports, report => (
                    <View
                        key={report.reportID}
                        ref={el => this.renderedReports[report.reportID] = el}
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
