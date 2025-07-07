"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveWaypoint = saveWaypoint;
exports.removeWaypoint = removeWaypoint;
exports.getRoute = getRoute;
exports.updateWaypoints = updateWaypoints;
exports.clearError = clearError;
exports.markAsCash = markAsCash;
exports.dismissDuplicateTransactionViolation = dismissDuplicateTransactionViolation;
exports.getDraftTransactions = getDraftTransactions;
exports.generateTransactionID = generateTransactionID;
exports.setReviewDuplicatesKey = setReviewDuplicatesKey;
exports.abandonReviewDuplicateTransactions = abandonReviewDuplicateTransactions;
exports.openDraftDistanceExpense = openDraftDistanceExpense;
exports.getRecentWaypoints = getRecentWaypoints;
exports.sanitizeRecentWaypoints = sanitizeRecentWaypoints;
exports.getAllTransactionViolationsLength = getAllTransactionViolationsLength;
exports.getAllTransactions = getAllTransactions;
exports.getLastModifiedExpense = getLastModifiedExpense;
exports.revert = revert;
exports.changeTransactionsReport = changeTransactionsReport;
exports.setTransactionReport = setTransactionReport;
var date_fns_1 = require("date-fns");
var fast_equals_1 = require("fast-equals");
var clone_1 = require("lodash/clone");
var has_1 = require("lodash/has");
var react_native_onyx_1 = require("react-native-onyx");
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var CollectionUtils = require("@libs/CollectionUtils");
var DateUtils_1 = require("@libs/DateUtils");
var NumberUtils = require("@libs/NumberUtils");
var NumberUtils_1 = require("@libs/NumberUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var ViolationsUtils_1 = require("@libs/Violations/ViolationsUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var Category_1 = require("./Policy/Category");
var Tag_1 = require("./Policy/Tag");
var recentWaypoints = [];
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NVP_RECENT_WAYPOINTS,
    callback: function (val) { return (recentWaypoints = val !== null && val !== void 0 ? val : []); },
});
var currentUserEmail = '';
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.SESSION,
    callback: function (value) {
        var _a;
        currentUserEmail = (_a = value === null || value === void 0 ? void 0 : value.email) !== null && _a !== void 0 ? _a : '';
    },
});
var allTransactions = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.TRANSACTION,
    callback: function (transaction, key) {
        if (!key || !transaction) {
            return;
        }
        var transactionID = CollectionUtils.extractCollectionItemID(key);
        allTransactions[transactionID] = transaction;
    },
});
var allTransactionDrafts = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT,
    waitForCollectionCallback: true,
    callback: function (value) {
        allTransactionDrafts = value !== null && value !== void 0 ? value : {};
    },
});
var allReports = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: function (value) {
        if (!value) {
            return;
        }
        allReports = value;
    },
});
var allTransactionViolation = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS,
    callback: function (transactionViolation, key) {
        if (!key || !transactionViolation) {
            return;
        }
        var transactionID = CollectionUtils.extractCollectionItemID(key);
        allTransactionViolation[transactionID] = transactionViolation;
    },
});
var allTransactionViolations = [];
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS,
    callback: function (val) { return (allTransactionViolations = val !== null && val !== void 0 ? val : []); },
});
function saveWaypoint(transactionID, index, waypoint, isDraft) {
    var _a;
    if (isDraft === void 0) { isDraft = false; }
    react_native_onyx_1.default.merge("".concat(isDraft ? ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID), __assign(__assign({ comment: {
            waypoints: (_a = {},
                _a["waypoint".concat(index)] = waypoint,
                _a),
            customUnit: {
                quantity: null,
            },
        } }, (isDraft && { amount: CONST_1.default.IOU.DEFAULT_AMOUNT })), { 
        // Empty out errors when we're saving a new waypoint as this indicates the user is updating their input
        errorFields: {
            route: null,
        }, 
        // Clear the existing route so that we don't show an old route
        routes: {
            route0: {
                // Clear the existing distance to recalculate next time
                distance: null,
                geometry: {
                    coordinates: null,
                },
            },
        } }));
    // You can save offline waypoints without verifying the address (we will geocode it on the backend)
    // We're going to prevent saving those addresses in the recent waypoints though since they could be invalid addresses
    // However, in the backend once we verify the address, we will save the waypoint in the recent waypoints NVP
    if (!(0, has_1.default)(waypoint, 'lat') || !(0, has_1.default)(waypoint, 'lng')) {
        return;
    }
    // If current location is used, we would want to avoid saving it as a recent waypoint. This prevents the 'Your Location'
    // text from showing up in the address search suggestions
    if ((0, fast_equals_1.deepEqual)(waypoint === null || waypoint === void 0 ? void 0 : waypoint.address, CONST_1.default.YOUR_LOCATION_TEXT)) {
        return;
    }
    var recentWaypointAlreadyExists = recentWaypoints.find(function (recentWaypoint) { return (recentWaypoint === null || recentWaypoint === void 0 ? void 0 : recentWaypoint.address) === (waypoint === null || waypoint === void 0 ? void 0 : waypoint.address); });
    if (!recentWaypointAlreadyExists && waypoint !== null) {
        var clonedWaypoints = (0, clone_1.default)(recentWaypoints);
        var updatedWaypoint = __assign(__assign({}, waypoint), { pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD });
        clonedWaypoints.unshift(updatedWaypoint);
        react_native_onyx_1.default.merge(ONYXKEYS_1.default.NVP_RECENT_WAYPOINTS, clonedWaypoints.slice(0, CONST_1.default.RECENT_WAYPOINTS_NUMBER));
    }
}
function removeWaypoint(transaction, currentIndex, isDraft) {
    var _a, _b, _c, _d;
    // Index comes from the route params and is a string
    var index = Number(currentIndex);
    if (index === -1) {
        return Promise.resolve();
    }
    var existingWaypoints = (_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _a === void 0 ? void 0 : _a.waypoints) !== null && _b !== void 0 ? _b : {};
    var totalWaypoints = Object.keys(existingWaypoints).length;
    var waypointValues = Object.values(existingWaypoints);
    var removed = waypointValues.splice(index, 1);
    if (removed.length === 0) {
        return Promise.resolve();
    }
    var isRemovedWaypointEmpty = removed.length > 0 && !(0, TransactionUtils_1.waypointHasValidAddress)((_c = removed.at(0)) !== null && _c !== void 0 ? _c : {});
    // When there are only two waypoints we are adding empty waypoint back
    if (totalWaypoints === 2 && (index === 0 || index === totalWaypoints - 1)) {
        waypointValues.splice(index, 0, {});
    }
    var reIndexedWaypoints = {};
    waypointValues.forEach(function (waypoint, idx) {
        reIndexedWaypoints["waypoint".concat(idx)] = waypoint;
    });
    // Onyx.merge won't remove the null nested object values, this is a workaround
    // to remove nested keys while also preserving other object keys
    // Doing a deep clone of the transaction to avoid mutating the original object and running into a cache issue when using Onyx.set
    var newTransaction = __assign(__assign(__assign({}, transaction), { comment: __assign(__assign({}, transaction === null || transaction === void 0 ? void 0 : transaction.comment), { waypoints: reIndexedWaypoints, customUnit: __assign(__assign({}, (_d = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _d === void 0 ? void 0 : _d.customUnit), { quantity: null }) }) }), (isDraft && { amount: CONST_1.default.IOU.DEFAULT_AMOUNT }));
    if (!isRemovedWaypointEmpty) {
        newTransaction = __assign(__assign({}, newTransaction), { 
            // Clear any errors that may be present, which apply to the old route
            errorFields: {
                route: null,
            }, 
            // Clear the existing route so that we don't show an old route
            routes: {
                route0: {
                    // Clear the existing distance to recalculate next time
                    distance: null,
                    geometry: {
                        coordinates: null,
                    },
                },
            } });
    }
    if (isDraft) {
        return react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID), newTransaction);
    }
    return react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID), newTransaction);
}
function getOnyxDataForRouteRequest(transactionID, transactionState) {
    if (transactionState === void 0) { transactionState = CONST_1.default.TRANSACTION.STATE.CURRENT; }
    var keyPrefix;
    switch (transactionState) {
        case CONST_1.default.TRANSACTION.STATE.DRAFT:
            keyPrefix = ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT;
            break;
        case CONST_1.default.TRANSACTION.STATE.BACKUP:
            keyPrefix = ONYXKEYS_1.default.COLLECTION.TRANSACTION_BACKUP;
            break;
        case CONST_1.default.TRANSACTION.STATE.CURRENT:
        default:
            keyPrefix = ONYXKEYS_1.default.COLLECTION.TRANSACTION;
            break;
    }
    return {
        optimisticData: [
            {
                // Clears any potentially stale error messages from fetching the route
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(keyPrefix).concat(transactionID),
                value: {
                    comment: {
                        isLoading: true,
                    },
                    errorFields: {
                        route: null,
                    },
                },
            },
        ],
        // The route and failure are sent back via pusher in the BE, we are just clearing the loading state here
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(keyPrefix).concat(transactionID),
                value: __assign({ comment: {
                        isLoading: false,
                    } }, (transactionState === CONST_1.default.TRANSACTION.STATE.BACKUP && {
                    pendingFields: { waypoints: null },
                    pendingAction: null,
                })),
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(keyPrefix).concat(transactionID),
                value: {
                    comment: {
                        isLoading: false,
                    },
                },
            },
        ],
    };
}
/**
 * Sanitizes the waypoints by removing the pendingAction property.
 *
 * @param waypoints - The collection of waypoints to sanitize.
 * @returns The sanitized collection of waypoints.
 */
