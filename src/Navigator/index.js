import React from 'react';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';
import ROUTES from '../ROUTES';

export const navigationRef = React.createRef();
export const routerRef = React.createRef();

function navigate(name, params) {
    let route = name;

    if (name === ROUTES.REPORT && params.reportID) {
        route = ROUTES.getReportRoute(params.reportID);
        Onyx.merge(ONYXKEYS.CURRENTLY_VIEWED_REPORTID, String(params.reportID));
    }

    Onyx.merge(ONYXKEYS.CURRENT_ROUTE, route);
    navigationRef.current?.navigate(name, params);
    routerRef.current?.history.push(route);
}

export default {
    navigate,
};
