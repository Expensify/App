import {CommonActions, StackActions, DrawerActions} from '@react-navigation/native';
import lodashGet from 'lodash/get';

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
 * @param {Object} navigationRef
 * @returns {Function}
 */
function pushDrawerRoute(screenName, params, navigationRef) {
    return (state) => {
        // Avoid the navigation and refocus the report if we're trying to navigate to our active report
        // We use our RootState as the dispatch's state is relative to the active navigator and might
        // not contain our active report.
        const rootState = navigationRef.current.getRootState();
        const activeReportID = lodashGet(rootState, 'routes[0].state.routes[0].params.reportID', '');

        if (activeReportID === params.reportID) {
            if (state.type !== 'drawer') {
                navigationRef.current.dispatch(() => {
                    // If there are multiple routes then we can pop back to the first route
                    if (state.routes.length > 1) {
                        return StackActions.popToTop();
                    }

                    // Otherwise, we are already on the last page of a modal so just do nothing here as goBack() will navigate us
                    // back to the screen we were on before we opened the modal.
                    return StackActions.pop(0);
                });
                if (navigationRef.current.canGoBack()) {
                    navigationRef.current.goBack();
                }
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
