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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeMembers = removeMembers;
exports.buildUpdateWorkspaceMembersRoleOnyxData = buildUpdateWorkspaceMembersRoleOnyxData;
exports.updateWorkspaceMembersRole = updateWorkspaceMembersRole;
exports.requestWorkspaceOwnerChange = requestWorkspaceOwnerChange;
exports.clearWorkspaceOwnerChangeFlow = clearWorkspaceOwnerChangeFlow;
exports.buildAddMembersToWorkspaceOnyxData = buildAddMembersToWorkspaceOnyxData;
exports.addMembersToWorkspace = addMembersToWorkspace;
exports.clearDeleteMemberError = clearDeleteMemberError;
exports.clearAddMemberError = clearAddMemberError;
exports.openWorkspaceMembersPage = openWorkspaceMembersPage;
exports.setWorkspaceInviteMembersDraft = setWorkspaceInviteMembersDraft;
exports.inviteMemberToWorkspace = inviteMemberToWorkspace;
exports.joinAccessiblePolicy = joinAccessiblePolicy;
exports.askToJoinPolicy = askToJoinPolicy;
exports.acceptJoinRequest = acceptJoinRequest;
exports.declineJoinRequest = declineJoinRequest;
exports.isApprover = isApprover;
exports.importPolicyMembers = importPolicyMembers;
exports.downloadMembersCSV = downloadMembersCSV;
exports.clearInviteDraft = clearInviteDraft;
exports.buildRoomMembersOnyxData = buildRoomMembersOnyxData;
exports.openPolicyMemberProfilePage = openPolicyMemberProfilePage;
exports.setWorkspaceInviteRoleDraft = setWorkspaceInviteRoleDraft;
exports.clearWorkspaceInviteRoleDraft = clearWorkspaceInviteRoleDraft;
var react_native_onyx_1 = require("react-native-onyx");
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var ApiUtils = require("@libs/ApiUtils");
var DateUtils_1 = require("@libs/DateUtils");
var ErrorUtils = require("@libs/ErrorUtils");
var fileDownload_1 = require("@libs/fileDownload");
var Localize_1 = require("@libs/Localize");
var Log_1 = require("@libs/Log");
var enhanceParameters_1 = require("@libs/Network/enhanceParameters");
var Parser_1 = require("@libs/Parser");
var PersonalDetailsUtils = require("@libs/PersonalDetailsUtils");
var PhoneNumber = require("@libs/PhoneNumber");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportActionsUtils = require("@libs/ReportActionsUtils");
var ReportUtils = require("@libs/ReportUtils");
var FormActions = require("@userActions/FormActions");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var Policy_1 = require("./Policy");
var allPolicies = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.POLICY,
    callback: function (val, key) {
        if (!key) {
            return;
        }
        if (val === null || val === undefined) {
            // If we are deleting a policy, we have to check every report linked to that policy
            // and unset the draft indicator (pencil icon) alongside removing any draft comments. Clearing these values will keep the newly archived chats from being displayed in the LHN.
            // More info: https://github.com/Expensify/App/issues/14260
            var policyID = key.replace(ONYXKEYS_1.default.COLLECTION.POLICY, '');
            var policyReports = ReportUtils.getAllPolicyReports(policyID);
            var cleanUpMergeQueries = {};
            var cleanUpSetQueries_1 = {};
            policyReports.forEach(function (policyReport) {
                if (!policyReport) {
                    return;
                }
                var reportID = policyReport.reportID;
                cleanUpSetQueries_1["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_DRAFT_COMMENT).concat(reportID)] = null;
                cleanUpSetQueries_1["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS_DRAFTS).concat(reportID)] = null;
            });
            react_native_onyx_1.default.mergeCollection(ONYXKEYS_1.default.COLLECTION.REPORT, cleanUpMergeQueries);
            react_native_onyx_1.default.multiSet(cleanUpSetQueries_1);
            delete allPolicies[key];
            return;
        }
        allPolicies[key] = val;
    },
});
var allReportActions;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS,
    waitForCollectionCallback: true,
    callback: function (actions) { return (allReportActions = actions); },
});
var sessionEmail = '';
var sessionAccountID = 0;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.SESSION,
    callback: function (val) {
        var _a, _b;
        sessionEmail = (_a = val === null || val === void 0 ? void 0 : val.email) !== null && _a !== void 0 ? _a : '';
        sessionAccountID = (_b = val === null || val === void 0 ? void 0 : val.accountID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID;
    },
});
var allPersonalDetails;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.PERSONAL_DETAILS_LIST,
    callback: function (val) { return (allPersonalDetails = val); },
});
var policyOwnershipChecks;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.POLICY_OWNERSHIP_CHANGE_CHECKS,
    callback: function (value) {
        policyOwnershipChecks = value !== null && value !== void 0 ? value : {};
    },
});
/** Check if the passed employee is an approver in the policy's employeeList */
function isApprover(policy, employeeAccountID) {
    var _a, _b;
    var employeeLogin = (_a = allPersonalDetails === null || allPersonalDetails === void 0 ? void 0 : allPersonalDetails[employeeAccountID]) === null || _a === void 0 ? void 0 : _a.login;
    if ((policy === null || policy === void 0 ? void 0 : policy.approver) === employeeLogin) {
        return true;
    }
    return Object.values((_b = policy === null || policy === void 0 ? void 0 : policy.employeeList) !== null && _b !== void 0 ? _b : {}).some(function (employee) { return (employee === null || employee === void 0 ? void 0 : employee.submitsTo) === employeeLogin || (employee === null || employee === void 0 ? void 0 : employee.forwardsTo) === employeeLogin || (employee === null || employee === void 0 ? void 0 : employee.overLimitForwardsTo) === employeeLogin; });
}
/**
 * Returns the policy of the report
 * @deprecated Get the data straight from Onyx - This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
 */
function getPolicy(policyID) {
    if (!allPolicies || !policyID) {
        return undefined;
    }
    return allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID)];
}
/**
 * Build optimistic data for adding members to the announcement/admins room
 */
