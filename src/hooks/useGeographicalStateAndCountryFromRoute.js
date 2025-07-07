"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = useGeographicalStateAndCountryFromRoute;
var native_1 = require("@react-navigation/native");
var expensify_common_1 = require("expensify-common");
var CONST_1 = require("@src/CONST");
/**
 * Extracts the 'state' and 'country' query parameters from the route/ url and validates it against COMMON_CONST.STATES and CONST.ALL_COUNTRIES.
 * Example 1: Url: https://new.expensify.com/settings/profile/address?state=MO Returns: state=MO
 * Example 2: Url: https://new.expensify.com/settings/profile/address?state=ASDF Returns: state=undefined
 * Example 3: Url: https://new.expensify.com/settings/profile/address Returns: state=undefined
 * Example 4: Url: https://new.expensify.com/settings/profile/address?state=MO-hash-a12341 Returns: state=MO
 * Similarly for country parameter.
 */
function useGeographicalStateAndCountryFromRoute(stateParamName, countryParamName) {
    var _a;
    if (stateParamName === void 0) { stateParamName = 'state'; }
    if (countryParamName === void 0) { countryParamName = 'country'; }
    var routeParams = (0, native_1.useRoute)().params;
    var stateFromUrlTemp = routeParams === null || routeParams === void 0 ? void 0 : routeParams[stateParamName];
    var countryFromUrlTemp = routeParams === null || routeParams === void 0 ? void 0 : routeParams[countryParamName];
    return {
        state: (_a = expensify_common_1.CONST.STATES[stateFromUrlTemp]) === null || _a === void 0 ? void 0 : _a.stateISO,
        country: Object.keys(CONST_1.default.ALL_COUNTRIES).find(function (country) { return country === countryFromUrlTemp; }),
    };
}
