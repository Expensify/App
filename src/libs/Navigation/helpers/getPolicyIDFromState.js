'use strict';
exports.__esModule = true;
var NAVIGATORS_1 = require('@src/NAVIGATORS');
var SCREENS_1 = require('@src/SCREENS');
var extractPolicyIDFromQuery_1 = require('./extractPolicyIDFromQuery');
/**
 * returns policyID value if one exists in navigation state
 *
 * PolicyID in this app can be stored in two ways:
 *  - on NAVIGATORS.REPORTS_SPLIT_NAVIGATOR as `policyID` param
 *  - on Search related screens as policyID filter inside `q` (SearchQuery) param (only for Search_Root)
 */
var getPolicyIDFromState = function (state) {
    var _a, _b, _c, _d;
    var lastPolicyRoute =
        (_a = state === null || state === void 0 ? void 0 : state.routes) === null || _a === void 0
            ? void 0
            : _a.findLast(function (route) {
                  return route.name === NAVIGATORS_1['default'].REPORTS_SPLIT_NAVIGATOR || route.name === NAVIGATORS_1['default'].SEARCH_FULLSCREEN_NAVIGATOR;
              });
    if ((lastPolicyRoute === null || lastPolicyRoute === void 0 ? void 0 : lastPolicyRoute.params) && 'policyID' in lastPolicyRoute.params) {
        return (_b = lastPolicyRoute === null || lastPolicyRoute === void 0 ? void 0 : lastPolicyRoute.params) === null || _b === void 0 ? void 0 : _b.policyID;
    }
    // Handle SEARCH navigator
    var lastSearchRoute =
        (_d = (_c = lastPolicyRoute === null || lastPolicyRoute === void 0 ? void 0 : lastPolicyRoute.state) === null || _c === void 0 ? void 0 : _c.routes) === null || _d === void 0
            ? void 0
            : _d.findLast(function (route) {
                  return route.name === SCREENS_1['default'].SEARCH.ROOT;
              });
    if (lastSearchRoute) {
        return extractPolicyIDFromQuery_1['default'](lastSearchRoute);
    }
    return undefined;
};
exports['default'] = getPolicyIDFromState;