function buildRoomMembersOnyxData(roomType, policyID, accountIDs) {
    var _a, _b, _c, _d;
    var report = ReportUtils.getRoom(roomType, policyID);
    var reportMetadata = ReportUtils.getReportMetadata(report === null || report === void 0 ? void 0 : report.reportID);
    var roomMembers = {
        optimisticData: [],
        failureData: [],
        successData: [],
    };
    if (!report || accountIDs.length === 0) {
        return roomMembers;
    }
    var participantAccountIDs = __spreadArray(__spreadArray([], Object.keys((_a = report.participants) !== null && _a !== void 0 ? _a : {}).map(Number), true), accountIDs, true);
    var pendingChatMembers = ReportUtils.getPendingChatMembers(accountIDs, (_b = reportMetadata === null || reportMetadata === void 0 ? void 0 : reportMetadata.pendingChatMembers) !== null && _b !== void 0 ? _b : [], CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD);
    roomMembers.optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report === null || report === void 0 ? void 0 : report.reportID),
        value: {
            participants: ReportUtils.buildParticipantsFromAccountIDs(participantAccountIDs),
        },
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(report === null || report === void 0 ? void 0 : report.reportID),
        value: {
            pendingChatMembers: pendingChatMembers,
        },
    });
    roomMembers.failureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report === null || report === void 0 ? void 0 : report.reportID),
        value: {
            participants: accountIDs.reduce(function (acc, curr) {
                var _a;
                Object.assign(acc, (_a = {}, _a[curr] = null, _a));
                return acc;
            }, {}),
        },
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(report === null || report === void 0 ? void 0 : report.reportID),
        value: {
            pendingChatMembers: (_c = reportMetadata === null || reportMetadata === void 0 ? void 0 : reportMetadata.pendingChatMembers) !== null && _c !== void 0 ? _c : null,
        },
    });
    roomMembers.successData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(report === null || report === void 0 ? void 0 : report.reportID),
        value: {
            pendingChatMembers: (_d = reportMetadata === null || reportMetadata === void 0 ? void 0 : reportMetadata.pendingChatMembers) !== null && _d !== void 0 ? _d : null,
        },
    });
    return roomMembers;
}
/**
 * Updates the import spreadsheet data according to the result of the import
 */
function updateImportSpreadsheetData(addedMembersLength, updatedMembersLength) {
    var onyxData = {
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.IMPORTED_SPREADSHEET,
                value: {
                    shouldFinalModalBeOpened: true,
                    importFinalModal: {
                        title: (0, Localize_1.translateLocal)('spreadsheet.importSuccessfulTitle'),
                        prompt: (0, Localize_1.translateLocal)('spreadsheet.importMembersSuccessfulDescription', { added: addedMembersLength, updated: updatedMembersLength }),
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.IMPORTED_SPREADSHEET,
                value: {
                    shouldFinalModalBeOpened: true,
                    importFinalModal: { title: (0, Localize_1.translateLocal)('spreadsheet.importFailedTitle'), prompt: (0, Localize_1.translateLocal)('spreadsheet.importFailedDescription') },
                },
            },
        ],
    };
    return onyxData;
}
/**
 * Build optimistic data for removing users from the announcement/admins room
 */
function removeOptimisticRoomMembers(roomType, policyID, policyName, accountIDs) {
    var _a, _b, _c;
    var roomMembers = {
        optimisticData: [],
        failureData: [],
        successData: [],
    };
    if (!policyID) {
        return roomMembers;
    }
    var report = ReportUtils.getRoom(roomType, policyID);
    var reportMetadata = ReportUtils.getReportMetadata(report === null || report === void 0 ? void 0 : report.reportID);
    if (!report) {
        return roomMembers;
    }
    var pendingChatMembers = ReportUtils.getPendingChatMembers(accountIDs, (_a = reportMetadata === null || reportMetadata === void 0 ? void 0 : reportMetadata.pendingChatMembers) !== null && _a !== void 0 ? _a : [], CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    roomMembers.optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID),
        value: __assign({}, (accountIDs.includes(sessionAccountID)
            ? {
                statusNum: CONST_1.default.REPORT.STATUS_NUM.CLOSED,
                stateNum: CONST_1.default.REPORT.STATE_NUM.APPROVED,
                oldPolicyName: policyName,
            }
            : {})),
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(report.reportID),
        value: {
            pendingChatMembers: pendingChatMembers,
        },
    });
    roomMembers.failureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID),
        value: __assign({}, (accountIDs.includes(sessionAccountID)
            ? {
                statusNum: report.statusNum,
                stateNum: report.stateNum,
                oldPolicyName: report.oldPolicyName,
            }
            : {})),
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(report.reportID),
        value: {
            pendingChatMembers: (_b = reportMetadata === null || reportMetadata === void 0 ? void 0 : reportMetadata.pendingChatMembers) !== null && _b !== void 0 ? _b : null,
        },
    });
    roomMembers.successData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(report.reportID),
        value: {
            pendingChatMembers: (_c = reportMetadata === null || reportMetadata === void 0 ? void 0 : reportMetadata.pendingChatMembers) !== null && _c !== void 0 ? _c : null,
        },
    });
    return roomMembers;
}
/**
 * This function will reset the preferred exporter to the owner of the workspace
 * if the current preferred exporter is removed from the admin role.
 * @param [policyID] The id of the policy.
 * @param [loginList] The logins of the users whose roles are being updated to non-admin role or are removed from a workspace
 */