function sanitizeRecentWaypoints(waypoints) {
    return Object.entries(waypoints).reduce(function (acc, _a) {
        var key = _a[0], waypoint = _a[1];
        if ('pendingAction' in waypoint) {
            var pendingAction = waypoint.pendingAction, rest = __rest(waypoint, ["pendingAction"]);
            acc[key] = rest;
        }
        else {
            acc[key] = waypoint;
        }
        return acc;
    }, {});
}
/**
 * Gets the route for a set of waypoints
 * Used so we can generate a map view of the provided waypoints
 */
function getRoute(transactionID, waypoints, routeType) {
    if (routeType === void 0) { routeType = CONST_1.default.TRANSACTION.STATE.CURRENT; }
    var parameters = {
        transactionID: transactionID,
        waypoints: JSON.stringify(sanitizeRecentWaypoints(waypoints)),
    };
    var command;
    switch (routeType) {
        case CONST_1.default.TRANSACTION.STATE.DRAFT:
            command = types_1.READ_COMMANDS.GET_ROUTE_FOR_DRAFT;
            break;
        case CONST_1.default.TRANSACTION.STATE.CURRENT:
            command = types_1.READ_COMMANDS.GET_ROUTE;
            break;
        case CONST_1.default.TRANSACTION.STATE.BACKUP:
            command = types_1.READ_COMMANDS.GET_ROUTE_FOR_BACKUP;
            break;
        default:
            throw new Error('Invalid route type');
    }
    API.read(command, parameters, getOnyxDataForRouteRequest(transactionID, routeType));
}
/**
 * Updates all waypoints stored in the transaction specified by the provided transactionID.
 *
 * @param transactionID - The ID of the transaction to be updated
 * @param waypoints - An object containing all the waypoints
 *                             which will replace the existing ones.
 */
