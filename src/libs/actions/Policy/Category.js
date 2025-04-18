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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.setWorkspaceRequiresCategory = exports.setWorkspaceCategoryEnabled = exports.setWorkspaceCategoryDescriptionHint = exports.setPolicyCustomUnitDefaultCategory = exports.setPolicyCategoryTax = exports.setPolicyCategoryReceiptsRequired = exports.setPolicyCategoryPayrollCode = exports.setPolicyCategoryMaxAmount = exports.setPolicyCategoryGLCode = exports.setPolicyCategoryDescriptionRequired = exports.setPolicyCategoryApprover = exports.renamePolicyCategory = exports.removePolicyCategoryReceiptsRequired = exports.openPolicyCategoriesPage = exports.importPolicyCategories = exports.getPolicyCategoriesData = exports.getPolicyCategories = exports.enablePolicyCategories = exports.downloadCategoriesCSV = exports.deleteWorkspaceCategories = exports.createPolicyCategory = exports.clearCategoryErrors = exports.buildOptimisticPolicyRecentlyUsedCategories = exports.buildOptimisticMccGroup = exports.buildOptimisticPolicyCategories = void 0;
var cloneDeep_1 = require("lodash/cloneDeep");
var union_1 = require("lodash/union");
var react_native_onyx_1 = require("react-native-onyx");
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var ApiUtils = require("@libs/ApiUtils");
var CategoryUtils = require("@libs/CategoryUtils");
var CurrencyUtils = require("@libs/CurrencyUtils");
var ErrorUtils = require("@libs/ErrorUtils");
var fileDownload_1 = require("@libs/fileDownload");
var getIsNarrowLayout_1 = require("@libs/getIsNarrowLayout");
var Localize_1 = require("@libs/Localize");
var Log_1 = require("@libs/Log");
var enhanceParameters_1 = require("@libs/Network/enhanceParameters");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var RequestConflictUtils_1 = require("@userActions/RequestConflictUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var allPolicies = {};
react_native_onyx_1["default"].connect({
    key: ONYXKEYS_1["default"].COLLECTION.POLICY,
    callback: function (val, key) {
        if (!key) {
            return;
        }
        if (val === null || val === undefined) {
            // If we are deleting a policy, we have to check every report linked to that policy
            // and unset the draft indicator (pencil icon) alongside removing any draft comments. Clearing these values will keep the newly archived chats from being displayed in the LHN.
            // More info: https://github.com/Expensify/App/issues/14260
            var policyID = key.replace(ONYXKEYS_1["default"].COLLECTION.POLICY, '');
            var policyReports = ReportUtils_1.getAllPolicyReports(policyID);
            var cleanUpMergeQueries = {};
            var cleanUpSetQueries_1 = {};
            policyReports.forEach(function (policyReport) {
                if (!policyReport) {
                    return;
                }
                var reportID = policyReport.reportID;
                cleanUpSetQueries_1["" + ONYXKEYS_1["default"].COLLECTION.REPORT_DRAFT_COMMENT + reportID] = null;
                cleanUpSetQueries_1["" + ONYXKEYS_1["default"].COLLECTION.REPORT_ACTIONS_DRAFTS + reportID] = null;
            });
            react_native_onyx_1["default"].mergeCollection(ONYXKEYS_1["default"].COLLECTION.REPORT, cleanUpMergeQueries);
            react_native_onyx_1["default"].multiSet(cleanUpSetQueries_1);
            delete allPolicies[key];
            return;
        }
        allPolicies[key] = val;
    }
});
var allRecentlyUsedCategories = {};
react_native_onyx_1["default"].connect({
    key: ONYXKEYS_1["default"].COLLECTION.POLICY_RECENTLY_USED_CATEGORIES,
    waitForCollectionCallback: true,
    callback: function (val) { return (allRecentlyUsedCategories = val); }
});
var allPolicyCategories = {};
react_native_onyx_1["default"].connect({
    key: ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES,
    waitForCollectionCallback: true,
    callback: function (val) { return (allPolicyCategories = val); }
});
function buildOptimisticPolicyCategories(policyID, categories) {
    var optimisticCategoryMap = categories.reduce(function (acc, category) {
        acc[category] = {
            name: category,
            enabled: true,
            errors: null,
            pendingAction: CONST_1["default"].RED_BRICK_ROAD_PENDING_ACTION.ADD
        };
        return acc;
    }, {});
    var successCategoryMap = categories.reduce(function (acc, category) {
        acc[category] = {
            errors: null,
            pendingAction: null
        };
        return acc;
    }, {});
    var failureCategoryMap = categories.reduce(function (acc, category) {
        acc[category] = {
            errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.categories.createFailureMessage')
        };
        return acc;
    }, {});
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID,
                value: optimisticCategoryMap
            },
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.SET,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES_DRAFT + policyID,
                value: null
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID,
                value: successCategoryMap
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID,
                value: failureCategoryMap
            },
        ]
    };
    return onyxData;
}
exports.buildOptimisticPolicyCategories = buildOptimisticPolicyCategories;
function buildOptimisticMccGroup() {
    var optimisticMccGroup = {
        mccGroup: {
            airlines: {
                category: CONST_1["default"].POLICY.DEFAULT_CATEGORIES.TRAVEL,
                groupID: 'airlines',
                pendingAction: CONST_1["default"].RED_BRICK_ROAD_PENDING_ACTION.ADD
            },
            commuter: {
                category: CONST_1["default"].POLICY.DEFAULT_CATEGORIES.CAR,
                groupID: 'commuter',
                pendingAction: CONST_1["default"].RED_BRICK_ROAD_PENDING_ACTION.ADD
            },
            gas: {
                category: CONST_1["default"].POLICY.DEFAULT_CATEGORIES.CAR,
                groupID: 'gas',
                pendingAction: CONST_1["default"].RED_BRICK_ROAD_PENDING_ACTION.ADD
            },
            goods: {
                category: CONST_1["default"].POLICY.DEFAULT_CATEGORIES.MATERIALS,
                groupID: 'goods',
                pendingAction: CONST_1["default"].RED_BRICK_ROAD_PENDING_ACTION.ADD
            },
            groceries: {
                category: CONST_1["default"].POLICY.DEFAULT_CATEGORIES.MEALS_AND_ENTERTAINMENT,
                groupID: 'groceries',
                pendingAction: CONST_1["default"].RED_BRICK_ROAD_PENDING_ACTION.ADD
            },
            hotel: {
                category: CONST_1["default"].POLICY.DEFAULT_CATEGORIES.TRAVEL,
                groupID: 'hotel',
                pendingAction: CONST_1["default"].RED_BRICK_ROAD_PENDING_ACTION.ADD
            },
            mail: {
                category: CONST_1["default"].POLICY.DEFAULT_CATEGORIES.OFFICE_SUPPLIES,
                groupID: 'mail',
                pendingAction: CONST_1["default"].RED_BRICK_ROAD_PENDING_ACTION.ADD
            },
            meals: {
                category: CONST_1["default"].POLICY.DEFAULT_CATEGORIES.MEALS_AND_ENTERTAINMENT,
                groupID: 'meals',
                pendingAction: CONST_1["default"].RED_BRICK_ROAD_PENDING_ACTION.ADD
            },
            rental: {
                category: CONST_1["default"].POLICY.DEFAULT_CATEGORIES.TRAVEL,
                groupID: 'rental',
                pendingAction: CONST_1["default"].RED_BRICK_ROAD_PENDING_ACTION.ADD
            },
            services: {
                category: CONST_1["default"].POLICY.DEFAULT_CATEGORIES.PROFESSIONAL_SERVICES,
                groupID: 'services',
                pendingAction: CONST_1["default"].RED_BRICK_ROAD_PENDING_ACTION.ADD
            },
            taxi: {
                category: CONST_1["default"].POLICY.DEFAULT_CATEGORIES.TRAVEL,
                groupID: 'taxi',
                pendingAction: CONST_1["default"].RED_BRICK_ROAD_PENDING_ACTION.ADD
            },
            uncategorized: {
                category: CONST_1["default"].POLICY.DEFAULT_CATEGORIES.OTHER,
                groupID: 'uncategorized',
                pendingAction: CONST_1["default"].RED_BRICK_ROAD_PENDING_ACTION.ADD
            },
            utilities: {
                category: CONST_1["default"].POLICY.DEFAULT_CATEGORIES.UTILITIES,
                groupID: 'utilities',
                pendingAction: CONST_1["default"].RED_BRICK_ROAD_PENDING_ACTION.ADD
            }
        }
    };
    var successMccGroup = { mccGroup: {} };
    Object.keys(optimisticMccGroup.mccGroup).forEach(function (key) { return (successMccGroup.mccGroup[key] = { pendingAction: null }); });
    var mccGroupData = {
        optimisticData: optimisticMccGroup,
        successData: successMccGroup,
        failureData: { mccGroup: null }
    };
    return mccGroupData;
}
exports.buildOptimisticMccGroup = buildOptimisticMccGroup;
function updateImportSpreadsheetData(categoriesLength) {
    var onyxData = {
        successData: [
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: ONYXKEYS_1["default"].IMPORTED_SPREADSHEET,
                value: {
                    shouldFinalModalBeOpened: true,
                    importFinalModal: {
                        title: Localize_1.translateLocal('spreadsheet.importSuccessfullTitle'),
                        prompt: Localize_1.translateLocal('spreadsheet.importCategoriesSuccessfullDescription', { categories: categoriesLength })
                    }
                }
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: ONYXKEYS_1["default"].IMPORTED_SPREADSHEET,
                value: {
                    shouldFinalModalBeOpened: true,
                    importFinalModal: { title: Localize_1.translateLocal('spreadsheet.importFailedTitle'), prompt: Localize_1.translateLocal('spreadsheet.importFailedDescription') }
                }
            },
        ]
    };
    return onyxData;
}
function openPolicyCategoriesPage(policyID) {
    if (!policyID) {
        Log_1["default"].warn('openPolicyCategoriesPage invalid params', { policyID: policyID });
        return;
    }
    var params = {
        policyID: policyID
    };
    API.read(types_1.READ_COMMANDS.OPEN_POLICY_CATEGORIES_PAGE, params);
}
exports.openPolicyCategoriesPage = openPolicyCategoriesPage;
function getPolicyCategories(policyID) {
    if (!policyID || policyID === '-1' || policyID === CONST_1["default"].POLICY.ID_FAKE) {
        Log_1["default"].warn('GetPolicyCategories invalid params', { policyID: policyID });
        return;
    }
    var params = {
        policyID: policyID
    };
    API.read(types_1.READ_COMMANDS.GET_POLICY_CATEGORIES, params);
}
exports.getPolicyCategories = getPolicyCategories;
function buildOptimisticPolicyRecentlyUsedCategories(policyID, category) {
    var _a;
    if (!policyID || !category) {
        return [];
    }
    var policyRecentlyUsedCategories = (_a = allRecentlyUsedCategories === null || allRecentlyUsedCategories === void 0 ? void 0 : allRecentlyUsedCategories["" + ONYXKEYS_1["default"].COLLECTION.POLICY_RECENTLY_USED_CATEGORIES + policyID]) !== null && _a !== void 0 ? _a : [];
    return union_1["default"]([category], policyRecentlyUsedCategories);
}
exports.buildOptimisticPolicyRecentlyUsedCategories = buildOptimisticPolicyRecentlyUsedCategories;
function setWorkspaceCategoryEnabled(policyID, categoriesToUpdate) {
    var _a, _b, _c, _d;
    var policyCategories = (_a = allPolicyCategories === null || allPolicyCategories === void 0 ? void 0 : allPolicyCategories["" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID]) !== null && _a !== void 0 ? _a : {};
    var policy = allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["" + ONYXKEYS_1["default"].COLLECTION.POLICY + policyID];
    var optimisticPolicyCategoriesData = __assign({}, Object.keys(categoriesToUpdate).reduce(function (acc, key) {
        acc[key] = __assign(__assign({}, categoriesToUpdate[key]), { errors: null, pendingFields: {
                enabled: CONST_1["default"].RED_BRICK_ROAD_PENDING_ACTION.UPDATE
            }, pendingAction: CONST_1["default"].RED_BRICK_ROAD_PENDING_ACTION.UPDATE });
        return acc;
    }, {}));
    var shouldDisableRequiresCategory = !OptionsListUtils_1.hasEnabledOptions(__assign(__assign({}, policyCategories), optimisticPolicyCategoriesData));
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID,
                value: optimisticPolicyCategoriesData
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID,
                value: __assign({}, Object.keys(categoriesToUpdate).reduce(function (acc, key) {
                    acc[key] = {
                        errors: null,
                        pendingFields: {
                            enabled: null
                        },
                        pendingAction: null
                    };
                    return acc;
                }, {}))
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID,
                value: __assign({}, Object.keys(categoriesToUpdate).reduce(function (acc, key) {
                    acc[key] = __assign(__assign({}, policyCategories[key]), { errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.categories.updateFailureMessage'), pendingFields: {
                            enabled: null
                        }, pendingAction: null });
                    return acc;
                }, {}))
            },
        ]
    };
    if (shouldDisableRequiresCategory) {
        (_b = onyxData.optimisticData) === null || _b === void 0 ? void 0 : _b.push({
            onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
            key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY + policyID,
            value: {
                requiresCategory: false,
                pendingFields: {
                    requiresCategory: CONST_1["default"].RED_BRICK_ROAD_PENDING_ACTION.UPDATE
                }
            }
        });
        (_c = onyxData.successData) === null || _c === void 0 ? void 0 : _c.push({
            onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
            key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY + policyID,
            value: {
                pendingFields: {
                    requiresCategory: null
                }
            }
        });
        (_d = onyxData.failureData) === null || _d === void 0 ? void 0 : _d.push({
            onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
            key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY + policyID,
            value: {
                requiresCategory: policy === null || policy === void 0 ? void 0 : policy.requiresCategory,
                pendingFields: {
                    requiresCategory: null
                }
            }
        });
    }
    var parameters = {
        policyID: policyID,
        categories: JSON.stringify(Object.keys(categoriesToUpdate).map(function (key) { return categoriesToUpdate[key]; }))
    };
    API.write(types_1.WRITE_COMMANDS.SET_WORKSPACE_CATEGORIES_ENABLED, parameters, onyxData);
}
exports.setWorkspaceCategoryEnabled = setWorkspaceCategoryEnabled;
function setPolicyCategoryDescriptionRequired(policyID, categoryName, areCommentsRequired) {
    var _a, _b, _c;
    var _d, _e, _f;
    var policyCategoryToUpdate = (_d = allPolicyCategories === null || allPolicyCategories === void 0 ? void 0 : allPolicyCategories["" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID]) === null || _d === void 0 ? void 0 : _d[categoryName];
    var originalAreCommentsRequired = policyCategoryToUpdate === null || policyCategoryToUpdate === void 0 ? void 0 : policyCategoryToUpdate.areCommentsRequired;
    var originalCommentHint = policyCategoryToUpdate === null || policyCategoryToUpdate === void 0 ? void 0 : policyCategoryToUpdate.commentHint;
    // When areCommentsRequired is set to false, commentHint has to be reset
    var updatedCommentHint = areCommentsRequired ? (_f = (_e = allPolicyCategories === null || allPolicyCategories === void 0 ? void 0 : allPolicyCategories["" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID]) === null || _e === void 0 ? void 0 : _e[categoryName]) === null || _f === void 0 ? void 0 : _f.commentHint : '';
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID,
                value: (_a = {},
                    _a[categoryName] = {
                        pendingAction: CONST_1["default"].RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        pendingFields: {
                            areCommentsRequired: CONST_1["default"].RED_BRICK_ROAD_PENDING_ACTION.UPDATE
                        },
                        areCommentsRequired: areCommentsRequired,
                        commentHint: updatedCommentHint
                    },
                    _a)
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID,
                value: (_b = {},
                    _b[categoryName] = {
                        pendingAction: null,
                        pendingFields: {
                            areCommentsRequired: null
                        },
                        areCommentsRequired: areCommentsRequired,
                        commentHint: updatedCommentHint
                    },
                    _b)
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID,
                value: (_c = {},
                    _c[categoryName] = {
                        errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                        pendingAction: null,
                        pendingFields: {
                            areCommentsRequired: null
                        },
                        areCommentsRequired: originalAreCommentsRequired,
                        commentHint: originalCommentHint
                    },
                    _c)
            },
        ]
    };
    var parameters = {
        policyID: policyID,
        categoryName: categoryName,
        areCommentsRequired: areCommentsRequired
    };
    API.write(types_1.WRITE_COMMANDS.SET_POLICY_CATEGORY_DESCRIPTION_REQUIRED, parameters, onyxData);
}
exports.setPolicyCategoryDescriptionRequired = setPolicyCategoryDescriptionRequired;
function setPolicyCategoryReceiptsRequired(policyID, categoryName, maxAmountNoReceipt) {
    var _a, _b, _c;
    var _d, _e;
    var originalMaxAmountNoReceipt = (_e = (_d = allPolicyCategories === null || allPolicyCategories === void 0 ? void 0 : allPolicyCategories["" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID]) === null || _d === void 0 ? void 0 : _d[categoryName]) === null || _e === void 0 ? void 0 : _e.maxAmountNoReceipt;
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID,
                value: (_a = {},
                    _a[categoryName] = {
                        pendingAction: CONST_1["default"].RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        pendingFields: {
                            maxAmountNoReceipt: CONST_1["default"].RED_BRICK_ROAD_PENDING_ACTION.UPDATE
                        },
                        maxAmountNoReceipt: maxAmountNoReceipt
                    },
                    _a)
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID,
                value: (_b = {},
                    _b[categoryName] = {
                        pendingAction: null,
                        pendingFields: {
                            maxAmountNoReceipt: null
                        },
                        maxAmountNoReceipt: maxAmountNoReceipt
                    },
                    _b)
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID,
                value: (_c = {},
                    _c[categoryName] = {
                        errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                        pendingAction: null,
                        pendingFields: {
                            maxAmountNoReceipt: null
                        },
                        maxAmountNoReceipt: originalMaxAmountNoReceipt
                    },
                    _c)
            },
        ]
    };
    var parameters = {
        policyID: policyID,
        categoryName: categoryName,
        maxExpenseAmountNoReceipt: maxAmountNoReceipt
    };
    API.write(types_1.WRITE_COMMANDS.SET_POLICY_CATEGORY_RECEIPTS_REQUIRED, parameters, onyxData);
}
exports.setPolicyCategoryReceiptsRequired = setPolicyCategoryReceiptsRequired;
function removePolicyCategoryReceiptsRequired(policyID, categoryName) {
    var _a, _b, _c;
    var _d, _e;
    var originalMaxAmountNoReceipt = (_e = (_d = allPolicyCategories === null || allPolicyCategories === void 0 ? void 0 : allPolicyCategories["" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID]) === null || _d === void 0 ? void 0 : _d[categoryName]) === null || _e === void 0 ? void 0 : _e.maxAmountNoReceipt;
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID,
                value: (_a = {},
                    _a[categoryName] = {
                        pendingAction: CONST_1["default"].RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        pendingFields: {
                            maxAmountNoReceipt: CONST_1["default"].RED_BRICK_ROAD_PENDING_ACTION.UPDATE
                        },
                        maxAmountNoReceipt: null
                    },
                    _a)
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID,
                value: (_b = {},
                    _b[categoryName] = {
                        pendingAction: null,
                        pendingFields: {
                            maxAmountNoReceipt: null
                        },
                        maxAmountNoReceipt: null
                    },
                    _b)
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID,
                value: (_c = {},
                    _c[categoryName] = {
                        errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                        pendingAction: null,
                        pendingFields: {
                            maxAmountNoReceipt: null
                        },
                        maxAmountNoReceipt: originalMaxAmountNoReceipt
                    },
                    _c)
            },
        ]
    };
    var parameters = {
        policyID: policyID,
        categoryName: categoryName
    };
    API.write(types_1.WRITE_COMMANDS.REMOVE_POLICY_CATEGORY_RECEIPTS_REQUIRED, parameters, onyxData);
}
exports.removePolicyCategoryReceiptsRequired = removePolicyCategoryReceiptsRequired;
function createPolicyCategory(policyID, categoryName) {
    var onyxData = buildOptimisticPolicyCategories(policyID, [categoryName]);
    var parameters = {
        policyID: policyID,
        categories: JSON.stringify([{ name: categoryName }])
    };
    API.write(types_1.WRITE_COMMANDS.CREATE_WORKSPACE_CATEGORIES, parameters, onyxData);
}
exports.createPolicyCategory = createPolicyCategory;
function importPolicyCategories(policyID, categories) {
    var uniqueCategories = categories.reduce(function (acc, category) {
        if (!category.name) {
            return acc;
        }
        acc[category.name] = category;
        return acc;
    }, {});
    var categoriesLength = Object.keys(uniqueCategories).length;
    var onyxData = updateImportSpreadsheetData(categoriesLength);
    var parameters = {
        policyID: policyID,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        categories: JSON.stringify(__spreadArrays(categories.map(function (category) { return ({ name: category.name, enabled: category.enabled, 'GL Code': String(category['GL Code']) }); })))
    };
    API.write(types_1.WRITE_COMMANDS.IMPORT_CATEGORIES_SPREADSHEET, parameters, onyxData);
}
exports.importPolicyCategories = importPolicyCategories;
function renamePolicyCategory(policyID, policyCategory) {
    var _a, _b, _c, _d;
    var _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
    var policy = PolicyUtils_1.getPolicy(policyID);
    var policyCategoryToUpdate = (_e = allPolicyCategories === null || allPolicyCategories === void 0 ? void 0 : allPolicyCategories["" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID]) === null || _e === void 0 ? void 0 : _e[policyCategory.oldName];
    var policyCategoryApproverRule = CategoryUtils.getCategoryApproverRule((_g = (_f = policy === null || policy === void 0 ? void 0 : policy.rules) === null || _f === void 0 ? void 0 : _f.approvalRules) !== null && _g !== void 0 ? _g : [], policyCategory.oldName);
    var policyCategoryExpenseRule = CategoryUtils.getCategoryExpenseRule((_j = (_h = policy === null || policy === void 0 ? void 0 : policy.rules) === null || _h === void 0 ? void 0 : _h.expenseRules) !== null && _j !== void 0 ? _j : [], policyCategory.oldName);
    var approvalRules = (_l = (_k = policy === null || policy === void 0 ? void 0 : policy.rules) === null || _k === void 0 ? void 0 : _k.approvalRules) !== null && _l !== void 0 ? _l : [];
    var expenseRules = (_o = (_m = policy === null || policy === void 0 ? void 0 : policy.rules) === null || _m === void 0 ? void 0 : _m.expenseRules) !== null && _o !== void 0 ? _o : [];
    var mccGroup = (_p = policy === null || policy === void 0 ? void 0 : policy.mccGroup) !== null && _p !== void 0 ? _p : {};
    var updatedApprovalRules = cloneDeep_1["default"](approvalRules);
    var updatedExpenseRules = cloneDeep_1["default"](expenseRules);
    var clonedMccGroup = cloneDeep_1["default"](mccGroup);
    var updatedMccGroup = CategoryUtils.updateCategoryInMccGroup(clonedMccGroup, policyCategory.oldName, policyCategory.newName);
    var updatedMccGroupWithClearedPendingAction = CategoryUtils.updateCategoryInMccGroup(clonedMccGroup, policyCategory.oldName, policyCategory.newName, true);
    if (policyCategoryExpenseRule) {
        var ruleIndex = updatedExpenseRules.findIndex(function (rule) { return rule.id === policyCategoryExpenseRule.id; });
        policyCategoryExpenseRule.applyWhen = policyCategoryExpenseRule.applyWhen.map(function (applyWhen) { return (__assign(__assign({}, applyWhen), (applyWhen.field === CONST_1["default"].POLICY.FIELDS.CATEGORY && applyWhen.value === policyCategory.oldName && { value: policyCategory.newName }))); });
        updatedExpenseRules[ruleIndex] = policyCategoryExpenseRule;
    }
    // Its related by name, so the corresponding rule has to be updated to handle offline scenario
    if (policyCategoryApproverRule) {
        var indexToUpdate = updatedApprovalRules.findIndex(function (rule) { return rule.id === policyCategoryApproverRule.id; });
        policyCategoryApproverRule.applyWhen = policyCategoryApproverRule.applyWhen.map(function (ruleCondition) {
            var value = ruleCondition.value, field = ruleCondition.field, condition = ruleCondition.condition;
            if (value === policyCategory.oldName && field === CONST_1["default"].POLICY.FIELDS.CATEGORY && condition === CONST_1["default"].POLICY.RULE_CONDITIONS.MATCHES) {
                return __assign(__assign({}, ruleCondition), { value: policyCategory.newName });
            }
            return ruleCondition;
        });
        updatedApprovalRules[indexToUpdate] = policyCategoryApproverRule;
    }
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID,
                value: (_a = {},
                    _a[policyCategory.oldName] = null,
                    _a[policyCategory.newName] = __assign(__assign({}, policyCategoryToUpdate), { errors: null, name: policyCategory.newName, pendingAction: CONST_1["default"].RED_BRICK_ROAD_PENDING_ACTION.UPDATE, pendingFields: __assign(__assign({}, ((_q = policyCategoryToUpdate === null || policyCategoryToUpdate === void 0 ? void 0 : policyCategoryToUpdate.pendingFields) !== null && _q !== void 0 ? _q : {})), { name: CONST_1["default"].RED_BRICK_ROAD_PENDING_ACTION.UPDATE }), previousCategoryName: policyCategory.oldName }),
                    _a)
            },
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY + policyID,
                value: {
                    rules: {
                        approvalRules: updatedApprovalRules,
                        expenseRules: updatedExpenseRules
                    },
                    mccGroup: updatedMccGroup
                }
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY + policyID,
                value: {
                    mccGroup: updatedMccGroupWithClearedPendingAction
                }
            },
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID,
                value: (_b = {},
                    _b[policyCategory.newName] = {
                        pendingAction: null,
                        pendingFields: {
                            name: null
                        }
                    },
                    _b)
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID,
                value: (_c = {},
                    _c[policyCategory.newName] = null,
                    _c[policyCategory.oldName] = __assign(__assign({}, policyCategoryToUpdate), { errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.categories.updateFailureMessage') }),
                    _c)
            },
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY + policyID,
                value: {
                    rules: {
                        approvalRules: approvalRules
                    },
                    mccGroup: mccGroup
                }
            },
        ]
    };
    var parameters = {
        policyID: policyID,
        categories: JSON.stringify((_d = {}, _d[policyCategory.oldName] = policyCategory.newName, _d))
    };
    API.write(types_1.WRITE_COMMANDS.RENAME_WORKSPACE_CATEGORY, parameters, onyxData);
}
exports.renamePolicyCategory = renamePolicyCategory;
function setPolicyCategoryPayrollCode(policyID, categoryName, payrollCode) {
    var _a, _b, _c;
    var _d, _e;
    var policyCategoryToUpdate = (_e = (_d = allPolicyCategories === null || allPolicyCategories === void 0 ? void 0 : allPolicyCategories["" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID]) === null || _d === void 0 ? void 0 : _d[categoryName]) !== null && _e !== void 0 ? _e : {};
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID,
                value: (_a = {},
                    _a[categoryName] = __assign(__assign({}, policyCategoryToUpdate), { pendingAction: CONST_1["default"].RED_BRICK_ROAD_PENDING_ACTION.UPDATE, pendingFields: {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            'Payroll Code': CONST_1["default"].RED_BRICK_ROAD_PENDING_ACTION.UPDATE
                        }, 
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        'Payroll Code': payrollCode }),
                    _a)
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID,
                value: (_b = {},
                    _b[categoryName] = __assign(__assign({}, policyCategoryToUpdate), { pendingAction: null, pendingFields: {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            'Payroll Code': null
                        }, 
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        'Payroll Code': payrollCode }),
                    _b)
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID,
                value: (_c = {},
                    _c[categoryName] = __assign(__assign({}, policyCategoryToUpdate), { errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.categories.updatePayrollCodeFailureMessage'), pendingAction: null, pendingFields: {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            'Payroll Code': null
                        } }),
                    _c)
            },
        ]
    };
    var parameters = {
        policyID: policyID,
        categoryName: categoryName,
        payrollCode: payrollCode
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_POLICY_CATEGORY_PAYROLL_CODE, parameters, onyxData);
}
exports.setPolicyCategoryPayrollCode = setPolicyCategoryPayrollCode;
function setPolicyCategoryGLCode(policyID, categoryName, glCode) {
    var _a, _b, _c;
    var _d, _e;
    var policyCategoryToUpdate = (_e = (_d = allPolicyCategories === null || allPolicyCategories === void 0 ? void 0 : allPolicyCategories["" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID]) === null || _d === void 0 ? void 0 : _d[categoryName]) !== null && _e !== void 0 ? _e : {};
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID,
                value: (_a = {},
                    _a[categoryName] = __assign(__assign({}, policyCategoryToUpdate), { pendingAction: CONST_1["default"].RED_BRICK_ROAD_PENDING_ACTION.UPDATE, pendingFields: {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            'GL Code': CONST_1["default"].RED_BRICK_ROAD_PENDING_ACTION.UPDATE
                        }, 
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        'GL Code': glCode }),
                    _a)
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID,
                value: (_b = {},
                    _b[categoryName] = __assign(__assign({}, policyCategoryToUpdate), { pendingAction: null, pendingFields: {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            'GL Code': null
                        }, 
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        'GL Code': glCode }),
                    _b)
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID,
                value: (_c = {},
                    _c[categoryName] = __assign(__assign({}, policyCategoryToUpdate), { errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.categories.updateGLCodeFailureMessage'), pendingAction: null, pendingFields: {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            'GL Code': null
                        } }),
                    _c)
            },
        ]
    };
    var parameters = {
        policyID: policyID,
        categoryName: categoryName,
        glCode: glCode
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_POLICY_CATEGORY_GL_CODE, parameters, onyxData);
}
exports.setPolicyCategoryGLCode = setPolicyCategoryGLCode;
function setWorkspaceRequiresCategory(policyID, requiresCategory) {
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY + policyID,
                value: {
                    requiresCategory: requiresCategory,
                    errors: {
                        requiresCategory: null
                    },
                    pendingFields: {
                        requiresCategory: CONST_1["default"].RED_BRICK_ROAD_PENDING_ACTION.UPDATE
                    }
                }
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY + policyID,
                value: {
                    errors: {
                        requiresCategory: null
                    },
                    pendingFields: {
                        requiresCategory: null
                    }
                }
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY + policyID,
                value: {
                    requiresCategory: !requiresCategory,
                    errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.categories.updateFailureMessage'),
                    pendingFields: {
                        requiresCategory: null
                    }
                }
            },
        ]
    };
    var parameters = {
        policyID: policyID,
        requiresCategory: requiresCategory
    };
    API.write(types_1.WRITE_COMMANDS.SET_WORKSPACE_REQUIRES_CATEGORY, parameters, onyxData);
}
exports.setWorkspaceRequiresCategory = setWorkspaceRequiresCategory;
function clearCategoryErrors(policyID, categoryName) {
    var _a, _b;
    var _c;
    var category = (_c = allPolicyCategories === null || allPolicyCategories === void 0 ? void 0 : allPolicyCategories["" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID]) === null || _c === void 0 ? void 0 : _c[categoryName];
    if (!category) {
        return;
    }
    if (category.pendingAction === CONST_1["default"].RED_BRICK_ROAD_PENDING_ACTION.ADD) {
        react_native_onyx_1["default"].merge("" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID, (_a = {},
            _a[category.name] = null,
            _a));
        return;
    }
    react_native_onyx_1["default"].merge("" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID, (_b = {},
        _b[category.name] = {
            errors: null
        },
        _b));
}
exports.clearCategoryErrors = clearCategoryErrors;
function deleteWorkspaceCategories(policyID, categoryNamesToDelete) {
    var _a, _b, _c, _d;
    var policy = allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["" + ONYXKEYS_1["default"].COLLECTION.POLICY + policyID];
    var policyCategories = (_a = allPolicyCategories === null || allPolicyCategories === void 0 ? void 0 : allPolicyCategories["" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID]) !== null && _a !== void 0 ? _a : {};
    var optimisticPolicyCategoriesData = categoryNamesToDelete.reduce(function (acc, categoryName) {
        acc[categoryName] = { pendingAction: CONST_1["default"].RED_BRICK_ROAD_PENDING_ACTION.DELETE, enabled: false };
        return acc;
    }, {});
    var shouldDisableRequiresCategory = !OptionsListUtils_1.hasEnabledOptions(Object.values(policyCategories).filter(function (category) { return !categoryNamesToDelete.includes(category.name) && category.pendingAction !== CONST_1["default"].RED_BRICK_ROAD_PENDING_ACTION.DELETE; }));
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID,
                value: optimisticPolicyCategoriesData
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID,
                value: categoryNamesToDelete.reduce(function (acc, categoryName) {
                    acc[categoryName] = null;
                    return acc;
                }, {})
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID,
                value: categoryNamesToDelete.reduce(function (acc, categoryName) {
                    var _a;
                    acc[categoryName] = {
                        pendingAction: null,
                        errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.categories.deleteFailureMessage'),
                        enabled: !!((_a = policyCategories === null || policyCategories === void 0 ? void 0 : policyCategories[categoryName]) === null || _a === void 0 ? void 0 : _a.enabled)
                    };
                    return acc;
                }, {})
            },
        ]
    };
    if (shouldDisableRequiresCategory) {
        (_b = onyxData.optimisticData) === null || _b === void 0 ? void 0 : _b.push({
            onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
            key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY + policyID,
            value: {
                requiresCategory: false,
                pendingFields: {
                    requiresCategory: CONST_1["default"].RED_BRICK_ROAD_PENDING_ACTION.UPDATE
                }
            }
        });
        (_c = onyxData.successData) === null || _c === void 0 ? void 0 : _c.push({
            onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
            key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY + policyID,
            value: {
                pendingFields: {
                    requiresCategory: null
                }
            }
        });
        (_d = onyxData.failureData) === null || _d === void 0 ? void 0 : _d.push({
            onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
            key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY + policyID,
            value: {
                requiresCategory: policy === null || policy === void 0 ? void 0 : policy.requiresCategory,
                pendingFields: {
                    requiresCategory: null
                }
            }
        });
    }
    var parameters = {
        policyID: policyID,
        categories: JSON.stringify(categoryNamesToDelete)
    };
    API.write(types_1.WRITE_COMMANDS.DELETE_WORKSPACE_CATEGORIES, parameters, onyxData);
}
exports.deleteWorkspaceCategories = deleteWorkspaceCategories;
function enablePolicyCategories(policyID, enabled, shouldGoBack) {
    var _a, _b;
    if (shouldGoBack === void 0) { shouldGoBack = true; }
    var onyxUpdatesToDisableCategories = [];
    if (!enabled) {
        onyxUpdatesToDisableCategories.push({
            onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
            key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID,
            value: Object.fromEntries(Object.entries((_a = allPolicyCategories === null || allPolicyCategories === void 0 ? void 0 : allPolicyCategories["" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID]) !== null && _a !== void 0 ? _a : {}).map(function (_a) {
                var categoryName = _a[0];
                return [
                    categoryName,
                    {
                        enabled: false
                    },
                ];
            }))
        }, {
            onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
            key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY + policyID,
            value: {
                requiresCategory: false
            }
        });
    }
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY + policyID,
                value: {
                    areCategoriesEnabled: enabled,
                    pendingFields: {
                        areCategoriesEnabled: CONST_1["default"].RED_BRICK_ROAD_PENDING_ACTION.UPDATE
                    }
                }
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY + policyID,
                value: {
                    pendingFields: {
                        areCategoriesEnabled: null
                    }
                }
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY + policyID,
                value: {
                    areCategoriesEnabled: !enabled,
                    pendingFields: {
                        areCategoriesEnabled: null
                    }
                }
            },
        ]
    };
    if (onyxUpdatesToDisableCategories.length > 0) {
        (_b = onyxData.optimisticData) === null || _b === void 0 ? void 0 : _b.push.apply(_b, onyxUpdatesToDisableCategories);
    }
    var parameters = { policyID: policyID, enabled: enabled };
    API.write(types_1.WRITE_COMMANDS.ENABLE_POLICY_CATEGORIES, parameters, onyxData, {
        checkAndFixConflictingRequest: function (persistedRequests) { return RequestConflictUtils_1.resolveEnableFeatureConflicts(types_1.WRITE_COMMANDS.ENABLE_POLICY_CATEGORIES, persistedRequests, parameters); }
    });
    if (enabled && getIsNarrowLayout_1["default"]() && shouldGoBack) {
        PolicyUtils_1.goBackWhenEnableFeature(policyID);
    }
}
exports.enablePolicyCategories = enablePolicyCategories;
function setPolicyCustomUnitDefaultCategory(policyID, customUnitID, oldCategory, category) {
    var _a, _b, _c;
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
            key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY + policyID,
            value: {
                customUnits: (_a = {},
                    _a[customUnitID] = {
                        defaultCategory: category,
                        pendingFields: { defaultCategory: CONST_1["default"].RED_BRICK_ROAD_PENDING_ACTION.UPDATE }
                    },
                    _a)
            }
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
            key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY + policyID,
            value: {
                customUnits: (_b = {},
                    _b[customUnitID] = {
                        pendingFields: { defaultCategory: null }
                    },
                    _b)
            }
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
            key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY + policyID,
            value: {
                customUnits: (_c = {},
                    _c[customUnitID] = {
                        defaultCategory: oldCategory,
                        errorFields: { defaultCategory: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage') },
                        pendingFields: { defaultCategory: null }
                    },
                    _c)
            }
        },
    ];
    var params = {
        policyID: policyID,
        customUnitID: customUnitID,
        category: category
    };
    API.write(types_1.WRITE_COMMANDS.SET_CUSTOM_UNIT_DEFAULT_CATEGORY, params, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
exports.setPolicyCustomUnitDefaultCategory = setPolicyCustomUnitDefaultCategory;
function downloadCategoriesCSV(policyID, onDownloadFailed) {
    var finalParameters = enhanceParameters_1["default"](types_1.WRITE_COMMANDS.EXPORT_CATEGORIES_CSV, {
        policyID: policyID
    });
    var fileName = 'Categories.csv';
    var formData = new FormData();
    Object.entries(finalParameters).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        formData.append(key, String(value));
    });
    fileDownload_1["default"](ApiUtils.getCommandURL({ command: types_1.WRITE_COMMANDS.EXPORT_CATEGORIES_CSV }), fileName, '', false, formData, CONST_1["default"].NETWORK.METHOD.POST, onDownloadFailed);
}
exports.downloadCategoriesCSV = downloadCategoriesCSV;
function setWorkspaceCategoryDescriptionHint(policyID, categoryName, commentHint) {
    var _a, _b, _c;
    var _d, _e;
    var originalCommentHint = (_e = (_d = allPolicyCategories === null || allPolicyCategories === void 0 ? void 0 : allPolicyCategories["" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID]) === null || _d === void 0 ? void 0 : _d[categoryName]) === null || _e === void 0 ? void 0 : _e.commentHint;
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID,
                value: (_a = {},
                    _a[categoryName] = {
                        pendingAction: CONST_1["default"].RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        pendingFields: {
                            commentHint: CONST_1["default"].RED_BRICK_ROAD_PENDING_ACTION.UPDATE
                        },
                        commentHint: commentHint
                    },
                    _a)
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID,
                value: (_b = {},
                    _b[categoryName] = {
                        pendingAction: null,
                        pendingFields: {
                            commentHint: null
                        },
                        commentHint: commentHint
                    },
                    _b)
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID,
                value: (_c = {},
                    _c[categoryName] = {
                        errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                        pendingAction: null,
                        pendingFields: {
                            commentHint: null
                        },
                        commentHint: originalCommentHint
                    },
                    _c)
            },
        ]
    };
    var parameters = {
        policyID: policyID,
        categoryName: categoryName,
        commentHint: commentHint
    };
    API.write(types_1.WRITE_COMMANDS.SET_WORKSPACE_CATEGORY_DESCRIPTION_HINT, parameters, onyxData);
}
exports.setWorkspaceCategoryDescriptionHint = setWorkspaceCategoryDescriptionHint;
function setPolicyCategoryMaxAmount(policyID, categoryName, maxExpenseAmount, expenseLimitType) {
    var _a, _b, _c;
    var _d;
    var policyCategoryToUpdate = (_d = allPolicyCategories === null || allPolicyCategories === void 0 ? void 0 : allPolicyCategories["" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID]) === null || _d === void 0 ? void 0 : _d[categoryName];
    var originalMaxExpenseAmount = policyCategoryToUpdate === null || policyCategoryToUpdate === void 0 ? void 0 : policyCategoryToUpdate.maxExpenseAmount;
    var originalExpenseLimitType = policyCategoryToUpdate === null || policyCategoryToUpdate === void 0 ? void 0 : policyCategoryToUpdate.expenseLimitType;
    var parsedMaxExpenseAmount = maxExpenseAmount === '' ? null : CurrencyUtils.convertToBackendAmount(parseFloat(maxExpenseAmount));
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID,
                value: (_a = {},
                    _a[categoryName] = {
                        pendingAction: CONST_1["default"].RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        pendingFields: {
                            maxExpenseAmount: CONST_1["default"].RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            expenseLimitType: CONST_1["default"].RED_BRICK_ROAD_PENDING_ACTION.UPDATE
                        },
                        maxExpenseAmount: parsedMaxExpenseAmount,
                        expenseLimitType: expenseLimitType
                    },
                    _a)
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID,
                value: (_b = {},
                    _b[categoryName] = {
                        pendingAction: null,
                        pendingFields: {
                            maxExpenseAmount: null,
                            expenseLimitType: null
                        },
                        maxExpenseAmount: parsedMaxExpenseAmount,
                        expenseLimitType: expenseLimitType
                    },
                    _b)
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID,
                value: (_c = {},
                    _c[categoryName] = {
                        errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                        pendingAction: null,
                        pendingFields: {
                            maxExpenseAmount: null,
                            expenseLimitType: null
                        },
                        maxExpenseAmount: originalMaxExpenseAmount,
                        expenseLimitType: originalExpenseLimitType
                    },
                    _c)
            },
        ]
    };
    var parameters = {
        policyID: policyID,
        categoryName: categoryName,
        maxExpenseAmount: parsedMaxExpenseAmount,
        expenseLimitType: expenseLimitType
    };
    API.write(types_1.WRITE_COMMANDS.SET_POLICY_CATEGORY_MAX_AMOUNT, parameters, onyxData);
}
exports.setPolicyCategoryMaxAmount = setPolicyCategoryMaxAmount;
function setPolicyCategoryApprover(policyID, categoryName, approver) {
    var _a, _b;
    var policy = allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["" + ONYXKEYS_1["default"].COLLECTION.POLICY + policyID];
    var approvalRules = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.rules) === null || _a === void 0 ? void 0 : _a.approvalRules) !== null && _b !== void 0 ? _b : [];
    var updatedApprovalRules = cloneDeep_1["default"](approvalRules);
    var existingCategoryApproverRule = CategoryUtils.getCategoryApproverRule(updatedApprovalRules, categoryName);
    var newApprover = approver;
    if (!existingCategoryApproverRule) {
        updatedApprovalRules.push({
            approver: approver,
            applyWhen: [
                {
                    condition: CONST_1["default"].POLICY.RULE_CONDITIONS.MATCHES,
                    field: 'category',
                    value: categoryName
                },
            ]
        });
    }
    else if ((existingCategoryApproverRule === null || existingCategoryApproverRule === void 0 ? void 0 : existingCategoryApproverRule.approver) === approver) {
        updatedApprovalRules = updatedApprovalRules.filter(function (rule) { return rule.approver !== approver; });
        newApprover = '';
    }
    else {
        var indexToUpdate = updatedApprovalRules.indexOf(existingCategoryApproverRule);
        var approvalRule = updatedApprovalRules.at(indexToUpdate);
        if (approvalRule && indexToUpdate !== -1) {
            approvalRule.approver = approver;
        }
    }
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY + policyID,
                value: {
                    rules: {
                        approvalRules: updatedApprovalRules
                    }
                }
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY + policyID,
                value: {
                    rules: {
                        approvalRules: approvalRules
                    }
                }
            },
        ]
    };
    var parameters = {
        policyID: policyID,
        categoryName: categoryName,
        approver: newApprover
    };
    API.write(types_1.WRITE_COMMANDS.SET_POLICY_CATEGORY_APPROVER, parameters, onyxData);
}
exports.setPolicyCategoryApprover = setPolicyCategoryApprover;
function setPolicyCategoryTax(policyID, categoryName, taxID) {
    var _a, _b;
    var policy = PolicyUtils_1.getPolicy(policyID);
    var expenseRules = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.rules) === null || _a === void 0 ? void 0 : _a.expenseRules) !== null && _b !== void 0 ? _b : [];
    var updatedExpenseRules = cloneDeep_1["default"](expenseRules);
    var existingCategoryExpenseRule = updatedExpenseRules.find(function (rule) { return rule.applyWhen.some(function (when) { return when.value === categoryName; }); });
    if (!existingCategoryExpenseRule) {
        updatedExpenseRules.push({
            tax: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                field_id_TAX: {
                    externalID: taxID
                }
            },
            applyWhen: [
                {
                    condition: CONST_1["default"].POLICY.RULE_CONDITIONS.MATCHES,
                    field: 'category',
                    value: categoryName
                },
            ]
        });
    }
    else {
        var indexToUpdate = updatedExpenseRules.indexOf(existingCategoryExpenseRule);
        var expenseRule = updatedExpenseRules.at(indexToUpdate);
        if (expenseRule && indexToUpdate !== -1) {
            expenseRule.tax.field_id_TAX.externalID = taxID;
        }
    }
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY + policyID,
                value: {
                    rules: {
                        expenseRules: updatedExpenseRules
                    }
                }
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1["default"].METHOD.MERGE,
                key: "" + ONYXKEYS_1["default"].COLLECTION.POLICY + policyID,
                value: {
                    rules: {
                        expenseRules: expenseRules
                    }
                }
            },
        ]
    };
    var parameters = {
        policyID: policyID,
        categoryName: categoryName,
        taxID: taxID
    };
    API.write(types_1.WRITE_COMMANDS.SET_POLICY_CATEGORY_TAX, parameters, onyxData);
}
exports.setPolicyCategoryTax = setPolicyCategoryTax;
function getPolicyCategoriesData(policyID) {
    var _a;
    return (_a = allPolicyCategories === null || allPolicyCategories === void 0 ? void 0 : allPolicyCategories["" + ONYXKEYS_1["default"].COLLECTION.POLICY_CATEGORIES + policyID]) !== null && _a !== void 0 ? _a : {};
}
exports.getPolicyCategoriesData = getPolicyCategoriesData;