function resetAccountingPreferredExporter(policyID, loginList) {
    var _a, _b, _c, _d, _e, _f;
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    var owner = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.owner) !== null && _a !== void 0 ? _a : ReportUtils.getPersonalDetailsForAccountID(policy === null || policy === void 0 ? void 0 : policy.ownerAccountID).login) !== null && _b !== void 0 ? _b : '';
    var optimisticData = [];
    var successData = [];
    var failureData = [];
    var policyKey = "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID);
    var adminLoginList = loginList.filter(function (login) { return (0, PolicyUtils_1.isUserPolicyAdmin)(policy, login); });
    var connections = [CONST_1.default.POLICY.CONNECTIONS.NAME.XERO, CONST_1.default.POLICY.CONNECTIONS.NAME.QBO, CONST_1.default.POLICY.CONNECTIONS.NAME.SAGE_INTACCT, CONST_1.default.POLICY.CONNECTIONS.NAME.QBD];
    if (!adminLoginList.length) {
        return { optimisticData: optimisticData, successData: successData, failureData: failureData };
    }
    connections.forEach(function (connection) {
        var _a, _b, _c, _d, _e, _f;
        var _g, _h, _j, _k;
        var exporter = (_h = (_g = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _g === void 0 ? void 0 : _g[connection]) === null || _h === void 0 ? void 0 : _h.config.export.exporter;
        if (!exporter || !adminLoginList.includes(exporter)) {
            return;
        }
        var pendingFieldKey = connection === CONST_1.default.POLICY.CONNECTIONS.NAME.QBO ? CONST_1.default.QUICKBOOKS_CONFIG.EXPORT : CONST_1.default.QUICKBOOKS_CONFIG.EXPORTER;
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: policyKey,
            value: {
                connections: (_a = {},
                    _a[connection] = {
                        config: {
                            export: { exporter: owner },
                            pendingFields: (_b = {}, _b[pendingFieldKey] = CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE, _b),
                        },
                    },
                    _a),
            },
        });
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: policyKey,
            value: {
                connections: (_c = {}, _c[connection] = { config: { pendingFields: (_d = {}, _d[pendingFieldKey] = null, _d) } }, _c),
            },
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: policyKey,
            value: {
                connections: (_e = {},
                    _e[connection] = {
                        config: {
                            export: { exporter: (_k = (_j = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _j === void 0 ? void 0 : _j[connection]) === null || _k === void 0 ? void 0 : _k.config.export.exporter },
                            pendingFields: (_f = {}, _f[pendingFieldKey] = null, _f),
                        },
                    },
                    _e),
            },
        });
    });
    var exporter = (_d = (_c = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _c === void 0 ? void 0 : _c.netsuite) === null || _d === void 0 ? void 0 : _d.options.config.exporter;
    if (exporter && adminLoginList.includes(exporter)) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: policyKey,
            value: {
                connections: { netsuite: { options: { config: { exporter: owner, pendingFields: { exporter: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE } } } } },
            },
        });
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: policyKey,
            value: {
                connections: { netsuite: { options: { config: { pendingFields: { exporter: null } } } } },
            },
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: policyKey,
            value: { connections: { netsuite: { options: { config: { exporter: (_f = (_e = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _e === void 0 ? void 0 : _e.netsuite) === null || _f === void 0 ? void 0 : _f.options.config.exporter, pendingFields: { exporter: null } } } } } },
        });
    }
    return { optimisticData: optimisticData, successData: successData, failureData: failureData };
}
/**
 * Remove the passed members from the policy employeeList
 * Please see https://github.com/Expensify/App/blob/main/README.md#Security for more details
 */