function updateWaypoints(transactionID, waypoints, isDraft) {
    if (isDraft === void 0) { isDraft = false; }
    return react_native_onyx_1.default.merge("".concat(isDraft ? ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID), __assign(__assign({ comment: {
            waypoints: waypoints,
            customUnit: {
                quantity: null,
            },
        } }, (isDraft && { amount: CONST_1.default.IOU.DEFAULT_AMOUNT })), { 
        // Empty out errors when we're saving new waypoints as this indicates the user is updating their input
        errorFields: {
            route: null,
        }, 
        // Clear the existing route so that we don't show an old route
        routes: {
            route0: {
                // Clear the existing distance to recalculate next time
                distance: null,
                geometry: {
                    coordinates: null,
                },
            },
        } }));
}
/**
 * Dismisses the duplicate transaction violation for the provided transactionIDs
 * and updates the transaction to include the dismissed violation in the comment.
 */
function dismissDuplicateTransactionViolation(transactionIDs, dismissedPersonalDetails) {
    var currentTransactionViolations = transactionIDs.map(function (id) { var _a; return ({ transactionID: id, violations: (_a = allTransactionViolation === null || allTransactionViolation === void 0 ? void 0 : allTransactionViolation[id]) !== null && _a !== void 0 ? _a : [] }); });
    var currentTransactions = transactionIDs.map(function (id) { return allTransactions === null || allTransactions === void 0 ? void 0 : allTransactions[id]; });
    var transactionsReportActions = currentTransactions.map(function (transaction) { return (0, ReportActionsUtils_1.getIOUActionForReportID)(transaction.reportID, transaction.transactionID); });
    var optimisticDismissedViolationReportActions = transactionsReportActions.map(function () {
        return (0, ReportUtils_1.buildOptimisticDismissedViolationReportAction)({ reason: 'manual', violationName: CONST_1.default.VIOLATIONS.DUPLICATED_TRANSACTION });
    });
    var optimisticData = [];
    var failureData = [];
    var optimisticReportActions = transactionsReportActions.map(function (action, index) {
        var _a;
        var optimisticDismissedViolationReportAction = optimisticDismissedViolationReportActions.at(index);
        return {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(action === null || action === void 0 ? void 0 : action.childReportID),
            value: optimisticDismissedViolationReportAction
                ? (_a = {},
                    _a[optimisticDismissedViolationReportAction.reportActionID] = optimisticDismissedViolationReportAction,
                    _a) : undefined,
        };
    });
    var optimisticDataTransactionViolations = currentTransactionViolations.map(function (transactionViolations) {
        var _a;
        return ({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transactionViolations.transactionID),
            value: (_a = transactionViolations.violations) === null || _a === void 0 ? void 0 : _a.filter(function (violation) { return violation.name !== CONST_1.default.VIOLATIONS.DUPLICATED_TRANSACTION; }),
        });
    });
    optimisticData.push.apply(optimisticData, optimisticDataTransactionViolations);
    optimisticData.push.apply(optimisticData, optimisticReportActions);
    var optimisticDataTransactions = currentTransactions.map(function (transaction) {
        var _a;
        var _b;
        return ({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transaction.transactionID),
            value: __assign(__assign({}, transaction), { comment: __assign(__assign({}, transaction.comment), { dismissedViolations: {
                        duplicatedTransaction: (_a = {},
                            _a[(_b = dismissedPersonalDetails.login) !== null && _b !== void 0 ? _b : ''] = (0, date_fns_1.getUnixTime)(new Date()),
                            _a),
                    } }) }),
        });
    });
    optimisticData.push.apply(optimisticData, optimisticDataTransactions);
    var failureDataTransactionViolations = currentTransactionViolations.map(function (transactionViolations) {
        var _a;
        return ({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transactionViolations.transactionID),
            value: (_a = transactionViolations.violations) === null || _a === void 0 ? void 0 : _a.map(function (violation) { return violation; }),
        });
    });
    var failureDataTransaction = currentTransactions.map(function (transaction) { return ({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transaction.transactionID),
        value: __assign({}, transaction),
    }); });
    var failureReportActions = transactionsReportActions.map(function (action, index) {
        var _a;
        var optimisticDismissedViolationReportAction = optimisticDismissedViolationReportActions.at(index);
        return {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(action === null || action === void 0 ? void 0 : action.childReportID),
            value: optimisticDismissedViolationReportAction
                ? (_a = {},
                    _a[optimisticDismissedViolationReportAction.reportActionID] = null,
                    _a) : undefined,
        };
    });
    failureData.push.apply(failureData, failureDataTransactionViolations);
    failureData.push.apply(failureData, failureDataTransaction);
    failureData.push.apply(failureData, failureReportActions);
    var successData = transactionsReportActions.map(function (action, index) {
        var _a;
        var optimisticDismissedViolationReportAction = optimisticDismissedViolationReportActions.at(index);
        return {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(action === null || action === void 0 ? void 0 : action.childReportID),
            value: optimisticDismissedViolationReportAction
                ? (_a = {},
                    _a[optimisticDismissedViolationReportAction.reportActionID] = null,
                    _a) : undefined,
        };
    });
    // We are creating duplicate resolved report actions for each duplicate transactions and all the report actions
    // should be correctly linked with their parent report but the BE is sometimes linking report actions to different
    // parent reports than the one we set optimistically, resulting in duplicate report actions. Therefore, we send the BE
    // random report action ids and onSuccessData we reset the report actions we added optimistically to avoid duplicate actions.
    var params = {
        name: CONST_1.default.VIOLATIONS.DUPLICATED_TRANSACTION,
        transactionIDList: transactionIDs.join(','),
        reportActionIDList: optimisticDismissedViolationReportActions.map(function () { return NumberUtils.rand64(); }).join(','),
    };
    API.write(types_1.WRITE_COMMANDS.DISMISS_VIOLATION, params, {
        optimisticData: optimisticData,
        successData: successData,
        failureData: failureData,
    });
}
function setReviewDuplicatesKey(values) {
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.REVIEW_DUPLICATES), __assign({}, values));
}
function abandonReviewDuplicateTransactions() {
    react_native_onyx_1.default.set(ONYXKEYS_1.default.REVIEW_DUPLICATES, null);
}
function clearError(transactionID) {
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID), { errors: null, errorFields: { route: null, waypoints: null, routes: null } });
}
function getLastModifiedExpense(reportID) {
    var modifiedExpenseActions = Object.values((0, ReportActionsUtils_1.getAllReportActions)(reportID)).filter(ReportActionsUtils_1.isModifiedExpenseAction);
    modifiedExpenseActions.sort(function (a, b) { return Number(a.reportActionID) - Number(b.reportActionID); });
    return (0, ReportActionsUtils_1.getOriginalMessage)(modifiedExpenseActions.at(-1));
}
function revert(transaction, originalMessage) {
    if (!transaction || !(originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.oldAmount) || !originalMessage.oldCurrency || !('amount' in originalMessage) || !('currency' in originalMessage)) {
        return;
    }
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transaction.transactionID), {
        modifiedAmount: (transaction === null || transaction === void 0 ? void 0 : transaction.amount) && (transaction === null || transaction === void 0 ? void 0 : transaction.amount) < 0 ? -Math.abs(originalMessage.oldAmount) : originalMessage.oldAmount,
        modifiedCurrency: originalMessage.oldCurrency,
    });
}
function markAsCash(transactionID, transactionThreadReportID) {
    var _a, _b;
    if (!transactionID || !transactionThreadReportID) {
        return;
    }
    var optimisticReportAction = (0, ReportUtils_1.buildOptimisticDismissedViolationReportAction)({
        reason: 'manual',
        violationName: CONST_1.default.VIOLATIONS.RTER,
    });
    var optimisticReportActions = (_a = {},
        _a[optimisticReportAction.reportActionID] = optimisticReportAction,
        _a);
    var onyxData = {
        optimisticData: [
            // Optimistically dismissing the violation, removing it from the list of violations
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transactionID),
                value: allTransactionViolations.filter(function (violation) { return violation.name !== CONST_1.default.VIOLATIONS.RTER; }),
            },
            // Optimistically adding the system message indicating we dismissed the violation
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(transactionThreadReportID),
                value: optimisticReportActions,
            },
        ],
        failureData: [
            // Rolling back the dismissal of the violation
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transactionID),
                value: allTransactionViolations,
            },
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(transactionThreadReportID),
                value: (_b = {},
                    _b[optimisticReportAction.reportActionID] = null,
                    _b),
            },
        ],
    };
    var parameters = {
        transactionID: transactionID,
        reportActionID: optimisticReportAction.reportActionID,
    };
    return API.write(types_1.WRITE_COMMANDS.MARK_AS_CASH, parameters, onyxData);
}
function openDraftDistanceExpense() {
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.SET,
                key: ONYXKEYS_1.default.NVP_RECENT_WAYPOINTS,
                // By optimistically setting the recent waypoints to an empty array, no further loading attempts will be made
                value: [],
            },
        ],
    };
    API.read(types_1.READ_COMMANDS.OPEN_DRAFT_DISTANCE_EXPENSE, null, onyxData);
}
function getRecentWaypoints() {
    return recentWaypoints;
}
function getAllTransactionViolationsLength() {
    return allTransactionViolations.length;
}
function getAllTransactions() {
    return Object.keys(allTransactions !== null && allTransactions !== void 0 ? allTransactions : {}).length;
}
/**
 * Returns a client generated 16 character hexadecimal value for the transactionID
 */
