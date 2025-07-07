"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = useFetchRoute;
var fast_equals_1 = require("fast-equals");
var react_1 = require("react");
var Transaction_1 = require("@libs/actions/Transaction");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var CONST_1 = require("@src/CONST");
var useNetwork_1 = require("./useNetwork");
var usePrevious_1 = require("./usePrevious");
function useFetchRoute(transaction, waypoints, action, transactionState) {
    var _a, _b, _c;
    if (transactionState === void 0) { transactionState = CONST_1.default.TRANSACTION.STATE.CURRENT; }
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var hasRouteError = !!((_a = transaction === null || transaction === void 0 ? void 0 : transaction.errorFields) === null || _a === void 0 ? void 0 : _a.route);
    var hasRoute = (0, TransactionUtils_1.hasRoute)(transaction);
    var isRouteAbsentWithoutErrors = !hasRoute && !hasRouteError;
    var isLoadingRoute = (_c = (_b = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _b === void 0 ? void 0 : _b.isLoading) !== null && _c !== void 0 ? _c : false;
    var validatedWaypoints = (0, TransactionUtils_1.getValidWaypoints)(waypoints);
    var previousValidatedWaypoints = (0, usePrevious_1.default)(validatedWaypoints);
    var haveValidatedWaypointsChanged = !(0, fast_equals_1.deepEqual)(previousValidatedWaypoints, validatedWaypoints);
    var isDistanceRequest = (0, TransactionUtils_1.isDistanceRequest)(transaction);
    var shouldFetchRoute = isDistanceRequest && (isRouteAbsentWithoutErrors || haveValidatedWaypointsChanged) && !isLoadingRoute && Object.keys(validatedWaypoints).length > 1;
    (0, react_1.useEffect)(function () {
        if (isOffline || !shouldFetchRoute || !(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID)) {
            return;
        }
        (0, Transaction_1.getRoute)(transaction.transactionID, validatedWaypoints, transactionState);
    }, [shouldFetchRoute, transaction === null || transaction === void 0 ? void 0 : transaction.transactionID, validatedWaypoints, isOffline, action, transactionState]);
    return { shouldFetchRoute: shouldFetchRoute, validatedWaypoints: validatedWaypoints };
}