function removeMembers(accountIDs, policyID) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    // In case user selects only themselves (admin), their email will be filtered out and the members
    // array passed will be empty, prevent the function from proceeding in that case as there is no one to remove
    if (accountIDs.length === 0) {
        return;
    }
    var policyKey = "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID);
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    var workspaceChats = ReportUtils.getWorkspaceChats(policyID, accountIDs);
    var emailList = accountIDs.map(function (accountID) { var _a; return (_a = allPersonalDetails === null || allPersonalDetails === void 0 ? void 0 : allPersonalDetails[accountID]) === null || _a === void 0 ? void 0 : _a.login; }).filter(function (login) { return !!login; });
    var optimisticClosedReportActions = workspaceChats.map(function () { var _a; return ReportUtils.buildOptimisticClosedReportAction(sessionEmail, (_a = policy === null || policy === void 0 ? void 0 : policy.name) !== null && _a !== void 0 ? _a : '', CONST_1.default.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY); });
    var announceRoomMembers = removeOptimisticRoomMembers(CONST_1.default.REPORT.CHAT_TYPE.POLICY_ANNOUNCE, policy === null || policy === void 0 ? void 0 : policy.id, (_a = policy === null || policy === void 0 ? void 0 : policy.name) !== null && _a !== void 0 ? _a : '', accountIDs);
    var adminRoomMembers = removeOptimisticRoomMembers(CONST_1.default.REPORT.CHAT_TYPE.POLICY_ADMINS, policy === null || policy === void 0 ? void 0 : policy.id, (_b = policy === null || policy === void 0 ? void 0 : policy.name) !== null && _b !== void 0 ? _b : '', accountIDs.filter(function (accountID) {
        var _a, _b, _c;
        var login = (_a = allPersonalDetails === null || allPersonalDetails === void 0 ? void 0 : allPersonalDetails[accountID]) === null || _a === void 0 ? void 0 : _a.login;
        var role = login ? (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.employeeList) === null || _b === void 0 ? void 0 : _b[login]) === null || _c === void 0 ? void 0 : _c.role : '';
        return role === CONST_1.default.POLICY.ROLE.ADMIN || role === CONST_1.default.POLICY.ROLE.AUDITOR;
    }));
    var preferredExporterOnyxData = resetAccountingPreferredExporter(policyID, emailList);
    var optimisticMembersState = {};
    var successMembersState = {};
    var failureMembersState = {};
    emailList.forEach(function (email) {
        optimisticMembersState[email] = { pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE };
        successMembersState[email] = null;
        failureMembersState[email] = { errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.people.error.genericRemove') };
    });
    Object.keys((_c = policy === null || policy === void 0 ? void 0 : policy.employeeList) !== null && _c !== void 0 ? _c : {}).forEach(function (employeeEmail) {
        var _a, _b, _c;
        var employee = (_a = policy === null || policy === void 0 ? void 0 : policy.employeeList) === null || _a === void 0 ? void 0 : _a[employeeEmail];
        optimisticMembersState[employeeEmail] = (_b = optimisticMembersState[employeeEmail]) !== null && _b !== void 0 ? _b : {};
        failureMembersState[employeeEmail] = (_c = failureMembersState[employeeEmail]) !== null && _c !== void 0 ? _c : {};
        if ((employee === null || employee === void 0 ? void 0 : employee.submitsTo) && emailList.includes(employee === null || employee === void 0 ? void 0 : employee.submitsTo)) {
            optimisticMembersState[employeeEmail] = __assign(__assign({}, optimisticMembersState[employeeEmail]), { submitsTo: policy === null || policy === void 0 ? void 0 : policy.owner });
            failureMembersState[employeeEmail] = __assign(__assign({}, failureMembersState[employeeEmail]), { submitsTo: employee === null || employee === void 0 ? void 0 : employee.submitsTo });
        }
        if ((employee === null || employee === void 0 ? void 0 : employee.forwardsTo) && emailList.includes(employee === null || employee === void 0 ? void 0 : employee.forwardsTo)) {
            optimisticMembersState[employeeEmail] = __assign(__assign({}, optimisticMembersState[employeeEmail]), { forwardsTo: policy === null || policy === void 0 ? void 0 : policy.owner });
            failureMembersState[employeeEmail] = __assign(__assign({}, failureMembersState[employeeEmail]), { forwardsTo: employee === null || employee === void 0 ? void 0 : employee.forwardsTo });
        }
        if ((employee === null || employee === void 0 ? void 0 : employee.overLimitForwardsTo) && emailList.includes(employee === null || employee === void 0 ? void 0 : employee.overLimitForwardsTo)) {
            optimisticMembersState[employeeEmail] = __assign(__assign({}, optimisticMembersState[employeeEmail]), { overLimitForwardsTo: policy === null || policy === void 0 ? void 0 : policy.owner });
            failureMembersState[employeeEmail] = __assign(__assign({}, failureMembersState[employeeEmail]), { overLimitForwardsTo: employee === null || employee === void 0 ? void 0 : employee.overLimitForwardsTo });
        }
    });
    var approvalRules = (_e = (_d = policy === null || policy === void 0 ? void 0 : policy.rules) === null || _d === void 0 ? void 0 : _d.approvalRules) !== null && _e !== void 0 ? _e : [];
    var optimisticApprovalRules = approvalRules.filter(function (rule) { var _a; return !emailList.includes((_a = rule === null || rule === void 0 ? void 0 : rule.approver) !== null && _a !== void 0 ? _a : ''); });
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: policyKey,
            value: {
                employeeList: optimisticMembersState,
                approver: emailList.includes((_f = policy === null || policy === void 0 ? void 0 : policy.approver) !== null && _f !== void 0 ? _f : '') ? policy === null || policy === void 0 ? void 0 : policy.owner : policy === null || policy === void 0 ? void 0 : policy.approver,
                rules: __assign(__assign({}, ((_g = policy === null || policy === void 0 ? void 0 : policy.rules) !== null && _g !== void 0 ? _g : {})), { approvalRules: optimisticApprovalRules }),
            },
        },
    ];
    optimisticData.push.apply(optimisticData, __spreadArray(__spreadArray(__spreadArray([], announceRoomMembers.optimisticData, false), adminRoomMembers.optimisticData, false), preferredExporterOnyxData.optimisticData, false));
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: policyKey,
            value: { employeeList: successMembersState },
        },
    ];
    successData.push.apply(successData, __spreadArray(__spreadArray(__spreadArray([], announceRoomMembers.successData, false), adminRoomMembers.successData, false), preferredExporterOnyxData.successData, false));
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: policyKey,
            value: { employeeList: failureMembersState, approver: policy === null || policy === void 0 ? void 0 : policy.approver, rules: policy === null || policy === void 0 ? void 0 : policy.rules },
        },
    ];
    failureData.push.apply(failureData, __spreadArray(__spreadArray(__spreadArray([], announceRoomMembers.failureData, false), adminRoomMembers.failureData, false), preferredExporterOnyxData.failureData, false));
    var pendingChatMembers = ReportUtils.getPendingChatMembers(accountIDs, [], CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    workspaceChats.forEach(function (report) {
        var _a;
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report === null || report === void 0 ? void 0 : report.reportID),
            value: {
                statusNum: CONST_1.default.REPORT.STATUS_NUM.CLOSED,
                stateNum: CONST_1.default.REPORT.STATE_NUM.APPROVED,
                oldPolicyName: policy === null || policy === void 0 ? void 0 : policy.name,
            },
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(report === null || report === void 0 ? void 0 : report.reportID),
            value: {
                pendingChatMembers: pendingChatMembers,
            },
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(report === null || report === void 0 ? void 0 : report.reportID),
            value: {
                private_isArchived: true,
            },
        });
        var currentTime = DateUtils_1.default.getDBTime();
        var reportActions = (_a = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report === null || report === void 0 ? void 0 : report.reportID)]) !== null && _a !== void 0 ? _a : {};
        Object.values(reportActions).forEach(function (action) {
            if (action.actionName !== CONST_1.default.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                return;
            }
            optimisticData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(action.childReportID),
                value: {
                    private_isArchived: currentTime,
                },
            });
            failureData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(action.childReportID),
                value: {
                    private_isArchived: null,
                },
            });
        });
        successData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(report === null || report === void 0 ? void 0 : report.reportID),
            value: {
                pendingChatMembers: null,
            },
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(report === null || report === void 0 ? void 0 : report.reportID),
            value: {
                pendingChatMembers: null,
            },
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(report === null || report === void 0 ? void 0 : report.reportID),
            value: {
                private_isArchived: false,
            },
        });
    });
    // comment out for time this issue would be resolved https://github.com/Expensify/App/issues/35952
    // optimisticClosedReportActions.forEach((reportAction, index) => {
    //     optimisticData.push({
    //         onyxMethod: Onyx.METHOD.MERGE,
    //         key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${workspaceChats?.[index]?.reportID}`,
    //         value: {[reportAction.reportActionID]: reportAction as ReportAction},
    //     });
    // });
    // If the policy has primaryLoginsInvited, then it displays informative messages on the members page about which primary logins were added by secondary logins.
    // If we delete all these logins then we should clear the informative messages since they are no longer relevant.
    if (!(0, EmptyObject_1.isEmptyObject)((_h = policy === null || policy === void 0 ? void 0 : policy.primaryLoginsInvited) !== null && _h !== void 0 ? _h : {})) {
        // Take the current policy members and remove them optimistically
        var employeeListEmails = Object.keys((_k = (_j = allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID)]) === null || _j === void 0 ? void 0 : _j.employeeList) !== null && _k !== void 0 ? _k : {});
        var remainingLogins = employeeListEmails.filter(function (email) { return !emailList.includes(email); });
        var invitedPrimaryToSecondaryLogins_1 = {};
        if (policy === null || policy === void 0 ? void 0 : policy.primaryLoginsInvited) {
            Object.keys(policy.primaryLoginsInvited).forEach(function (key) { var _a, _b; return (invitedPrimaryToSecondaryLogins_1[(_b = (_a = policy.primaryLoginsInvited) === null || _a === void 0 ? void 0 : _a[key]) !== null && _b !== void 0 ? _b : ''] = key); });
        }
        // Then, if no remaining members exist that were invited by a secondary login, clear the informative messages
        if (!remainingLogins.some(function (remainingLogin) { return !!invitedPrimaryToSecondaryLogins_1[remainingLogin]; })) {
            optimisticData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: policyKey,
                value: {
                    primaryLoginsInvited: null,
                },
            });
        }
    }
    var filteredWorkspaceChats = workspaceChats.filter(function (report) { return report !== null; });
    filteredWorkspaceChats.forEach(function (_a) {
        var reportID = _a.reportID, stateNum = _a.stateNum, statusNum = _a.statusNum, _b = _a.oldPolicyName, oldPolicyName = _b === void 0 ? null : _b;
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
            value: {
                stateNum: stateNum,
                statusNum: statusNum,
                oldPolicyName: oldPolicyName,
            },
        });
    });
    optimisticClosedReportActions.forEach(function (reportAction, index) {
        var _a;
        var _b;
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat((_b = workspaceChats === null || workspaceChats === void 0 ? void 0 : workspaceChats.at(index)) === null || _b === void 0 ? void 0 : _b.reportID),
            value: (_a = {}, _a[reportAction.reportActionID] = null, _a),
        });
    });
    var params = {
        emailList: emailList.join(','),
        policyID: policyID,
    };
    API.write(types_1.WRITE_COMMANDS.DELETE_MEMBERS_FROM_WORKSPACE, params, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
function buildUpdateWorkspaceMembersRoleOnyxData(policyID, accountIDs, newRole) {
    var _a;
    var previousEmployeeList = __assign({}, (_a = allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID)]) === null || _a === void 0 ? void 0 : _a.employeeList);
    var memberRoles = accountIDs.reduce(function (result, accountID) {
        var _a, _b, _c;
        if (!((_a = allPersonalDetails === null || allPersonalDetails === void 0 ? void 0 : allPersonalDetails[accountID]) === null || _a === void 0 ? void 0 : _a.login)) {
            return result;
        }
        result.push({
            accountID: accountID,
            email: (_c = (_b = allPersonalDetails === null || allPersonalDetails === void 0 ? void 0 : allPersonalDetails[accountID]) === null || _b === void 0 ? void 0 : _b.login) !== null && _c !== void 0 ? _c : '',
            role: newRole,
        });
        return result;
    }, []);
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                employeeList: __assign({}, memberRoles.reduce(function (member, current) {
                    // eslint-disable-next-line no-param-reassign
                    member[current.email] = { role: current === null || current === void 0 ? void 0 : current.role, pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE };
                    return member;
                }, {})),
                errors: null,
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                employeeList: __assign({}, memberRoles.reduce(function (member, current) {
                    // eslint-disable-next-line no-param-reassign
                    member[current.email] = { role: current === null || current === void 0 ? void 0 : current.role, pendingAction: null };
                    return member;
                }, {})),
                errors: null,
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                employeeList: previousEmployeeList,
                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.editor.genericFailureMessage'),
            },
        },
    ];
    if (newRole !== CONST_1.default.POLICY.ROLE.ADMIN) {
        var preferredExporterOnyxData = resetAccountingPreferredExporter(policyID, memberRoles.map(function (member) { return member.email; }));
        optimisticData.push.apply(optimisticData, preferredExporterOnyxData.optimisticData);
        successData.push.apply(successData, preferredExporterOnyxData.successData);
        failureData.push.apply(failureData, preferredExporterOnyxData.failureData);
    }
    var adminRoom = ReportUtils.getAllPolicyReports(policyID).find(ReportUtils.isAdminRoom);
    if (adminRoom) {
        var failureDataParticipants_1 = __assign({}, adminRoom.participants);
        var optimisticParticipants_1 = {};
        if (newRole === CONST_1.default.POLICY.ROLE.ADMIN || newRole === CONST_1.default.POLICY.ROLE.AUDITOR) {
            accountIDs.forEach(function (accountID) {
                var _a;
                if ((_a = adminRoom === null || adminRoom === void 0 ? void 0 : adminRoom.participants) === null || _a === void 0 ? void 0 : _a[accountID]) {
                    return;
                }
                optimisticParticipants_1[accountID] = { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS };
                failureDataParticipants_1[accountID] = null;
            });
        }
        else {
            accountIDs.forEach(function (accountID) {
                var _a;
                if (!((_a = adminRoom === null || adminRoom === void 0 ? void 0 : adminRoom.participants) === null || _a === void 0 ? void 0 : _a[accountID])) {
                    return;
                }
                optimisticParticipants_1[accountID] = null;
            });
        }
        if (!(0, EmptyObject_1.isEmptyObject)(optimisticParticipants_1)) {
            optimisticData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(adminRoom.reportID),
                value: {
                    participants: optimisticParticipants_1,
                },
            });
            failureData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(adminRoom.reportID),
                value: {
                    participants: failureDataParticipants_1,
                },
            });
        }
    }
    return { optimisticData: optimisticData, successData: successData, failureData: failureData, memberRoles: memberRoles };
}
function updateWorkspaceMembersRole(policyID, accountIDs, newRole) {
    var _a = buildUpdateWorkspaceMembersRoleOnyxData(policyID, accountIDs, newRole), optimisticData = _a.optimisticData, successData = _a.successData, failureData = _a.failureData, memberRoles = _a.memberRoles;
    var params = {
        policyID: policyID,
        employees: JSON.stringify(memberRoles.map(function (item) { return ({ email: item.email, role: item.role }); })),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_WORKSPACE_MEMBERS_ROLE, params, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
function requestWorkspaceOwnerChange(policyID) {
    var _a;
    var _b, _c;
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    var ownershipChecks = __assign({}, policyOwnershipChecks === null || policyOwnershipChecks === void 0 ? void 0 : policyOwnershipChecks[policyID]);
    var changeOwnerErrors = Object.keys((_c = (_b = policy === null || policy === void 0 ? void 0 : policy.errorFields) === null || _b === void 0 ? void 0 : _b.changeOwner) !== null && _c !== void 0 ? _c : {});
    if (changeOwnerErrors && changeOwnerErrors.length > 0) {
        var currentError = changeOwnerErrors.at(0);
        if (currentError === CONST_1.default.POLICY.OWNERSHIP_ERRORS.AMOUNT_OWED) {
            ownershipChecks.shouldClearOutstandingBalance = true;
        }
        if (currentError === CONST_1.default.POLICY.OWNERSHIP_ERRORS.OWNER_OWES_AMOUNT) {
            ownershipChecks.shouldTransferAmountOwed = true;
        }
        if (currentError === CONST_1.default.POLICY.OWNERSHIP_ERRORS.SUBSCRIPTION) {
            ownershipChecks.shouldTransferSubscription = true;
        }
        if (currentError === CONST_1.default.POLICY.OWNERSHIP_ERRORS.DUPLICATE_SUBSCRIPTION) {
            ownershipChecks.shouldTransferSingleSubscription = true;
        }
        react_native_onyx_1.default.merge(ONYXKEYS_1.default.POLICY_OWNERSHIP_CHANGE_CHECKS, (_a = {},
            _a[policyID] = ownershipChecks,
            _a));
    }
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                errorFields: null,
                isLoading: true,
                isChangeOwnerSuccessful: false,
                isChangeOwnerFailed: false,
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                isLoading: false,
                isChangeOwnerSuccessful: true,
                isChangeOwnerFailed: false,
                owner: sessionEmail,
                ownerAccountID: sessionAccountID,
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                isLoading: false,
                isChangeOwnerSuccessful: false,
                isChangeOwnerFailed: true,
            },
        },
    ];
    var params = __assign({ policyID: policyID }, ownershipChecks);
    API.write(types_1.WRITE_COMMANDS.REQUEST_WORKSPACE_OWNER_CHANGE, params, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
function clearWorkspaceOwnerChangeFlow(policyID) {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.POLICY_OWNERSHIP_CHANGE_CHECKS, null);
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), {
        errorFields: null,
        isLoading: false,
        isChangeOwnerSuccessful: false,
        isChangeOwnerFailed: false,
    });
}
function buildAddMembersToWorkspaceOnyxData(invitedEmailsToAccountIDs, policyID, policyMemberAccountIDs, role) {
    var logins = Object.keys(invitedEmailsToAccountIDs).map(function (memberLogin) { return PhoneNumber.addSMSDomainIfPhoneNumber(memberLogin); });
    var accountIDs = Object.values(invitedEmailsToAccountIDs);
    var policyKey = "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID);
    var _a = PersonalDetailsUtils.getNewAccountIDsAndLogins(logins, accountIDs), newAccountIDs = _a.newAccountIDs, newLogins = _a.newLogins;
    var newPersonalDetailsOnyxData = PersonalDetailsUtils.getPersonalDetailsOnyxDataForOptimisticUsers(newLogins, newAccountIDs);
    var announceRoomMembers = buildRoomMembersOnyxData(CONST_1.default.REPORT.CHAT_TYPE.POLICY_ANNOUNCE, policyID, accountIDs);
    var adminRoomMembers = buildRoomMembersOnyxData(CONST_1.default.REPORT.CHAT_TYPE.POLICY_ADMINS, policyID, role === CONST_1.default.POLICY.ROLE.ADMIN || role === CONST_1.default.POLICY.ROLE.AUDITOR ? accountIDs : []);
    var optimisticAnnounceChat = ReportUtils.buildOptimisticAnnounceChat(policyID, __spreadArray(__spreadArray([], policyMemberAccountIDs, true), accountIDs, true));
    var announceRoomChat = optimisticAnnounceChat.announceChatData;
    // create onyx data for policy expense chats for each new member
    var membersChats = (0, Policy_1.createPolicyExpenseChats)(policyID, invitedEmailsToAccountIDs);
    var optimisticMembersState = {};
    var successMembersState = {};
    var failureMembersState = {};
    logins.forEach(function (email) {
        optimisticMembersState[email] = {
            email: email,
            pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            role: role,
            submitsTo: (0, PolicyUtils_1.getDefaultApprover)(allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies[policyKey]),
        };
        successMembersState[email] = { pendingAction: null };
        failureMembersState[email] = {
            errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.people.error.genericAdd'),
        };
    });
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: policyKey,
            // Convert to object with each key containing {pendingAction: 'add'}
            value: {
                employeeList: optimisticMembersState,
            },
        },
    ];
    optimisticData.push.apply(optimisticData, __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], newPersonalDetailsOnyxData.optimisticData, false), membersChats.onyxOptimisticData, false), announceRoomChat.onyxOptimisticData, false), announceRoomMembers.optimisticData, false), adminRoomMembers.optimisticData, false));
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: policyKey,
            value: {
                employeeList: successMembersState,
            },
        },
    ];
    successData.push.apply(successData, __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], newPersonalDetailsOnyxData.finallyData, false), membersChats.onyxSuccessData, false), announceRoomChat.onyxSuccessData, false), announceRoomMembers.successData, false), adminRoomMembers.successData, false));
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: policyKey,
            // Convert to object with each key containing the error. We don't
            // need to remove the members since that is handled by onClose of OfflineWithFeedback.
            value: {
                employeeList: failureMembersState,
            },
        },
    ];
    failureData.push.apply(failureData, __spreadArray(__spreadArray(__spreadArray(__spreadArray([], membersChats.onyxFailureData, false), announceRoomChat.onyxFailureData, false), announceRoomMembers.failureData, false), adminRoomMembers.failureData, false));
    return { optimisticData: optimisticData, successData: successData, failureData: failureData, optimisticAnnounceChat: optimisticAnnounceChat, membersChats: membersChats, logins: logins };
}
/**
 * Adds members to the specified workspace/policyID
 * Please see https://github.com/Expensify/App/blob/main/README.md#Security for more details
 */
