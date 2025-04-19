'use strict';
var __assign =
    (this && this.__assign) ||
    function () {
        __assign =
            Object.assign ||
            function (t) {
                for (var s, i = 1, n = arguments.length; i < n; i++) {
                    s = arguments[i];
                    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
                }
                return t;
            };
        return __assign.apply(this, arguments);
    };
exports.__esModule = true;
exports.enablePolicyFeatureCommand =
    exports.resolveEnableFeatureConflicts =
    exports.createUpdateCommentMatcher =
    exports.resolveEditCommentWithNewAddCommentRequest =
    exports.resolveCommentDeletionConflicts =
    exports.resolveOpenReportDuplicationConflictAction =
    exports.resolveDuplicationConflictAction =
        void 0;
var react_native_onyx_1 = require('react-native-onyx');
var types_1 = require('@libs/API/types');
var ONYXKEYS_1 = require('@src/ONYXKEYS');
var addNewMessage = new Set([types_1.WRITE_COMMANDS.ADD_COMMENT, types_1.WRITE_COMMANDS.ADD_ATTACHMENT, types_1.WRITE_COMMANDS.ADD_TEXT_AND_ATTACHMENT]);
var commentsToBeDeleted = new Set([
    types_1.WRITE_COMMANDS.ADD_COMMENT,
    types_1.WRITE_COMMANDS.ADD_ATTACHMENT,
    types_1.WRITE_COMMANDS.ADD_TEXT_AND_ATTACHMENT,
    types_1.WRITE_COMMANDS.UPDATE_COMMENT,
    types_1.WRITE_COMMANDS.ADD_EMOJI_REACTION,
    types_1.WRITE_COMMANDS.REMOVE_EMOJI_REACTION,
]);
var enablePolicyFeatureCommand = [
    types_1.WRITE_COMMANDS.ENABLE_POLICY_DISTANCE_RATES,
    types_1.WRITE_COMMANDS.ENABLE_POLICY_EXPENSIFY_CARDS,
    types_1.WRITE_COMMANDS.ENABLE_POLICY_COMPANY_CARDS,
    types_1.WRITE_COMMANDS.ENABLE_POLICY_CONNECTIONS,
    types_1.WRITE_COMMANDS.ENABLE_POLICY_CATEGORIES,
    types_1.WRITE_COMMANDS.ENABLE_POLICY_TAGS,
    types_1.WRITE_COMMANDS.ENABLE_POLICY_TAXES,
    types_1.WRITE_COMMANDS.ENABLE_POLICY_REPORT_FIELDS,
    types_1.WRITE_COMMANDS.ENABLE_POLICY_WORKFLOWS,
    types_1.WRITE_COMMANDS.SET_POLICY_RULES_ENABLED,
    types_1.WRITE_COMMANDS.ENABLE_POLICY_INVOICING,
];
exports.enablePolicyFeatureCommand = enablePolicyFeatureCommand;
function createUpdateCommentMatcher(reportActionID) {
    return function (request) {
        var _a;
        return request.command === types_1.WRITE_COMMANDS.UPDATE_COMMENT && ((_a = request.data) === null || _a === void 0 ? void 0 : _a.reportActionID) === reportActionID;
    };
}
exports.createUpdateCommentMatcher = createUpdateCommentMatcher;
/**
 * Determines the appropriate action for handling duplication conflicts in persisted requests.
 *
 * This method checks if any request in the list of persisted requests matches the criteria defined by the request matcher function.
 * - If no match is found, it suggests adding the request to the list, indicating a 'push' action.
 * - If a match is found, it suggests updating the existing entry, indicating a 'replace' action at the found index.
 */
