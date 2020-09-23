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
const MainView = (props) => {
    const reportIDInURL = parseInt(props.match.params.reportID, 10);

    if (!_.size(props.reports) || !reportIDInURL) {
        return null;
    }

    return (
        <View
            key={reportIDInURL}
            style={[styles.dFlex, styles.flex1]}
        >
            <ReportView
                reportID={reportIDInURL}
                isActiveReport
            />
        </View>
    );
};

MainView.propTypes = propTypes;
MainView.defaultProps = defaultProps;

export default compose(
    withRouter,
    withIon({
        reports: {
            key: IONKEYS.COLLECTION.REPORT,
        },
    }),
)(MainView);