function generateTransactionID() {
    return NumberUtils.generateHexadecimalValue(16);
}
function setTransactionReport(transactionID, reportID, isDraft) {
    react_native_onyx_1.default.merge("".concat(isDraft ? ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID), { reportID: reportID });
}
function changeTransactionsReport(transactionIDs, reportID, policy) {
    var newReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID)];
    if (!newReport) {
        return;
    }
    var transactions = transactionIDs.map(function (id) { return allTransactions === null || allTransactions === void 0 ? void 0 : allTransactions[id]; }).filter(function (t) { return t !== undefined; });
    var transactionIDToReportActionAndThreadData = {};
    var updatedReportTotals = {};
    var optimisticData = [];
    var failureData = [];
    var successData = [];
    var transactionsMoved = false;
    transactions.forEach(function (transaction) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        var _r, _s, _t, _u, _v, _w;
        var isUnreported = !transaction.reportID || transaction.reportID === CONST_1.default.REPORT.UNREPORTED_REPORT_ID;
        // We'll handle optimistically creating the selfDM as part of https://github.com/Expensify/App/issues/60288
        var selfDMReportID = (_r = (0, ReportUtils_1.findSelfDMReportID)()) !== null && _r !== void 0 ? _r : CONST_1.default.REPORT.UNREPORTED_REPORT_ID;
        var oldIOUAction = (0, ReportActionsUtils_1.getIOUActionForReportID)(isUnreported ? selfDMReportID : transaction.reportID, transaction.transactionID);
        if (!transaction.reportID || transaction.reportID === reportID) {
            return;
        }
        transactionsMoved = true;
        var oldReportID = transaction.reportID;
        var oldReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(oldReportID)];
        // 1. Optimistically change the reportID on the passed transactions
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transaction.transactionID),
            value: {
                reportID: reportID,
            },
        });
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transaction.transactionID),
            value: {
                reportID: reportID,
            },
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transaction.transactionID),
            value: {
                reportID: transaction.reportID,
            },
        });
        // 2. Calculate transaction violations if moving transaction to a workspace
        if ((0, PolicyUtils_1.isPaidGroupPolicy)(policy) && (policy === null || policy === void 0 ? void 0 : policy.id)) {
            var policyTagList = (0, Tag_1.getPolicyTagsData)(policy.id);
            var violationData = ViolationsUtils_1.default.getViolationsOnyxData(transaction, allTransactionViolations, policy, policyTagList, (0, Category_1.getPolicyCategoriesData)(policy.id), (0, PolicyUtils_1.hasDependentTags)(policy, policyTagList), false);
            optimisticData.push(violationData);
            failureData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transaction.transactionID),
                value: allTransactionViolation === null || allTransactionViolation === void 0 ? void 0 : allTransactionViolation[transaction.transactionID],
            });
        }
        // 3. Keep track of the new report totals
        var transactionAmount = (0, TransactionUtils_1.getAmount)(transaction);
        if (oldReport) {
            updatedReportTotals[oldReportID] = (updatedReportTotals[oldReportID] ? updatedReportTotals[oldReportID] : ((_s = oldReport === null || oldReport === void 0 ? void 0 : oldReport.total) !== null && _s !== void 0 ? _s : 0)) + transactionAmount;
        }
        if (reportID) {
            updatedReportTotals[reportID] = (updatedReportTotals[reportID] ? updatedReportTotals[reportID] : ((_t = newReport.total) !== null && _t !== void 0 ? _t : 0)) - transactionAmount;
        }
        // 4. Optimistically update the IOU action reportID
        var optimisticMoneyRequestReportActionID = (0, NumberUtils_1.rand64)();
        var newIOUAction = __assign(__assign({}, oldIOUAction), { reportActionID: optimisticMoneyRequestReportActionID, pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD, actionName: (_u = oldIOUAction === null || oldIOUAction === void 0 ? void 0 : oldIOUAction.actionName) !== null && _u !== void 0 ? _u : CONST_1.default.REPORT.ACTIONS.TYPE.MOVED_TRANSACTION, created: (_v = oldIOUAction === null || oldIOUAction === void 0 ? void 0 : oldIOUAction.created) !== null && _v !== void 0 ? _v : DateUtils_1.default.getDBTime() });
        var trackExpenseActionableWhisper = isUnreported ? (0, ReportActionsUtils_1.getTrackExpenseActionableWhisper)(transaction.transactionID, selfDMReportID) : undefined;
        if (oldIOUAction) {
            optimisticData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
                value: (_a = {},
                    _a[newIOUAction.reportActionID] = newIOUAction,
                    _a),
            });
            optimisticData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(isUnreported ? selfDMReportID : oldReportID),
                value: __assign((_b = {}, _b[oldIOUAction.reportActionID] = {
                    previousMessage: oldIOUAction.message,
                    message: [
                        {
                            type: CONST_1.default.REPORT.MESSAGE.TYPE.COMMENT,
                            html: '',
                            text: '',
                            isEdited: true,
                            isDeletedParentAction: false,
                        },
                    ],
                    originalMessage: {
                        IOUTransactionID: null,
                    },
                    errors: undefined,
                }, _b), (trackExpenseActionableWhisper ? (_c = {}, _c[trackExpenseActionableWhisper.reportActionID] = null, _c) : {})),
            });
        }
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
            value: (_d = {},
                _d[newIOUAction.reportActionID] = { pendingAction: null },
                _d),
        });
        if (oldIOUAction) {
            failureData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
                value: (_e = {},
                    _e[newIOUAction.reportActionID] = null,
                    _e),
            }, {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(isUnreported ? selfDMReportID : oldReportID),
                value: __assign((_f = {}, _f[oldIOUAction.reportActionID] = oldIOUAction, _f), (trackExpenseActionableWhisper ? (_g = {}, _g[trackExpenseActionableWhisper.reportActionID] = trackExpenseActionableWhisper, _g) : {})),
            });
        }
        // 5. Optimistically update the transaction thread and all threads in the transaction thread
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(newIOUAction.childReportID),
            value: {
                parentReportID: reportID,
                parentReportActionID: optimisticMoneyRequestReportActionID,
                policyID: reportID !== CONST_1.default.REPORT.UNREPORTED_REPORT_ID ? newReport.policyID : CONST_1.default.POLICY.ID_FAKE,
            },
        });
        if (oldIOUAction) {
            failureData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(oldIOUAction.childReportID),
                value: {
                    parentReportID: isUnreported ? selfDMReportID : oldReportID,
                    optimisticMoneyRequestReportActionID: oldIOUAction.reportActionID,
                    policyID: (_w = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(oldIOUAction.reportActionID)]) === null || _w === void 0 ? void 0 : _w.policyID,
                },
            });
        }
        // 6. (Optional) Create transactionThread if it doesn't exist
        var transactionThreadReportID = newIOUAction.childReportID;
        var transactionThreadCreatedReportActionID;
        if (!transactionThreadReportID) {
            var optimisticTransactionThread = (0, ReportUtils_1.buildTransactionThread)(newIOUAction, newReport);
            var optimisticCreatedActionForTransactionThread = (0, ReportUtils_1.buildOptimisticCreatedReportAction)(currentUserEmail);
            transactionThreadReportID = optimisticTransactionThread.reportID;
            transactionThreadCreatedReportActionID = optimisticCreatedActionForTransactionThread.reportActionID;
            newIOUAction.childReportID = transactionThreadReportID;
            optimisticData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(optimisticTransactionThread.reportID),
                value: __assign(__assign({}, optimisticTransactionThread), { pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD }),
            }, {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(optimisticTransactionThread.reportID),
                value: (_h = {}, _h[optimisticCreatedActionForTransactionThread.reportActionID] = optimisticCreatedActionForTransactionThread, _h),
            }, {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
                value: (_j = {}, _j[newIOUAction.reportActionID] = { childReportID: optimisticTransactionThread.reportID }, _j),
            });
            successData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(optimisticTransactionThread.reportID),
                value: { pendingAction: null },
            }, {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(optimisticTransactionThread.reportID),
                value: (_k = {}, _k[optimisticCreatedActionForTransactionThread.reportActionID] = { pendingAction: null }, _k),
            });
            failureData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(optimisticTransactionThread.reportID),
                value: null,
            }, {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(optimisticTransactionThread.reportID),
                value: (_l = {}, _l[optimisticCreatedActionForTransactionThread.reportActionID] = null, _l),
            }, {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
                value: (_m = {}, _m[newIOUAction.reportActionID] = { childReportID: null }, _m),
            });
        }
        // 7. Add MOVED_TRANSACTION or UNREPORTED_TRANSACTION report actions
        var movedAction = reportID === CONST_1.default.REPORT.UNREPORTED_REPORT_ID
            ? (0, ReportUtils_1.buildOptimisticUnreportedTransactionAction)(transactionThreadReportID, transaction.reportID)
            : (0, ReportUtils_1.buildOptimisticMovedTransactionAction)(transactionThreadReportID, reportID);
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(transactionThreadReportID),
            value: (_o = {}, _o[movedAction === null || movedAction === void 0 ? void 0 : movedAction.reportActionID] = movedAction, _o),
        });
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(transactionThreadReportID),
            value: (_p = {}, _p[movedAction === null || movedAction === void 0 ? void 0 : movedAction.reportActionID] = { pendingAction: null }, _p),
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(transactionThreadReportID),
            value: (_q = {}, _q[movedAction === null || movedAction === void 0 ? void 0 : movedAction.reportActionID] = null, _q),
        });
        transactionIDToReportActionAndThreadData[transaction.transactionID] = __assign({ movedReportActionID: movedAction.reportActionID, moneyRequestPreviewReportActionID: newIOUAction.reportActionID }, (oldIOUAction && !oldIOUAction.childReportID
            ? {
                transactionThreadReportID: transactionThreadReportID,
                transactionThreadCreatedReportActionID: transactionThreadCreatedReportActionID,
            }
            : {}));
    });
    if (!transactionsMoved) {
        return;
    }
    // 8. Update the report totals
    Object.entries(updatedReportTotals).forEach(function (_a) {
        var _b;
        var reportIDToUpdate = _a[0], total = _a[1];
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportIDToUpdate),
            value: { total: total },
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportIDToUpdate),
            value: { total: (_b = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportIDToUpdate)]) === null || _b === void 0 ? void 0 : _b.total },
        });
    });
    var parameters = {
        transactionList: transactionIDs.join(','),
        reportID: reportID,
        transactionIDToReportActionAndThreadData: JSON.stringify(transactionIDToReportActionAndThreadData),
    };
    API.write(types_1.WRITE_COMMANDS.CHANGE_TRANSACTIONS_REPORT, parameters, {
        optimisticData: optimisticData,
        successData: successData,
        failureData: failureData,
    });
}
function getDraftTransactions() {
    return Object.values(allTransactionDrafts !== null && allTransactionDrafts !== void 0 ? allTransactionDrafts : {}).filter(function (transaction) { return !!transaction; });
}