function addMembersToWorkspace(invitedEmailsToAccountIDs, welcomeNote, policyID, policyMemberAccountIDs, role) {
    var _a = buildAddMembersToWorkspaceOnyxData(invitedEmailsToAccountIDs, policyID, policyMemberAccountIDs, role), optimisticData = _a.optimisticData, successData = _a.successData, failureData = _a.failureData, optimisticAnnounceChat = _a.optimisticAnnounceChat, membersChats = _a.membersChats, logins = _a.logins;
    var params = __assign(__assign(__assign({ employees: JSON.stringify(logins.map(function (login) { return ({ email: login, role: role }); })) }, (optimisticAnnounceChat.announceChatReportID ? { announceChatReportID: optimisticAnnounceChat.announceChatReportID } : {})), (optimisticAnnounceChat.announceChatReportActionID ? { announceCreatedReportActionID: optimisticAnnounceChat.announceChatReportActionID } : {})), { welcomeNote: Parser_1.default.replace(welcomeNote, {
            shouldEscapeText: false,
        }), policyID: policyID });
    if (!(0, EmptyObject_1.isEmptyObject)(membersChats.reportCreationData)) {
        params.reportCreationData = JSON.stringify(membersChats.reportCreationData);
    }
    API.write(types_1.WRITE_COMMANDS.ADD_MEMBERS_TO_WORKSPACE, params, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
function importPolicyMembers(policyID, members) {
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = getPolicy(policyID);
    var _a = members.reduce(function (acc, curr) {
        var _a;
        var employee = (_a = policy === null || policy === void 0 ? void 0 : policy.employeeList) === null || _a === void 0 ? void 0 : _a[curr.email];
        if (employee) {
            if (curr.role !== employee.role) {
                acc.updated++;
            }
        }
        else {
            acc.added++;
        }
        return acc;
    }, { added: 0, updated: 0 }), added = _a.added, updated = _a.updated;
    var onyxData = updateImportSpreadsheetData(added, updated);
    var parameters = {
        policyID: policyID,
        employees: JSON.stringify(members.map(function (member) { return ({ email: member.email, role: member.role }); })),
    };
    API.write(types_1.WRITE_COMMANDS.IMPORT_MEMBERS_SPREADSHEET, parameters, onyxData);
}
/**
 * Invite member to the specified policyID
 * Please see https://github.com/Expensify/App/blob/main/README.md#Security for more details
 */
function inviteMemberToWorkspace(policyID, inviterEmail) {
    var memberJoinKey = "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_JOIN_MEMBER).concat(policyID);
    var optimisticMembersState = { policyID: policyID, inviterEmail: inviterEmail };
    var failureMembersState = { policyID: policyID, inviterEmail: inviterEmail };
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: memberJoinKey,
            value: optimisticMembersState,
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: memberJoinKey,
            value: __assign(__assign({}, failureMembersState), { errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericEditFailureMessage') }),
        },
    ];
    var params = { policyID: policyID, inviterEmail: inviterEmail };
    API.write(types_1.WRITE_COMMANDS.JOIN_POLICY_VIA_INVITE_LINK, params, { optimisticData: optimisticData, failureData: failureData });
}
/**
 * Add member to the selected private domain workspace based on policyID
 */
function joinAccessiblePolicy(policyID) {
    var memberJoinKey = "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_JOIN_MEMBER).concat(policyID);
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: memberJoinKey,
            value: { policyID: policyID },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: memberJoinKey,
            value: { policyID: policyID, errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.people.error.genericAdd') },
        },
    ];
    API.write(types_1.WRITE_COMMANDS.JOIN_ACCESSIBLE_POLICY, { policyID: policyID }, { optimisticData: optimisticData, failureData: failureData });
}
/**
 * Ask the policy admin to add member to the selected private domain workspace based on policyID
 */
function askToJoinPolicy(policyID) {
    var memberJoinKey = "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_JOIN_MEMBER).concat(policyID);
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: memberJoinKey,
            value: { policyID: policyID },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: memberJoinKey,
            value: { policyID: policyID, errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.people.error.genericAdd') },
        },
    ];
    API.write(types_1.WRITE_COMMANDS.ASK_TO_JOIN_POLICY, { policyID: policyID }, { optimisticData: optimisticData, failureData: failureData });
}
/**
 * Removes an error after trying to delete a member
 */
