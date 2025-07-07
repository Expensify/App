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
exports.buildOptimisticPolicyRecentlyUsedTags = buildOptimisticPolicyRecentlyUsedTags;
exports.setPolicyRequiresTag = setPolicyRequiresTag;
exports.setPolicyTagsRequired = setPolicyTagsRequired;
exports.createPolicyTag = createPolicyTag;
exports.clearPolicyTagErrors = clearPolicyTagErrors;
exports.clearPolicyTagListErrors = clearPolicyTagListErrors;
exports.clearPolicyTagListErrorField = clearPolicyTagListErrorField;
exports.deletePolicyTags = deletePolicyTags;
exports.enablePolicyTags = enablePolicyTags;
exports.setWorkspaceTagRequired = setWorkspaceTagRequired;
exports.openPolicyTagsPage = openPolicyTagsPage;
exports.renamePolicyTag = renamePolicyTag;
exports.renamePolicyTagList = renamePolicyTagList;
exports.setWorkspaceTagEnabled = setWorkspaceTagEnabled;
exports.setPolicyTagGLCode = setPolicyTagGLCode;
exports.setPolicyTagApprover = setPolicyTagApprover;
exports.importPolicyTags = importPolicyTags;
exports.downloadTagsCSV = downloadTagsCSV;
exports.getPolicyTagsData = getPolicyTagsData;
exports.downloadMultiLevelIndependentTagsCSV = downloadMultiLevelIndependentTagsCSV;
exports.cleanPolicyTags = cleanPolicyTags;
exports.setImportedSpreadsheetIsImportingMultiLevelTags = setImportedSpreadsheetIsImportingMultiLevelTags;
exports.setImportedSpreadsheetIsImportingIndependentMultiLevelTags = setImportedSpreadsheetIsImportingIndependentMultiLevelTags;
exports.setImportedSpreadsheetIsFirstLineHeader = setImportedSpreadsheetIsFirstLineHeader;
exports.setImportedSpreadsheetIsGLAdjacent = setImportedSpreadsheetIsGLAdjacent;
exports.setImportedSpreadsheetFileURI = setImportedSpreadsheetFileURI;
exports.importMultiLevelTags = importMultiLevelTags;
var cloneDeep_1 = require("lodash/cloneDeep");
var react_native_onyx_1 = require("react-native-onyx");
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var ApiUtils = require("@libs/ApiUtils");
var ErrorUtils = require("@libs/ErrorUtils");
var fileDownload_1 = require("@libs/fileDownload");
var FileUtils_1 = require("@libs/fileDownload/FileUtils");
var getIsNarrowLayout_1 = require("@libs/getIsNarrowLayout");
var Localize_1 = require("@libs/Localize");
var Log_1 = require("@libs/Log");
var enhanceParameters_1 = require("@libs/Network/enhanceParameters");
var PolicyUtils = require("@libs/PolicyUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportUtils = require("@libs/ReportUtils");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
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
var allPolicyTags = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.POLICY_TAGS,
    waitForCollectionCallback: true,
    callback: function (value) {
        if (!value) {
            allPolicyTags = {};
            return;
        }
        allPolicyTags = value;
    },
});
var allRecentlyUsedTags = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.POLICY_RECENTLY_USED_TAGS,
    waitForCollectionCallback: true,
    callback: function (val) { return (allRecentlyUsedTags = val); },
});
function openPolicyTagsPage(policyID) {
    if (!policyID) {
        Log_1.default.warn('openPolicyTagsPage invalid params', { policyID: policyID });
        return;
    }
    var params = {
        policyID: policyID,
    };
    API.read(types_1.READ_COMMANDS.OPEN_POLICY_TAGS_PAGE, params);
}
function buildOptimisticPolicyRecentlyUsedTags(policyID, transactionTags) {
    var _a, _b;
    if (!policyID || !transactionTags) {
        return {};
    }
    var policyTags = (_a = allPolicyTags === null || allPolicyTags === void 0 ? void 0 : allPolicyTags["".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID)]) !== null && _a !== void 0 ? _a : {};
    var policyTagKeys = PolicyUtils.getSortedTagKeys(policyTags);
    var policyRecentlyUsedTags = (_b = allRecentlyUsedTags === null || allRecentlyUsedTags === void 0 ? void 0 : allRecentlyUsedTags["".concat(ONYXKEYS_1.default.COLLECTION.POLICY_RECENTLY_USED_TAGS).concat(policyID)]) !== null && _b !== void 0 ? _b : {};
    var newOptimisticPolicyRecentlyUsedTags = {};
    (0, TransactionUtils_1.getTagArrayFromName)(transactionTags).forEach(function (tag, index) {
        var _a, _b;
        if (!tag) {
            return;
        }
        var tagListKey = (_a = policyTagKeys.at(index)) !== null && _a !== void 0 ? _a : '';
        newOptimisticPolicyRecentlyUsedTags[tagListKey] = __spreadArray([], new Set(__spreadArray([tag], ((_b = policyRecentlyUsedTags[tagListKey]) !== null && _b !== void 0 ? _b : []), true)), true);
    });
    return newOptimisticPolicyRecentlyUsedTags;
}
function updateImportSpreadsheetData(tagsLength) {
    var onyxData = {
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.IMPORTED_SPREADSHEET,
                value: {
                    shouldFinalModalBeOpened: true,
                    importFinalModal: {
                        title: (0, Localize_1.translateLocal)('spreadsheet.importSuccessfulTitle'),
                        prompt: (0, Localize_1.translateLocal)('spreadsheet.importTagsSuccessfulDescription', { tags: tagsLength }),
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
function createPolicyTag(policyID, tagName) {
    var _a, _b, _c, _d, _e, _f;
    var _g, _h, _j;
    var policyTag = (_j = (_h = PolicyUtils.getTagLists((_g = allPolicyTags === null || allPolicyTags === void 0 ? void 0 : allPolicyTags["".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID)]) !== null && _g !== void 0 ? _g : {})) === null || _h === void 0 ? void 0 : _h.at(0)) !== null && _j !== void 0 ? _j : {};
    var newTagName = PolicyUtils.escapeTagName(tagName);
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID),
                value: (_a = {},
                    _a[policyTag.name] = {
                        tags: (_b = {},
                            _b[newTagName] = {
                                name: newTagName,
                                enabled: true,
                                errors: null,
                                pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                            },
                            _b),
                    },
                    _a),
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID),
                value: (_c = {},
                    _c[policyTag.name] = {
                        tags: (_d = {},
                            _d[newTagName] = {
                                errors: null,
                                pendingAction: null,
                            },
                            _d),
                    },
                    _c),
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID),
                value: (_e = {},
                    _e[policyTag.name] = {
                        tags: (_f = {},
                            _f[newTagName] = {
                                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.tags.genericFailureMessage'),
                            },
                            _f),
                    },
                    _e),
            },
        ],
    };
    var parameters = {
        policyID: policyID,
        tags: JSON.stringify([{ name: newTagName }]),
    };
    API.write(types_1.WRITE_COMMANDS.CREATE_POLICY_TAG, parameters, onyxData);
}
function importPolicyTags(policyID, tags) {
    var onyxData = updateImportSpreadsheetData(tags.length);
    var parameters = {
        policyID: policyID,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        tags: JSON.stringify(tags.map(function (tag) { return ({ name: tag.name, enabled: tag.enabled, 'GL Code': tag['GL Code'] }); })),
    };
    API.write(types_1.WRITE_COMMANDS.IMPORT_TAGS_SPREADSHEET, parameters, onyxData);
}
function setWorkspaceTagEnabled(policyID, tagsToUpdate, tagListIndex) {
    var _a, _b, _c;
    var _d, _e;
    var policyTag = (_e = PolicyUtils.getTagLists((_d = allPolicyTags === null || allPolicyTags === void 0 ? void 0 : allPolicyTags["".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID)]) !== null && _d !== void 0 ? _d : {})) === null || _e === void 0 ? void 0 : _e.at(tagListIndex);
    if (!policyTag || tagListIndex === -1) {
        return;
    }
    var optimisticPolicyTagsData = __assign({}, Object.keys(tagsToUpdate).reduce(function (acc, key) {
        var _a;
        acc[key] = __assign(__assign(__assign({}, policyTag.tags[key]), tagsToUpdate[key]), { errors: null, pendingFields: __assign(__assign({}, (_a = policyTag.tags[key]) === null || _a === void 0 ? void 0 : _a.pendingFields), { enabled: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE }), pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE });
        return acc;
    }, {}));
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID),
                value: (_a = {},
                    _a[policyTag.name] = {
                        tags: optimisticPolicyTagsData,
                    },
                    _a),
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID),
                value: (_b = {},
                    _b[policyTag.name] = {
                        tags: __assign({}, Object.keys(tagsToUpdate).reduce(function (acc, key) {
                            acc[key] = __assign(__assign(__assign({}, policyTag.tags[key]), tagsToUpdate[key]), { errors: null, pendingFields: __assign(__assign({}, policyTag.tags[key].pendingFields), { enabled: null }), pendingAction: null });
                            return acc;
                        }, {})),
                    },
                    _b),
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID),
                value: (_c = {},
                    _c[policyTag.name] = {
                        tags: __assign({}, Object.keys(tagsToUpdate).reduce(function (acc, key) {
                            acc[key] = __assign(__assign(__assign({}, policyTag.tags[key]), tagsToUpdate[key]), { errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.tags.genericFailureMessage'), pendingFields: __assign(__assign({}, policyTag.tags[key].pendingFields), { enabled: null }), pendingAction: null });
                            return acc;
                        }, {})),
                    },
                    _c),
            },
        ],
    };
    var parameters = {
        policyID: policyID,
        tags: JSON.stringify(Object.keys(tagsToUpdate).map(function (key) { return tagsToUpdate[key]; })),
        tagListIndex: tagListIndex,
    };
    API.write(types_1.WRITE_COMMANDS.SET_POLICY_TAGS_ENABLED, parameters, onyxData);
}
function setWorkspaceTagRequired(policyID, tagListIndexes, isRequired, policyTags) {
    if (!policyTags) {
        return;
    }
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID),
                value: __assign({}, Object.keys(policyTags).reduce(function (acc, key) {
                    if (tagListIndexes.includes(policyTags[key].orderWeight)) {
                        acc[key] = __assign(__assign({}, acc[key]), { required: isRequired, errors: undefined, pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE, pendingFields: {
                                required: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            } });
                        return acc;
                    }
                    return acc;
                }, {})),
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID),
                value: __assign({}, Object.keys(policyTags).reduce(function (acc, key) {
                    if (tagListIndexes.includes(policyTags[key].orderWeight)) {
                        acc[key] = __assign(__assign({}, acc[key]), { errors: undefined, pendingAction: null, pendingFields: {
                                required: null,
                            } });
                        return acc;
                    }
                    return acc;
                }, {})),
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID),
                value: __assign({}, Object.keys(policyTags).reduce(function (acc, key) {
                    acc[key] = __assign(__assign({}, acc[key]), { errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.tags.genericFailureMessage'), pendingAction: null, pendingFields: {
                            required: null,
                        } });
                    return acc;
                }, {})),
            },
        ],
    };
    var parameters = {
        policyID: policyID,
        tagListIndexes: tagListIndexes,
        isRequired: isRequired,
    };
    API.write(types_1.WRITE_COMMANDS.SET_POLICY_TAG_LISTS_REQUIRED, parameters, onyxData);
}
function deletePolicyTags(policyID, tagsToDelete) {
    var _a, _b, _c;
    var _d, _e;
    var policyTag = (_e = PolicyUtils.getTagLists((_d = allPolicyTags === null || allPolicyTags === void 0 ? void 0 : allPolicyTags["".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID)]) !== null && _d !== void 0 ? _d : {})) === null || _e === void 0 ? void 0 : _e.at(0);
    if (!policyTag) {
        return;
    }
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID),
                value: (_a = {},
                    _a[policyTag.name] = {
                        tags: __assign({}, tagsToDelete.reduce(function (acc, tagName) {
                            acc[tagName] = { pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE, enabled: false };
                            return acc;
                        }, {})),
                    },
                    _a),
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID),
                value: (_b = {},
                    _b[policyTag.name] = {
                        tags: __assign({}, tagsToDelete.reduce(function (acc, tagName) {
                            acc[tagName] = null;
                            return acc;
                        }, {})),
                    },
                    _b),
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID),
                value: (_c = {},
                    _c[policyTag.name] = {
                        tags: __assign({}, tagsToDelete.reduce(function (acc, tagName) {
                            var _a;
                            acc[tagName] = {
                                pendingAction: null,
                                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.tags.deleteFailureMessage'),
                                enabled: !!((_a = policyTag === null || policyTag === void 0 ? void 0 : policyTag.tags[tagName]) === null || _a === void 0 ? void 0 : _a.enabled),
                            };
                            return acc;
                        }, {})),
                    },
                    _c),
            },
        ],
    };
    var parameters = {
        policyID: policyID,
        tags: JSON.stringify(tagsToDelete),
    };
    API.write(types_1.WRITE_COMMANDS.DELETE_POLICY_TAGS, parameters, onyxData);
}
function clearPolicyTagErrors(policyID, tagName, tagListIndex) {
    var _a, _b, _c, _d;
    var _e, _f;
    var tagListName = PolicyUtils.getTagListName(allPolicyTags === null || allPolicyTags === void 0 ? void 0 : allPolicyTags["".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID)], tagListIndex);
    var tag = (_f = (_e = allPolicyTags === null || allPolicyTags === void 0 ? void 0 : allPolicyTags["".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID)]) === null || _e === void 0 ? void 0 : _e[tagListName].tags) === null || _f === void 0 ? void 0 : _f[tagName];
    if (!tag) {
        return;
    }
    if (tag.pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
        react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID), (_a = {},
            _a[tagListName] = {
                tags: (_b = {},
                    _b[tagName] = null,
                    _b),
            },
            _a));
        return;
    }
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID), (_c = {},
        _c[tagListName] = {
            tags: (_d = {},
                _d[tagName] = {
                    errors: null,
                    pendingAction: null,
                },
                _d),
        },
        _c));
}
function clearPolicyTagListErrorField(policyID, tagListIndex, errorField) {
    var _a, _b;
    var _c, _d;
    var policyTag = (_d = PolicyUtils.getTagLists((_c = allPolicyTags === null || allPolicyTags === void 0 ? void 0 : allPolicyTags["".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID)]) !== null && _c !== void 0 ? _c : {})) === null || _d === void 0 ? void 0 : _d.at(tagListIndex);
    if (!policyTag) {
        return;
    }
    if (!policyTag.name) {
        return;
    }
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID), (_a = {},
        _a[policyTag.name] = {
            errorFields: (_b = {},
                _b[errorField] = null,
                _b),
        },
        _a));
}
function clearPolicyTagListErrors(policyID, tagListIndex) {
    var _a;
    var _b, _c;
    var policyTag = (_c = PolicyUtils.getTagLists((_b = allPolicyTags === null || allPolicyTags === void 0 ? void 0 : allPolicyTags["".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID)]) !== null && _b !== void 0 ? _b : {})) === null || _c === void 0 ? void 0 : _c.at(tagListIndex);
    if (!policyTag) {
        return;
    }
    if (!policyTag.name) {
        return;
    }
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID), (_a = {},
        _a[policyTag.name] = {
            errors: null,
        },
        _a));
}
function renamePolicyTag(policyID, policyTag, tagListIndex) {
    var _a, _b, _c, _d, _e, _f;
    var _g, _h, _j, _k, _l;
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = PolicyUtils.getPolicy(policyID);
    var tagList = (_h = PolicyUtils.getTagLists((_g = allPolicyTags === null || allPolicyTags === void 0 ? void 0 : allPolicyTags["".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID)]) !== null && _g !== void 0 ? _g : {})) === null || _h === void 0 ? void 0 : _h.at(tagListIndex);
    if (!tagList) {
        return;
    }
    var tag = (_j = tagList.tags) === null || _j === void 0 ? void 0 : _j[policyTag.oldName];
    var oldTagName = policyTag.oldName;
    var newTagName = PolicyUtils.escapeTagName(policyTag.newName);
    var policyTagRule = PolicyUtils.getTagApproverRule(policyID, oldTagName);
    var approvalRules = (_l = (_k = policy === null || policy === void 0 ? void 0 : policy.rules) === null || _k === void 0 ? void 0 : _k.approvalRules) !== null && _l !== void 0 ? _l : [];
    var updatedApprovalRules = (0, cloneDeep_1.default)(approvalRules);
    // Its related by name, so the corresponding rule has to be updated to handle offline scenario
    if (policyTagRule) {
        var indexToUpdate = updatedApprovalRules.findIndex(function (rule) { return rule.id === policyTagRule.id; });
        policyTagRule.applyWhen = policyTagRule.applyWhen.map(function (ruleCondition) {
            var value = ruleCondition.value, field = ruleCondition.field, condition = ruleCondition.condition;
            if (value === policyTag.oldName && field === CONST_1.default.POLICY.FIELDS.TAG && condition === CONST_1.default.POLICY.RULE_CONDITIONS.MATCHES) {
                return __assign(__assign({}, ruleCondition), { value: policyTag.newName });
            }
            return ruleCondition;
        });
        updatedApprovalRules[indexToUpdate] = policyTagRule;
    }
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID),
                value: (_a = {},
                    _a[tagList === null || tagList === void 0 ? void 0 : tagList.name] = {
                        tags: (_b = {},
                            _b[oldTagName] = null,
                            _b[newTagName] = __assign(__assign({}, tag), { name: newTagName, pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE, pendingFields: __assign(__assign({}, tag.pendingFields), { name: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE }), previousTagName: oldTagName, errors: null }),
                            _b),
                    },
                    _a),
            },
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    rules: {
                        approvalRules: updatedApprovalRules,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID),
                value: (_c = {},
                    _c[tagList.name] = {
                        tags: (_d = {},
                            _d[newTagName] = {
                                pendingAction: null,
                                pendingFields: __assign(__assign({}, tag.pendingFields), { name: null }),
                            },
                            _d),
                    },
                    _c),
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID),
                value: (_e = {},
                    _e[tagList.name] = {
                        tags: (_f = {},
                            _f[newTagName] = null,
                            _f[oldTagName] = __assign(__assign({}, tag), { pendingAction: null, pendingFields: __assign(__assign({}, tag.pendingFields), { name: null }), errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.tags.genericFailureMessage') }),
                            _f),
                    },
                    _e),
            },
        ],
    };
    var parameters = {
        policyID: policyID,
        oldName: oldTagName,
        newName: newTagName,
        tagListIndex: tagListIndex,
    };
    API.write(types_1.WRITE_COMMANDS.RENAME_POLICY_TAG, parameters, onyxData);
}
function enablePolicyTags(policyID, enabled) {
    var _a;
    var _b, _c, _d;
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    areTagsEnabled: enabled,
                    pendingFields: {
                        areTagsEnabled: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    pendingFields: {
                        areTagsEnabled: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    areTagsEnabled: !enabled,
                    pendingFields: {
                        areTagsEnabled: null,
                    },
                },
            },
        ],
    };
    var policyTagList = allPolicyTags === null || allPolicyTags === void 0 ? void 0 : allPolicyTags["".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID)];
    if (!policyTagList) {
        var defaultTagList = {
            Tag: {
                name: 'Tag',
                orderWeight: 0,
                required: false,
                tags: {},
            },
        };
        (_b = onyxData.optimisticData) === null || _b === void 0 ? void 0 : _b.push({
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID),
            value: defaultTagList,
        });
        (_c = onyxData.failureData) === null || _c === void 0 ? void 0 : _c.push({
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID),
            value: null,
        });
    }
    else if (!enabled) {
        var policyTag = PolicyUtils.getTagLists(policyTagList).at(0);
        if (!policyTag) {
            return;
        }
        (_d = onyxData.optimisticData) === null || _d === void 0 ? void 0 : _d.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID),
            value: (_a = {},
                _a[policyTag.name] = {
                    tags: Object.fromEntries(Object.keys(policyTag.tags).map(function (tagName) { return [
                        tagName,
                        {
                            enabled: false,
                        },
                    ]; })),
                },
                _a),
        }, {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                requiresTag: false,
            },
        });
    }
    var parameters = { policyID: policyID, enabled: enabled };
    API.writeWithNoDuplicatesEnableFeatureConflicts(types_1.WRITE_COMMANDS.ENABLE_POLICY_TAGS, parameters, onyxData);
    if (enabled && (0, getIsNarrowLayout_1.default)()) {
        (0, PolicyUtils_1.goBackWhenEnableFeature)(policyID);
    }
}
function cleanPolicyTags(policyID) {
    // We do not have any optimistic data or success data for this command as this action cannot be done offline
    API.write(types_1.WRITE_COMMANDS.CLEAN_POLICY_TAGS, { policyID: policyID });
}
function setImportedSpreadsheetIsImportingMultiLevelTags(isImportingMultiLevelTags) {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.IMPORTED_SPREADSHEET, { isImportingMultiLevelTags: isImportingMultiLevelTags });
}
function setImportedSpreadsheetIsImportingIndependentMultiLevelTags(isImportingIndependentMultiLevelTags) {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.IMPORTED_SPREADSHEET, { isImportingIndependentMultiLevelTags: isImportingIndependentMultiLevelTags });
}
function setImportedSpreadsheetIsFirstLineHeader(containsHeader) {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.IMPORTED_SPREADSHEET, { containsHeader: containsHeader });
}
function setImportedSpreadsheetIsGLAdjacent(isGLAdjacent) {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.IMPORTED_SPREADSHEET, { isGLAdjacent: isGLAdjacent });
}
function setImportedSpreadsheetFileURI(fileURI) {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.IMPORTED_SPREADSHEET, { fileURI: fileURI });
}
function importMultiLevelTags(policyID, spreadsheet) {
    var _a, _b, _c;
    if (!spreadsheet) {
        return;
    }
    var onyxData = {
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    hasMultipleTagLists: true,
                },
            },
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.IMPORTED_SPREADSHEET,
                value: {
                    shouldFinalModalBeOpened: true,
                    importFinalModal: { title: (0, Localize_1.translateLocal)('spreadsheet.importSuccessfulTitle'), prompt: (0, Localize_1.translateLocal)('spreadsheet.importMultiLevelTagsSuccessfulDescription') },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    hasMultipleTagLists: false,
                },
            },
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
    (0, FileUtils_1.readFileAsync)((_a = spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.fileURI) !== null && _a !== void 0 ? _a : '', (_b = spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.fileName) !== null && _b !== void 0 ? _b : CONST_1.default.MULTI_LEVEL_TAGS_FILE_NAME, function (file) {
        var parameters = {
            policyID: policyID,
            isFirstLineHeader: spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.containsHeader,
            isIndependent: spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.isImportingIndependentMultiLevelTags,
            isGLAdjacent: spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.isGLAdjacent,
            file: file,
        };
        API.write(types_1.WRITE_COMMANDS.IMPORT_MULTI_LEVEL_TAGS, parameters, onyxData);
    }, function () { }, (_c = spreadsheet === null || spreadsheet === void 0 ? void 0 : spreadsheet.fileType) !== null && _c !== void 0 ? _c : CONST_1.default.SHARE_FILE_MIMETYPE.CSV);
}
function renamePolicyTagList(policyID, policyTagListName, policyTags, tagListIndex) {
    var _a, _b, _c;
    var _d;
    var newName = policyTagListName.newName;
    var oldName = policyTagListName.oldName;
    var oldPolicyTags = (_d = policyTags === null || policyTags === void 0 ? void 0 : policyTags[oldName]) !== null && _d !== void 0 ? _d : {};
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID),
                value: (_a = {},
                    _a[newName] = __assign(__assign({}, oldPolicyTags), { name: newName, pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD, errors: null }),
                    _a[oldName] = null,
                    _a),
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID),
                value: (_b = {},
                    _b[newName] = { pendingAction: null },
                    _b[oldName] = null,
                    _b),
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID),
                value: (_c = {},
                    _c[newName] = null,
                    _c[oldName] = __assign(__assign({}, oldPolicyTags), { pendingAction: null, errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.tags.genericFailureMessage') }),
                    _c),
            },
        ],
    };
    var parameters = {
        policyID: policyID,
        oldName: oldName,
        newName: newName,
        tagListIndex: tagListIndex,
    };
    API.write(types_1.WRITE_COMMANDS.RENAME_POLICY_TAG_LIST, parameters, onyxData);
}
function setPolicyRequiresTag(policyID, requiresTag) {
    var _a, _b, _c, _d;
    var policyTags = (_a = allPolicyTags === null || allPolicyTags === void 0 ? void 0 : allPolicyTags["".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID)]) !== null && _a !== void 0 ? _a : {};
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    requiresTag: requiresTag,
                    errors: { requiresTag: null },
                    pendingFields: {
                        requiresTag: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    errors: {
                        requiresTag: null,
                    },
                    pendingFields: {
                        requiresTag: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    requiresTag: !requiresTag,
                    errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.tags.genericFailureMessage'),
                    pendingFields: {
                        requiresTag: null,
                    },
                },
            },
        ],
    };
    var getUpdatedTagsData = function (required) { return ({
        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID),
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        value: __assign({}, Object.keys(policyTags).reduce(function (acc, key) {
            acc[key] = __assign(__assign({}, acc[key]), { required: required });
            return acc;
        }, {})),
    }); };
    (_b = onyxData.optimisticData) === null || _b === void 0 ? void 0 : _b.push(getUpdatedTagsData(requiresTag));
    (_c = onyxData.failureData) === null || _c === void 0 ? void 0 : _c.push(getUpdatedTagsData(!requiresTag));
    (_d = onyxData.successData) === null || _d === void 0 ? void 0 : _d.push(getUpdatedTagsData(requiresTag));
    var parameters = {
        policyID: policyID,
        requiresTag: requiresTag,
    };
    API.write(types_1.WRITE_COMMANDS.SET_POLICY_REQUIRES_TAG, parameters, onyxData);
}
function setPolicyTagsRequired(policyID, requiresTag, tagListIndex) {
    var _a, _b, _c;
    var _d, _e;
    var policyTag = (_e = PolicyUtils.getTagLists((_d = allPolicyTags === null || allPolicyTags === void 0 ? void 0 : allPolicyTags["".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID)]) !== null && _d !== void 0 ? _d : {})) === null || _e === void 0 ? void 0 : _e.at(tagListIndex);
    if (!policyTag) {
        return;
    }
    if (!policyTag.name) {
        return;
    }
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID),
                value: (_a = {},
                    _a[policyTag.name] = {
                        required: requiresTag,
                        pendingFields: { required: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE },
                        errorFields: { required: null },
                    },
                    _a),
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID),
                value: (_b = {},
                    _b[policyTag.name] = {
                        pendingFields: { required: null },
                    },
                    _b),
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID),
                value: (_c = {},
                    _c[policyTag.name] = {
                        required: policyTag.required,
                        pendingFields: { required: null },
                        errorFields: {
                            required: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.tags.genericFailureMessage'),
                        },
                    },
                    _c),
            },
        ],
    };
    var parameters = {
        policyID: policyID,
        tagListIndex: tagListIndex,
        requireTagList: requiresTag,
    };
    API.write(types_1.WRITE_COMMANDS.SET_POLICY_TAGS_REQUIRED, parameters, onyxData);
}
function setPolicyTagGLCode(policyID, tagName, tagListIndex, glCode) {
    var _a, _b, _c, _d, _e, _f;
    var _g, _h, _j, _k;
    var tagListName = PolicyUtils.getTagListName(allPolicyTags === null || allPolicyTags === void 0 ? void 0 : allPolicyTags["".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID)], tagListIndex);
    var policyTagToUpdate = (_k = (_j = (_h = (_g = allPolicyTags === null || allPolicyTags === void 0 ? void 0 : allPolicyTags["".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID)]) === null || _g === void 0 ? void 0 : _g[tagListName]) === null || _h === void 0 ? void 0 : _h.tags) === null || _j === void 0 ? void 0 : _j[tagName]) !== null && _k !== void 0 ? _k : {};
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID),
                value: (_a = {},
                    _a[tagListName] = {
                        tags: (_b = {},
                            _b[tagName] = __assign(__assign({}, policyTagToUpdate), { pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE, pendingFields: {
                                    // eslint-disable-next-line @typescript-eslint/naming-convention
                                    'GL Code': CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                }, 
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                'GL Code': glCode }),
                            _b),
                    },
                    _a),
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID),
                value: (_c = {},
                    _c[tagListName] = {
                        tags: (_d = {},
                            _d[tagName] = {
                                errors: null,
                                pendingAction: null,
                                pendingFields: {
                                    // eslint-disable-next-line @typescript-eslint/naming-convention
                                    'GL Code': null,
                                },
                            },
                            _d),
                    },
                    _c),
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID),
                value: (_e = {},
                    _e[tagListName] = {
                        tags: (_f = {},
                            _f[tagName] = __assign(__assign({}, policyTagToUpdate), { errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.tags.updateGLCodeFailureMessage') }),
                            _f),
                    },
                    _e),
            },
        ],
    };
    var parameters = {
        policyID: policyID,
        tagName: tagName,
        tagListName: tagListName,
        tagListIndex: tagListIndex,
        glCode: glCode,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_POLICY_TAG_GL_CODE, parameters, onyxData);
}
function setPolicyTagApprover(policyID, tag, approver) {
    var _a, _b;
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = PolicyUtils.getPolicy(policyID);
    var prevApprovalRules = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.rules) === null || _a === void 0 ? void 0 : _a.approvalRules) !== null && _b !== void 0 ? _b : [];
    var approverRuleToUpdate = PolicyUtils.getTagApproverRule(policyID, tag);
    var filteredApprovalRules = approverRuleToUpdate ? prevApprovalRules.filter(function (rule) { return rule.id !== approverRuleToUpdate.id; }) : prevApprovalRules;
    var toBeUnselected = (approverRuleToUpdate === null || approverRuleToUpdate === void 0 ? void 0 : approverRuleToUpdate.approver) === approver;
    var updatedApproverRule = approverRuleToUpdate
        ? __assign(__assign({}, approverRuleToUpdate), { approver: approver }) : {
        applyWhen: [
            {
                condition: CONST_1.default.POLICY.RULE_CONDITIONS.MATCHES,
                field: CONST_1.default.POLICY.FIELDS.TAG,
                value: tag,
            },
        ],
        approver: approver,
        id: '-1',
    };
    var updatedApprovalRules = toBeUnselected ? filteredApprovalRules : __spreadArray(__spreadArray([], filteredApprovalRules, true), [updatedApproverRule], false);
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    rules: {
                        approvalRules: updatedApprovalRules,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    rules: {
                        approvalRules: updatedApprovalRules,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    rules: {
                        approvalRules: prevApprovalRules,
                    },
                },
            },
        ],
    };
    var parameters = {
        policyID: policyID,
        tagName: tag,
        approver: toBeUnselected ? null : approver,
    };
    API.write(types_1.WRITE_COMMANDS.SET_POLICY_TAG_APPROVER, parameters, onyxData);
}
function downloadTagsCSV(policyID, onDownloadFailed) {
    var finalParameters = (0, enhanceParameters_1.default)(types_1.WRITE_COMMANDS.EXPORT_TAGS_CSV, {
        policyID: policyID,
    });
    var fileName = 'Tags.csv';
    var formData = new FormData();
    Object.entries(finalParameters).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        formData.append(key, String(value));
    });
    (0, fileDownload_1.default)(ApiUtils.getCommandURL({ command: types_1.WRITE_COMMANDS.EXPORT_TAGS_CSV }), fileName, '', false, formData, CONST_1.default.NETWORK.METHOD.POST, onDownloadFailed);
}
function downloadMultiLevelIndependentTagsCSV(policyID, onDownloadFailed) {
    var finalParameters = (0, enhanceParameters_1.default)(types_1.WRITE_COMMANDS.EXPORT_MULTI_LEVEL_TAGS_CSV, {
        policyID: policyID,
    });
    var fileName = 'MultiLevelTags.csv';
    var formData = new FormData();
    Object.entries(finalParameters).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        formData.append(key, String(value));
    });
    (0, fileDownload_1.default)(ApiUtils.getCommandURL({ command: types_1.WRITE_COMMANDS.EXPORT_MULTI_LEVEL_TAGS_CSV }), fileName, '', false, formData, CONST_1.default.NETWORK.METHOD.POST, onDownloadFailed);
}
function getPolicyTagsData(policyID) {
    var _a;
    return (_a = allPolicyTags === null || allPolicyTags === void 0 ? void 0 : allPolicyTags["".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID)]) !== null && _a !== void 0 ? _a : {};
}
