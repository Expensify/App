
exports.__esModule = true;
const native_1 = require('@react-navigation/native');
const NAVIGATORS_1 = require('@src/NAVIGATORS');
const isNavigatorName_1 = require('./isNavigatorName');
// This function adds the policyID param to the url.
const customGetPathFromState = function (state, options) {
    const path = native_1.getPathFromState(state, options);
    const fullScreenRoute = state.routes.findLast(function (route) {
        return isNavigatorName_1.isFullScreenName(route.name);
    });
    const shouldAddPolicyID = (fullScreenRoute === null || fullScreenRoute === void 0 ? void 0 : fullScreenRoute.name) === NAVIGATORS_1['default'].REPORTS_SPLIT_NAVIGATOR;
    if (!shouldAddPolicyID) {
        return path;
    }
    const policyID = fullScreenRoute.params && 'policyID' in fullScreenRoute.params ? fullScreenRoute.params.policyID : undefined;
    return `${  policyID ? `/w/${  policyID}` : ''  }${path}`;
};
exports['default'] = customGetPathFromState;