function clearDeleteMemberError(policyID, accountID) {
    var _a;
    var _b, _c;
    var email = (_c = (_b = allPersonalDetails === null || allPersonalDetails === void 0 ? void 0 : allPersonalDetails[accountID]) === null || _b === void 0 ? void 0 : _b.login) !== null && _c !== void 0 ? _c : '';
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), {
        employeeList: (_a = {},
            _a[email] = {
                pendingAction: null,
                errors: null,
            },
            _a),
    });
}
/**
 * Removes an error after trying to add a member
 */
function clearAddMemberError(policyID, accountID) {
    var _a, _b;
    var _c, _d;
    var email = (_d = (_c = allPersonalDetails === null || allPersonalDetails === void 0 ? void 0 : allPersonalDetails[accountID]) === null || _c === void 0 ? void 0 : _c.login) !== null && _d !== void 0 ? _d : '';
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), {
        employeeList: (_a = {},
            _a[email] = null,
            _a),
    });
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST), (_b = {},
        _b[accountID] = null,
        _b));
}
function openWorkspaceMembersPage(policyID, clientMemberEmails) {
    if (!policyID || !clientMemberEmails) {
        Log_1.default.warn('openWorkspaceMembersPage invalid params', { policyID: policyID, clientMemberEmails: clientMemberEmails });
        return;
    }
    var params = {
        policyID: policyID,
        clientMemberEmails: JSON.stringify(clientMemberEmails),
    };
    API.read(types_1.READ_COMMANDS.OPEN_WORKSPACE_MEMBERS_PAGE, params);
}
function openPolicyMemberProfilePage(policyID, accountID) {
    var params = {
        policyID: policyID,
        accountID: accountID,
    };
    API.read(types_1.READ_COMMANDS.OPEN_POLICY_MEMBER_PROFILE_PAGE, params);
}
function setWorkspaceInviteMembersDraft(policyID, invitedEmailsToAccountIDs) {
    react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT).concat(policyID), invitedEmailsToAccountIDs);
}
function setWorkspaceInviteRoleDraft(policyID, role) {
    react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.WORKSPACE_INVITE_ROLE_DRAFT).concat(policyID), role);
}
function clearWorkspaceInviteRoleDraft(policyID) {
    react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.WORKSPACE_INVITE_ROLE_DRAFT).concat(policyID), null);
}
/**
 * Accept user join request to a workspace
 */
