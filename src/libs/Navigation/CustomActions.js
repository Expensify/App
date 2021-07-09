import {CommonActions, StackActions, DrawerActions} from '@react-navigation/native';

/**
 * In order to create the desired browser navigation behavior on web and mobile web we need to replace any
 * type: 'drawer' routes with a type: 'route' so that when pushing to a report screen we never show the
 * drawer. We don't want to remove these since we always want the history length to increase by 1 whenever
 * we are moving to a new report screen or back to a previous one. This is a workaround since
 * react-navigation default behavior for a drawer is to skip pushing history states when navigating to the
 * current route
 *
 * @param {String} screenName
 * @param {Object} params
 * @returns {Function}
 */
function pushDrawerRoute(screenName, params, navigationRef) {
    return (state) => {


        // Avoid the navigation and refocus the report if we're trying to navigate to our active report
        const rootState = navigationRef.current.getRootState();
        const activeReportID = rootState.routes[0].state.routes[0].params.reportID;

        console.log(`activeReportID: ${activeReportID}, params.reportID: ${params.reportID}`)
        console.log(params);
        if (activeReportID === params.reportID) {
            if (state.type != 'drawer') {
                navigationRef.current.dispatch(StackActions.pop());
            }
            return DrawerActions.closeDrawer();
        }

        // Non Drawer navigators have routes and not history so we'll fallback to navigate() in the case where we are
        // unable to push a new screen onto the history stack e.g. navigating to a ReportScreen via a modal screen.
        // Note: One downside of this is that the history will be reset.
        if (state.type !== 'drawer') {
            return CommonActions.navigate(screenName, params);
        }

        const screenRoute = {type: 'route', name: screenName};
        const history = [...(state.history || [])].map(() => screenRoute);
        history.push(screenRoute);
        return CommonActions.reset({
            ...state,
            routes: [{
                name: screenName,
                params,
            }],
            history,
        });
    };
}

export default {
    pushDrawerRoute,
};
