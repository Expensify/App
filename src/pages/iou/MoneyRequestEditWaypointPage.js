import React from 'react';
import PropTypes from 'prop-types';
import WaypointEditor from './WaypointEditor';

const propTypes = {
    /** Route params */
    route: PropTypes.shape({
        params: PropTypes.shape({
            /** Thread reportID */
            threadReportID: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

            /** ID of the transaction being edited */
            transactionID: PropTypes.string,

            /** Index of the waypoint being edited */
            waypointIndex: PropTypes.string,
        }),
    }),
};

const defaultProps = {
    route: {},
};

function MoneyRequestEditWaypointPage({route}) {
    return <WaypointEditor route={route} />;
}

MoneyRequestEditWaypointPage.displayName = 'MoneyRequestEditWaypointPage';
MoneyRequestEditWaypointPage.propTypes = propTypes;
MoneyRequestEditWaypointPage.defaultProps = defaultProps;
export default MoneyRequestEditWaypointPage;
