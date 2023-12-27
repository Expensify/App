import React from 'react';
import IOURequestStepRoutePropTypes from './request/step/IOURequestStepRoutePropTypes';
import IOURequestStepWaypoint from './request/step/IOURequestStepWaypoint';

const propTypes = {
    /** Navigation route context info provided by react navigation */
    route: IOURequestStepRoutePropTypes.isRequired,
};

function MoneyRequestEditWaypointPage({route}) {
    return <IOURequestStepWaypoint route={route} />;
}

MoneyRequestEditWaypointPage.displayName = 'MoneyRequestEditWaypointPage';
MoneyRequestEditWaypointPage.propTypes = propTypes;
export default MoneyRequestEditWaypointPage;
