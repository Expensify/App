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

// This component is responsible for grabbing the transactionID from the IOU key
// You can't use Onyx props in the withOnyx mapping, so we need to set up and access the transactionID here, and then pass it down so that WaypointEditor can subscribe to the transaction.
function MoneyRequestEditWaypointPage({route}) {
    return <WaypointEditor route={route} />;
}

MoneyRequestEditWaypointPage.displayName = 'MoneyRequestEditWaypointPage';
MoneyRequestEditWaypointPage.propTypes = propTypes;
MoneyRequestEditWaypointPage.defaultProps = defaultProps;
export default MoneyRequestEditWaypointPage;