function acceptJoinRequest(reportID, reportAction) {
    var _a, _b, _c, _d;
    var _e, _f, _g, _h;
    if (!reportAction || !reportID) {
        Log_1.default.warn('acceptJoinRequest missing reportID or reportAction', { reportAction: reportAction, reportID: reportID });
        return;
    }
    var choice = CONST_1.default.REPORT.ACTIONABLE_MENTION_JOIN_WORKSPACE_RESOLUTION.ACCEPT;
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
            value: (_a = {},
                _a[reportAction.reportActionID] = {
                    originalMessage: { choice: choice },
                    pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
                _a),
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
            value: (_b = {},
                _b[reportAction.reportActionID] = {
                    originalMessage: { choice: choice },
                    pendingAction: null,
                },
                _b),
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
            value: (_c = {},
                _c[reportAction.reportActionID] = {
                    originalMessage: { choice: '' },
                    pendingAction: null,
                },
                _c),
        },
    ];
    var accountIDToApprove = ReportActionsUtils.isActionableJoinRequest(reportAction)
        ? ((_f = (_e = ReportActionsUtils.getOriginalMessage(reportAction)) === null || _e === void 0 ? void 0 : _e.accountID) !== null && _f !== void 0 ? _f : reportAction === null || reportAction === void 0 ? void 0 : reportAction.actorAccountID)
        : CONST_1.default.DEFAULT_NUMBER_ID;
    var parameters = {
        requests: JSON.stringify((_d = {},
            _d[ReportActionsUtils.isActionableJoinRequest(reportAction) ? ((_h = (_g = ReportActionsUtils.getOriginalMessage(reportAction)) === null || _g === void 0 ? void 0 : _g.policyID) !== null && _h !== void 0 ? _h : CONST_1.default.DEFAULT_NUMBER_ID) : CONST_1.default.DEFAULT_NUMBER_ID] = {
                requests: [{ accountID: accountIDToApprove, adminsRoomMessageReportActionID: reportAction.reportActionID }],
            },
            _d)),
    };
    API.write(types_1.WRITE_COMMANDS.ACCEPT_JOIN_REQUEST, parameters, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
/**
 * Decline user join request to a workspace
 */
function declineJoinRequest(reportID, reportAction) {
    var _a, _b, _c, _d;
    var _e, _f, _g, _h;
    if (!reportAction || !reportID) {
        Log_1.default.warn('declineJoinRequest missing reportID or reportAction', { reportAction: reportAction, reportID: reportID });
        return;
    }
    var choice = CONST_1.default.REPORT.ACTIONABLE_MENTION_JOIN_WORKSPACE_RESOLUTION.DECLINE;
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
            value: (_a = {},
                _a[reportAction.reportActionID] = {
                    originalMessage: { choice: choice },
                    pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
                _a),
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
            value: (_b = {},
                _b[reportAction.reportActionID] = {
                    originalMessage: { choice: choice },
                    pendingAction: null,
                },
                _b),
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
            value: (_c = {},
                _c[reportAction.reportActionID] = {
                    originalMessage: { choice: '' },
                    pendingAction: null,
                },
                _c),
        },
    ];
    var accountIDToApprove = ReportActionsUtils.isActionableJoinRequest(reportAction)
        ? ((_f = (_e = ReportActionsUtils.getOriginalMessage(reportAction)) === null || _e === void 0 ? void 0 : _e.accountID) !== null && _f !== void 0 ? _f : reportAction === null || reportAction === void 0 ? void 0 : reportAction.actorAccountID)
        : CONST_1.default.DEFAULT_NUMBER_ID;
    var parameters = {
        requests: JSON.stringify((_d = {},
            _d[ReportActionsUtils.isActionableJoinRequest(reportAction) ? ((_h = (_g = ReportActionsUtils.getOriginalMessage(reportAction)) === null || _g === void 0 ? void 0 : _g.policyID) !== null && _h !== void 0 ? _h : CONST_1.default.DEFAULT_NUMBER_ID) : CONST_1.default.DEFAULT_NUMBER_ID] = {
                requests: [{ accountID: accountIDToApprove, adminsRoomMessageReportActionID: reportAction.reportActionID }],
            },
            _d)),
    };
    API.write(types_1.WRITE_COMMANDS.DECLINE_JOIN_REQUEST, parameters, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function downloadMembersCSV(policyID, onDownloadFailed) {
    var finalParameters = (0, enhanceParameters_1.default)(types_1.WRITE_COMMANDS.EXPORT_MEMBERS_CSV, {
        policyID: policyID,
    });
    var fileName = 'Members.csv';
    var formData = new FormData();
    Object.entries(finalParameters).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        formData.append(key, String(value));
    });
    (0, fileDownload_1.default)(ApiUtils.getCommandURL({ command: types_1.WRITE_COMMANDS.EXPORT_MEMBERS_CSV }), fileName, '', false, formData, CONST_1.default.NETWORK.METHOD.POST, onDownloadFailed);
}
function clearInviteDraft(policyID) {
    setWorkspaceInviteMembersDraft(policyID, {});
    FormActions.clearDraftValues(ONYXKEYS_1.default.FORMS.WORKSPACE_INVITE_MESSAGE_FORM);
}