function resolveDuplicationConflictAction(persistedRequests, requestMatcher) {
    var index = persistedRequests.findIndex(requestMatcher);
    if (index === -1) {
        return {
            conflictAction: {
                type: 'push',
            },
        };
    }
    return {
        conflictAction: {
            type: 'replace',
            index: index,
        },
    };
}
exports.resolveDuplicationConflictAction = resolveDuplicationConflictAction;
function resolveOpenReportDuplicationConflictAction(persistedRequests, parameters) {
    var _a, _b;
    for (var index = 0; index < persistedRequests.length; index++) {
        var request = persistedRequests.at(index);
        if (
            request &&
            request.command === types_1.WRITE_COMMANDS.OPEN_REPORT &&
            ((_a = request.data) === null || _a === void 0 ? void 0 : _a.reportID) === parameters.reportID &&
            ((_b = request.data) === null || _b === void 0 ? void 0 : _b.emailList) === parameters.emailList
        ) {
            // If the previous request had guided setup data, we can safely ignore the new request
            if (request.data.guidedSetupData) {
                return {
                    conflictAction: {
                        type: 'noAction',
                    },
                };
            }
            // In other cases it's safe to replace the previous request with the new one
            return {
                conflictAction: {
                    type: 'replace',
                    index: index,
                },
            };
        }
    }
    // If we didn't find any request to replace, we should push the new request
    return {
        conflictAction: {
            type: 'push',
        },
    };
}
exports.resolveOpenReportDuplicationConflictAction = resolveOpenReportDuplicationConflictAction;
function resolveCommentDeletionConflicts(persistedRequests, reportActionID, originalReportID) {
    var _a;
    var commentIndicesToDelete = [];
    var commentCouldBeThread = {};
    var addCommentFound = false;
    persistedRequests.forEach(function (request, index) {
        var _a, _b;
        // If the request will open a Thread, we should not delete the comment and we should send all the requests
        if (
            request.command === types_1.WRITE_COMMANDS.OPEN_REPORT &&
            ((_a = request.data) === null || _a === void 0 ? void 0 : _a.parentReportActionID) === reportActionID &&
            reportActionID in commentCouldBeThread
        ) {
            var indexToRemove = commentCouldBeThread[reportActionID];
            commentIndicesToDelete.splice(indexToRemove, 1);
            // The new message performs some changes in Onyx, we want to keep those changes.
            addCommentFound = false;
            return;
        }
        if (!commentsToBeDeleted.has(request.command) || ((_b = request.data) === null || _b === void 0 ? void 0 : _b.reportActionID) !== reportActionID) {
            return;
        }
        // If we find a new message, we probably want to remove it and not perform any request given that the server
        // doesn't know about it yet.
        if (addNewMessage.has(request.command) && !request.isRollbacked) {
            addCommentFound = true;
            commentCouldBeThread[reportActionID] = commentIndicesToDelete.length;
        }
        commentIndicesToDelete.push(index);
    });
    if (commentIndicesToDelete.length === 0) {
        return {
            conflictAction: {
                type: 'push',
            },
        };
    }
    if (addCommentFound) {
        // The new message performs some changes in Onyx, so we need to rollback those changes.
        var rollbackData = [
            {
                onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
                key: '' + ONYXKEYS_1['default'].COLLECTION.REPORT_ACTIONS + originalReportID,
                value: ((_a = {}), (_a[reportActionID] = null), _a),
            },
        ];
        react_native_onyx_1['default'].update(rollbackData);
    }
    return {
        conflictAction: {
            type: 'delete',
            indices: commentIndicesToDelete,
            pushNewRequest: !addCommentFound,
        },
    };
}
exports.resolveCommentDeletionConflicts = resolveCommentDeletionConflicts;
function resolveEditCommentWithNewAddCommentRequest(persistedRequests, parameters, reportActionID, addCommentIndex) {
    var indicesToDelete = [];
    persistedRequests.forEach(function (request, index) {
        var _a;
        if (request.command !== types_1.WRITE_COMMANDS.UPDATE_COMMENT || ((_a = request.data) === null || _a === void 0 ? void 0 : _a.reportActionID) !== reportActionID) {
            return;
        }
        indicesToDelete.push(index);
    });
    var currentAddComment = persistedRequests.at(addCommentIndex);
    var nextAction = null;
    if (currentAddComment) {
        currentAddComment.data = __assign(__assign({}, currentAddComment.data), parameters);
        nextAction = {
            type: 'replace',
            index: addCommentIndex,
            request: currentAddComment,
        };
        if (indicesToDelete.length === 0) {
            return {
                conflictAction: nextAction,
            };
        }
    }
    return {
        conflictAction: {
            type: 'delete',
            indices: indicesToDelete,
            pushNewRequest: false,
            nextAction: nextAction,
        },
    };
}
exports.resolveEditCommentWithNewAddCommentRequest = resolveEditCommentWithNewAddCommentRequest;
function resolveEnableFeatureConflicts(command, persistedRequests, parameters) {
    var deleteRequestIndex = persistedRequests.findIndex(function (request) {
        var _a, _b;
        return (
            request.command === command &&
            ((_a = request.data) === null || _a === void 0 ? void 0 : _a.policyID) === parameters.policyID &&
            ((_b = request.data) === null || _b === void 0 ? void 0 : _b.enabled) !== parameters.enabled
        );
    });
    if (deleteRequestIndex === -1) {
        return {
            conflictAction: {
                type: 'push',
            },
        };
    }
    return {
        conflictAction: {
            type: 'delete',
            indices: [deleteRequestIndex],
            pushNewRequest: false,
        },
    };
}
exports.resolveEnableFeatureConflicts = resolveEnableFeatureConflicts;
