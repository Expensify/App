
var __assign =
    (this && this.__assign) ||
    function () {
        __assign =
            Object.assign ||
            function (t) {
                for (var s, i = 1, n = arguments.length; i < n; i++) {
                    s = arguments[i];
                    for (const p in s) {if (Object.prototype.hasOwnProperty.call(s, p)) {t[p] = s[p];}}
                }
                return t;
            };
        return __assign.apply(this, arguments);
    };
const __spreadArrays =
    (this && this.__spreadArrays) ||
    function () {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) {s += arguments[i].length;}
        for (var r = Array(s), k = 0, i = 0; i < il; i++) {for (let a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++) {r[k] = a[j];}}
        return r;
    };
exports.__esModule = true;
exports.getPolicyTagsData =
    exports.downloadTagsCSV =
    exports.importPolicyTags =
    exports.setPolicyTagApprover =
    exports.setPolicyTagGLCode =
    exports.setWorkspaceTagEnabled =
    exports.renamePolicyTaglist =
    exports.renamePolicyTag =
    exports.openPolicyTagsPage =
    exports.enablePolicyTags =
    exports.deletePolicyTags =
    exports.clearPolicyTagListErrorField =
    exports.clearPolicyTagListErrors =
    exports.clearPolicyTagErrors =
    exports.createPolicyTag =
    exports.setPolicyTagsRequired =
    exports.setPolicyRequiresTag =
    exports.buildOptimisticPolicyRecentlyUsedTags =
        void 0;
const cloneDeep_1 = require('lodash/cloneDeep');
const react_native_onyx_1 = require('react-native-onyx');
const API = require('@libs/API');
const types_1 = require('@libs/API/types');
const ApiUtils = require('@libs/ApiUtils');
const ErrorUtils = require('@libs/ErrorUtils');
const fileDownload_1 = require('@libs/fileDownload');
const getIsNarrowLayout_1 = require('@libs/getIsNarrowLayout');
const Localize_1 = require('@libs/Localize');
const Log_1 = require('@libs/Log');
const enhanceParameters_1 = require('@libs/Network/enhanceParameters');
const OptionsListUtils = require('@libs/OptionsListUtils');
const PolicyUtils = require('@libs/PolicyUtils');
const PolicyUtils_1 = require('@libs/PolicyUtils');
const ReportUtils = require('@libs/ReportUtils');
const TransactionUtils_1 = require('@libs/TransactionUtils');
const RequestConflictUtils_1 = require('@userActions/RequestConflictUtils');
const CONST_1 = require('@src/CONST');
const ONYXKEYS_1 = require('@src/ONYXKEYS');

const allPolicies = {};
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].COLLECTION.POLICY,
    callback (val, key) {
        if (!key) {
            return;
        }
        if (val === null || val === undefined) {
            // If we are deleting a policy, we have to check every report linked to that policy
            // and unset the draft indicator (pencil icon) alongside removing any draft comments. Clearing these values will keep the newly archived chats from being displayed in the LHN.
            // More info: https://github.com/Expensify/App/issues/14260
            const policyID = key.replace(ONYXKEYS_1['default'].COLLECTION.POLICY, '');
            const policyReports = ReportUtils.getAllPolicyReports(policyID);
            const cleanUpMergeQueries = {};
            const cleanUpSetQueries_1 = {};
            policyReports.forEach(function (policyReport) {
                if (!policyReport) {
                    return;
                }
                const reportID = policyReport.reportID;
                cleanUpSetQueries_1[`${  ONYXKEYS_1['default'].COLLECTION.REPORT_DRAFT_COMMENT  }${reportID}`] = null;
                cleanUpSetQueries_1[`${  ONYXKEYS_1['default'].COLLECTION.REPORT_ACTIONS_DRAFTS  }${reportID}`] = null;
            });
            react_native_onyx_1['default'].mergeCollection(ONYXKEYS_1['default'].COLLECTION.REPORT, cleanUpMergeQueries);
            react_native_onyx_1['default'].multiSet(cleanUpSetQueries_1);
            delete allPolicies[key];
            return;
        }
        allPolicies[key] = val;
    },
});
let allPolicyTags = {};
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS,
    waitForCollectionCallback: true,
    callback (value) {
        if (!value) {
            allPolicyTags = {};
            return;
        }
        allPolicyTags = value;
    },
});
let allRecentlyUsedTags = {};
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].COLLECTION.POLICY_RECENTLY_USED_TAGS,
    waitForCollectionCallback: true,
    callback (val) {
        return (allRecentlyUsedTags = val);
    },
});
function openPolicyTagsPage(policyID) {
    if (!policyID) {
        Log_1['default'].warn('openPolicyTasgPage invalid params', {policyID});
        return;
    }
    const params = {
        policyID,
    };
    API.read(types_1.READ_COMMANDS.OPEN_POLICY_TAGS_PAGE, params);
}
exports.openPolicyTagsPage = openPolicyTagsPage;
function buildOptimisticPolicyRecentlyUsedTags(policyID, transactionTags) {
    let _a; let _b;
    if (!policyID || !transactionTags) {
        return {};
    }
    const policyTags =
        (_a = allPolicyTags === null || allPolicyTags === void 0 ? void 0 : allPolicyTags[`${  ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS  }${policyID}`]) !== null && _a !== void 0 ? _a : {};
    const policyTagKeys = PolicyUtils.getSortedTagKeys(policyTags);
    const policyRecentlyUsedTags =
        (_b = allRecentlyUsedTags === null || allRecentlyUsedTags === void 0 ? void 0 : allRecentlyUsedTags[`${  ONYXKEYS_1['default'].COLLECTION.POLICY_RECENTLY_USED_TAGS  }${policyID}`]) !==
            null && _b !== void 0
            ? _b
            : {};
    const newOptimisticPolicyRecentlyUsedTags = {};
    TransactionUtils_1.getTagArrayFromName(transactionTags).forEach(function (tag, index) {
        let _a; let _b;
        if (!tag) {
            return;
        }
        const tagListKey = (_a = policyTagKeys.at(index)) !== null && _a !== void 0 ? _a : '';
        newOptimisticPolicyRecentlyUsedTags[tagListKey] = __spreadArrays(new Set(__spreadArrays([tag], (_b = policyRecentlyUsedTags[tagListKey]) !== null && _b !== void 0 ? _b : [])));
    });
    return newOptimisticPolicyRecentlyUsedTags;
}
exports.buildOptimisticPolicyRecentlyUsedTags = buildOptimisticPolicyRecentlyUsedTags;
function updateImportSpreadsheetData(tagsLength) {
    const onyxData = {
        successData: [
            {
                onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
                key: ONYXKEYS_1['default'].IMPORTED_SPREADSHEET,
                value: {
                    shouldFinalModalBeOpened: true,
                    importFinalModal: {
                        title: Localize_1.translateLocal('spreadsheet.importSuccessfullTitle'),
                        prompt: Localize_1.translateLocal('spreadsheet.importTagsSuccessfullDescription', {tags: tagsLength}),
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
                key: ONYXKEYS_1['default'].IMPORTED_SPREADSHEET,
                value: {
                    shouldFinalModalBeOpened: true,
                    importFinalModal: {title: Localize_1.translateLocal('spreadsheet.importFailedTitle'), prompt: Localize_1.translateLocal('spreadsheet.importFailedDescription')},
                },
            },
        ],
    };
    return onyxData;
}
function createPolicyTag(policyID, tagName) {
    let _a; let _b; let _c; let _d; let _e; let _f;
    let _g; let _h; let _j;
    const policyTag =
        (_j =
            (_h = PolicyUtils.getTagLists(
                (_g = allPolicyTags === null || allPolicyTags === void 0 ? void 0 : allPolicyTags[`${  ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS  }${policyID}`]) !== null && _g !== void 0
                    ? _g
                    : {},
            )) === null || _h === void 0
                ? void 0
                : _h.at(0)) !== null && _j !== void 0
            ? _j
            : {};
    const newTagName = PolicyUtils.escapeTagName(tagName);
    const onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
                key: `${  ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS  }${policyID}`,
                value:
                    ((_a = {}),
                    (_a[policyTag.name] = {
                        tags:
                            ((_b = {}),
                            (_b[newTagName] = {
                                name: newTagName,
                                enabled: true,
                                errors: null,
                                pendingAction: CONST_1['default'].RED_BRICK_ROAD_PENDING_ACTION.ADD,
                            }),
                            _b),
                    }),
                    _a),
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
                key: `${  ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS  }${policyID}`,
                value:
                    ((_c = {}),
                    (_c[policyTag.name] = {
                        tags:
                            ((_d = {}),
                            (_d[newTagName] = {
                                errors: null,
                                pendingAction: null,
                            }),
                            _d),
                    }),
                    _c),
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
                key: `${  ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS  }${policyID}`,
                value:
                    ((_e = {}),
                    (_e[policyTag.name] = {
                        tags:
                            ((_f = {}),
                            (_f[newTagName] = {
                                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.tags.genericFailureMessage'),
                            }),
                            _f),
                    }),
                    _e),
            },
        ],
    };
    const parameters = {
        policyID,
        tags: JSON.stringify([{name: newTagName}]),
    };
    API.write(types_1.WRITE_COMMANDS.CREATE_POLICY_TAG, parameters, onyxData);
}
exports.createPolicyTag = createPolicyTag;
function importPolicyTags(policyID, tags) {
    const onyxData = updateImportSpreadsheetData(tags.length);
    const parameters = {
        policyID,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        tags: JSON.stringify(
            tags.map(function (tag) {
                return {name: tag.name, enabled: tag.enabled, 'GL Code': tag['GL Code']};
            }),
        ),
    };
    API.write(types_1.WRITE_COMMANDS.IMPORT_TAGS_SPREADSHEET, parameters, onyxData);
}
exports.importPolicyTags = importPolicyTags;
function setWorkspaceTagEnabled(policyID, tagsToUpdate, tagListIndex) {
    let _a; let _b; let _c;
    let _d; let _e;
    const policyTag =
        (_e = PolicyUtils.getTagLists(
            (_d = allPolicyTags === null || allPolicyTags === void 0 ? void 0 : allPolicyTags[`${  ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS  }${policyID}`]) !== null && _d !== void 0
                ? _d
                : {},
        )) === null || _e === void 0
            ? void 0
            : _e.at(tagListIndex);
    if (!policyTag || tagListIndex === -1) {
        return;
    }
    const optimisticPolicyTagsData = {
        
        ...Object.keys(tagsToUpdate).reduce(function (acc, key) {
            let _a;
            acc[key] = {...policyTag.tags[key], ...tagsToUpdate[key], errors: null,
                pendingFields: {...((_a = policyTag.tags[key]) === null || _a === void 0 ? void 0 : _a.pendingFields), enabled: CONST_1['default'].RED_BRICK_ROAD_PENDING_ACTION.UPDATE,},
                pendingAction: CONST_1['default'].RED_BRICK_ROAD_PENDING_ACTION.UPDATE,};
            return acc;
        }, {}),
    };
    const shouldDisableRequiredTag = !OptionsListUtils.hasEnabledOptions({...policyTag.tags, ...optimisticPolicyTagsData});
    const onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
                key: `${  ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS  }${policyID}`,
                value:
                    ((_a = {}),
                    (_a[policyTag.name] = {
                        ...(shouldDisableRequiredTag ? {required: false, pendingFields: {required: CONST_1['default'].RED_BRICK_ROAD_PENDING_ACTION.UPDATE}} : {}),
                        tags: optimisticPolicyTagsData,
                    }),
                    _a),
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
                key: `${  ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS  }${policyID}`,
                value:
                    ((_b = {}),
                    (_b[policyTag.name] = {...(shouldDisableRequiredTag ? {pendingFields: {required: null}} : {}), tags: {
                            
                            ...Object.keys(tagsToUpdate).reduce(function (acc, key) {
                                acc[key] = {...policyTag.tags[key], ...tagsToUpdate[key], errors: null,
                                    pendingFields: {...policyTag.tags[key].pendingFields, enabled: null},
                                    pendingAction: null,};
                                return acc;
                            }, {}),
                        },}),
                    _b),
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
                key: `${  ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS  }${policyID}`,
                value:
                    ((_c = {}),
                    (_c[policyTag.name] = {...(shouldDisableRequiredTag ? {pendingFields: {required: null}, required: policyTag.required} : {}), tags: {
                            
                            ...Object.keys(tagsToUpdate).reduce(function (acc, key) {
                                acc[key] = {...policyTag.tags[key], ...tagsToUpdate[key], errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.tags.genericFailureMessage'),
                                    pendingFields: {...policyTag.tags[key].pendingFields, enabled: null},
                                    pendingAction: null,};
                                return acc;
                            }, {}),
                        },}),
                    _c),
            },
        ],
    };
    const parameters = {
        policyID,
        tags: JSON.stringify(
            Object.keys(tagsToUpdate).map(function (key) {
                return tagsToUpdate[key];
            }),
        ),
        tagListIndex,
    };
    API.write(types_1.WRITE_COMMANDS.SET_POLICY_TAGS_ENABLED, parameters, onyxData);
}
exports.setWorkspaceTagEnabled = setWorkspaceTagEnabled;
function deletePolicyTags(policyID, tagsToDelete) {
    let _a; let _b; let _c;
    let _d; let _e;
    const policyTag =
        (_e = PolicyUtils.getTagLists(
            (_d = allPolicyTags === null || allPolicyTags === void 0 ? void 0 : allPolicyTags[`${  ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS  }${policyID}`]) !== null && _d !== void 0
                ? _d
                : {},
        )) === null || _e === void 0
            ? void 0
            : _e.at(0);
    if (!policyTag) {
        return;
    }
    const onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
                key: `${  ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS  }${policyID}`,
                value:
                    ((_a = {}),
                    (_a[policyTag.name] = {
                        tags: {
                            
                            ...tagsToDelete.reduce(function (acc, tagName) {
                                acc[tagName] = {pendingAction: CONST_1['default'].RED_BRICK_ROAD_PENDING_ACTION.DELETE, enabled: false};
                                return acc;
                            }, {}),
                        },
                    }),
                    _a),
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
                key: `${  ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS  }${policyID}`,
                value:
                    ((_b = {}),
                    (_b[policyTag.name] = {
                        tags: {
                            
                            ...tagsToDelete.reduce(function (acc, tagName) {
                                acc[tagName] = null;
                                return acc;
                            }, {}),
                        },
                    }),
                    _b),
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
                key: `${  ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS  }${policyID}`,
                value:
                    ((_c = {}),
                    (_c[policyTag.name] = {
                        tags: {
                            
                            ...tagsToDelete.reduce(function (acc, tagName) {
                                let _a;
                                acc[tagName] = {
                                    pendingAction: null,
                                    errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.tags.deleteFailureMessage'),
                                    enabled: !!((_a = policyTag === null || policyTag === void 0 ? void 0 : policyTag.tags[tagName]) === null || _a === void 0 ? void 0 : _a.enabled),
                                };
                                return acc;
                            }, {}),
                        },
                    }),
                    _c),
            },
        ],
    };
    const parameters = {
        policyID,
        tags: JSON.stringify(tagsToDelete),
    };
    API.write(types_1.WRITE_COMMANDS.DELETE_POLICY_TAGS, parameters, onyxData);
}
exports.deletePolicyTags = deletePolicyTags;
function clearPolicyTagErrors(policyID, tagName, tagListIndex) {
    let _a; let _b; let _c; let _d;
    let _e; let _f;
    const tagListName = PolicyUtils.getTagListName(
        allPolicyTags === null || allPolicyTags === void 0 ? void 0 : allPolicyTags[`${  ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS  }${policyID}`],
        tagListIndex,
    );
    const tag =
        (_f =
            (_e = allPolicyTags === null || allPolicyTags === void 0 ? void 0 : allPolicyTags[`${  ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS  }${policyID}`]) === null || _e === void 0
                ? void 0
                : _e[tagListName].tags) === null || _f === void 0
            ? void 0
            : _f[tagName];
    if (!tag) {
        return;
    }
    if (tag.pendingAction === CONST_1['default'].RED_BRICK_ROAD_PENDING_ACTION.ADD) {
        react_native_onyx_1['default'].merge(
            `${  ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS  }${policyID}`,
            ((_a = {}),
            (_a[tagListName] = {
                tags: ((_b = {}), (_b[tagName] = null), _b),
            }),
            _a),
        );
        return;
    }
    react_native_onyx_1['default'].merge(
        `${  ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS  }${policyID}`,
        ((_c = {}),
        (_c[tagListName] = {
            tags:
                ((_d = {}),
                (_d[tagName] = {
                    errors: null,
                    pendingAction: null,
                }),
                _d),
        }),
        _c),
    );
}
exports.clearPolicyTagErrors = clearPolicyTagErrors;
function clearPolicyTagListErrorField(policyID, tagListIndex, errorField) {
    let _a; let _b;
    let _c; let _d;
    const policyTag =
        (_d = PolicyUtils.getTagLists(
            (_c = allPolicyTags === null || allPolicyTags === void 0 ? void 0 : allPolicyTags[`${  ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS  }${policyID}`]) !== null && _c !== void 0
                ? _c
                : {},
        )) === null || _d === void 0
            ? void 0
            : _d.at(tagListIndex);
    if (!policyTag) {
        return;
    }
    if (!policyTag.name) {
        return;
    }
    react_native_onyx_1['default'].merge(
        `${  ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS  }${policyID}`,
        ((_a = {}),
        (_a[policyTag.name] = {
            errorFields: ((_b = {}), (_b[errorField] = null), _b),
        }),
        _a),
    );
}
exports.clearPolicyTagListErrorField = clearPolicyTagListErrorField;
function clearPolicyTagListErrors(policyID, tagListIndex) {
    let _a;
    let _b; let _c;
    const policyTag =
        (_c = PolicyUtils.getTagLists(
            (_b = allPolicyTags === null || allPolicyTags === void 0 ? void 0 : allPolicyTags[`${  ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS  }${policyID}`]) !== null && _b !== void 0
                ? _b
                : {},
        )) === null || _c === void 0
            ? void 0
            : _c.at(tagListIndex);
    if (!policyTag) {
        return;
    }
    if (!policyTag.name) {
        return;
    }
    react_native_onyx_1['default'].merge(
        `${  ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS  }${policyID}`,
        ((_a = {}),
        (_a[policyTag.name] = {
            errors: null,
        }),
        _a),
    );
}
exports.clearPolicyTagListErrors = clearPolicyTagListErrors;
function renamePolicyTag(policyID, policyTag, tagListIndex) {
    let _a; let _b; let _c; let _d; let _e; let _f;
    let _g; let _h; let _j; let _k; let _l;
    const policy = PolicyUtils.getPolicy(policyID);
    const tagList =
        (_h = PolicyUtils.getTagLists(
            (_g = allPolicyTags === null || allPolicyTags === void 0 ? void 0 : allPolicyTags[`${  ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS  }${policyID}`]) !== null && _g !== void 0
                ? _g
                : {},
        )) === null || _h === void 0
            ? void 0
            : _h.at(tagListIndex);
    if (!tagList) {
        return;
    }
    const tag = (_j = tagList.tags) === null || _j === void 0 ? void 0 : _j[policyTag.oldName];
    const oldTagName = policyTag.oldName;
    const newTagName = PolicyUtils.escapeTagName(policyTag.newName);
    const policyTagRule = PolicyUtils.getTagApproverRule(policyID, oldTagName);
    const approvalRules = (_l = (_k = policy === null || policy === void 0 ? void 0 : policy.rules) === null || _k === void 0 ? void 0 : _k.approvalRules) !== null && _l !== void 0 ? _l : [];
    const updatedApprovalRules = cloneDeep_1['default'](approvalRules);
    // Its related by name, so the corresponding rule has to be updated to handle offline scenario
    if (policyTagRule) {
        const indexToUpdate = updatedApprovalRules.findIndex(function (rule) {
            return rule.id === policyTagRule.id;
        });
        policyTagRule.applyWhen = policyTagRule.applyWhen.map(function (ruleCondition) {
            const value = ruleCondition.value;
                const field = ruleCondition.field;
                const condition = ruleCondition.condition;
            if (value === policyTag.oldName && field === CONST_1['default'].POLICY.FIELDS.TAG && condition === CONST_1['default'].POLICY.RULE_CONDITIONS.MATCHES) {
                return {...ruleCondition, value: policyTag.newName};
            }
            return ruleCondition;
        });
        updatedApprovalRules[indexToUpdate] = policyTagRule;
    }
    const onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
                key: `${  ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS  }${policyID}`,
                value:
                    ((_a = {}),
                    (_a[tagList === null || tagList === void 0 ? void 0 : tagList.name] = {
                        tags:
                            ((_b = {}),
                            (_b[oldTagName] = null),
                            (_b[newTagName] = {...tag, name: newTagName,
                                pendingAction: CONST_1['default'].RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                pendingFields: {...tag.pendingFields, name: CONST_1['default'].RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                                previousTagName: oldTagName,
                                errors: null,}),
                            _b),
                    }),
                    _a),
            },
            {
                onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
                key: `${  ONYXKEYS_1['default'].COLLECTION.POLICY  }${policyID}`,
                value: {
                    rules: {
                        approvalRules: updatedApprovalRules,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
                key: `${  ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS  }${policyID}`,
                value:
                    ((_c = {}),
                    (_c[tagList.name] = {
                        tags:
                            ((_d = {}),
                            (_d[newTagName] = {
                                pendingAction: null,
                                pendingFields: {...tag.pendingFields, name: null},
                            }),
                            _d),
                    }),
                    _c),
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
                key: `${  ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS  }${policyID}`,
                value:
                    ((_e = {}),
                    (_e[tagList.name] = {
                        tags:
                            ((_f = {}),
                            (_f[newTagName] = null),
                            (_f[oldTagName] = {...tag, pendingAction: null,
                                pendingFields: {...tag.pendingFields, name: null},
                                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.tags.genericFailureMessage'),}),
                            _f),
                    }),
                    _e),
            },
        ],
    };
    const parameters = {
        policyID,
        oldName: oldTagName,
        newName: newTagName,
        tagListIndex,
    };
    API.write(types_1.WRITE_COMMANDS.RENAME_POLICY_TAG, parameters, onyxData);
}
exports.renamePolicyTag = renamePolicyTag;
function enablePolicyTags(policyID, enabled) {
    let _a;
    let _b; let _c; let _d;
    const onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
                key: `${  ONYXKEYS_1['default'].COLLECTION.POLICY  }${policyID}`,
                value: {
                    areTagsEnabled: enabled,
                    pendingFields: {
                        areTagsEnabled: CONST_1['default'].RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
                key: `${  ONYXKEYS_1['default'].COLLECTION.POLICY  }${policyID}`,
                value: {
                    pendingFields: {
                        areTagsEnabled: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
                key: `${  ONYXKEYS_1['default'].COLLECTION.POLICY  }${policyID}`,
                value: {
                    areTagsEnabled: !enabled,
                    pendingFields: {
                        areTagsEnabled: null,
                    },
                },
            },
        ],
    };
    const policyTagList = allPolicyTags === null || allPolicyTags === void 0 ? void 0 : allPolicyTags[`${  ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS  }${policyID}`];
    if (!policyTagList) {
        const defaultTagList = {
            Tag: {
                name: 'Tag',
                orderWeight: 0,
                required: false,
                tags: {},
            },
        };
        (_b = onyxData.optimisticData) === null || _b === void 0
            ? void 0
            : _b.push({
                  onyxMethod: react_native_onyx_1['default'].METHOD.SET,
                  key: `${  ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS  }${policyID}`,
                  value: defaultTagList,
              });
        (_c = onyxData.failureData) === null || _c === void 0
            ? void 0
            : _c.push({
                  onyxMethod: react_native_onyx_1['default'].METHOD.SET,
                  key: `${  ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS  }${policyID}`,
                  value: null,
              });
    } else if (!enabled) {
        const policyTag = PolicyUtils.getTagLists(policyTagList).at(0);
        if (!policyTag) {
            return;
        }
        (_d = onyxData.optimisticData) === null || _d === void 0
            ? void 0
            : _d.push(
                  {
                      onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
                      key: `${  ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS  }${policyID}`,
                      value:
                          ((_a = {}),
                          (_a[policyTag.name] = {
                              tags: Object.fromEntries(
                                  Object.keys(policyTag.tags).map(function (tagName) {
                                      return [
                                          tagName,
                                          {
                                              enabled: false,
                                          },
                                      ];
                                  }),
                              ),
                          }),
                          _a),
                  },
                  {
                      onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
                      key: `${  ONYXKEYS_1['default'].COLLECTION.POLICY  }${policyID}`,
                      value: {
                          requiresTag: false,
                      },
                  },
              );
    }
    const parameters = {policyID, enabled};
    API.write(types_1.WRITE_COMMANDS.ENABLE_POLICY_TAGS, parameters, onyxData, {
        checkAndFixConflictingRequest (persistedRequests) {
            return RequestConflictUtils_1.resolveEnableFeatureConflicts(types_1.WRITE_COMMANDS.ENABLE_POLICY_TAGS, persistedRequests, parameters);
        },
    });
    if (enabled && getIsNarrowLayout_1['default']()) {
        PolicyUtils_1.goBackWhenEnableFeature(policyID);
    }
}
exports.enablePolicyTags = enablePolicyTags;
function renamePolicyTaglist(policyID, policyTagListName, policyTags, tagListIndex) {
    let _a; let _b; let _c;
    let _d;
    const newName = policyTagListName.newName;
    const oldName = policyTagListName.oldName;
    const oldPolicyTags = (_d = policyTags === null || policyTags === void 0 ? void 0 : policyTags[oldName]) !== null && _d !== void 0 ? _d : {};
    const onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
                key: `${  ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS  }${policyID}`,
                value:
                    ((_a = {}),
                    (_a[newName] = {...oldPolicyTags, name: newName, pendingAction: CONST_1['default'].RED_BRICK_ROAD_PENDING_ACTION.ADD, errors: null}),
                    (_a[oldName] = null),
                    _a),
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
                key: `${  ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS  }${policyID}`,
                value: ((_b = {}), (_b[newName] = {pendingAction: null}), (_b[oldName] = null), _b),
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
                key: `${  ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS  }${policyID}`,
                value:
                    ((_c = {}),
                    (_c[newName] = null),
                    (_c[oldName] = {...oldPolicyTags, pendingAction: null,
                        errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.tags.genericFailureMessage'),}),
                    _c),
            },
        ],
    };
    const parameters = {
        policyID,
        oldName,
        newName,
        tagListIndex,
    };
    API.write(types_1.WRITE_COMMANDS.RENAME_POLICY_TAG_LIST, parameters, onyxData);
}
exports.renamePolicyTaglist = renamePolicyTaglist;
function setPolicyRequiresTag(policyID, requiresTag) {
    let _a; let _b; let _c; let _d;
    const policyTags =
        (_a = allPolicyTags === null || allPolicyTags === void 0 ? void 0 : allPolicyTags[`${  ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS  }${policyID}`]) !== null && _a !== void 0 ? _a : {};
    const isMultiLevelTags = PolicyUtils.isMultiLevelTags(policyTags);
    const onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
                key: `${  ONYXKEYS_1['default'].COLLECTION.POLICY  }${policyID}`,
                value: {
                    requiresTag,
                    errors: {requiresTag: null},
                    pendingFields: {
                        requiresTag: CONST_1['default'].RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
                key: `${  ONYXKEYS_1['default'].COLLECTION.POLICY  }${policyID}`,
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
                onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
                key: `${  ONYXKEYS_1['default'].COLLECTION.POLICY  }${policyID}`,
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
    if (isMultiLevelTags) {
        const getUpdatedTagsData = function (required) {
            return {
                key: `${  ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS  }${policyID}`,
                onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
                value: {
                    
                    ...Object.keys(policyTags).reduce(function (acc, key) {
                        acc[key] = {...acc[key], required};
                        return acc;
                    }, {}),
                },
            };
        };
        (_b = onyxData.optimisticData) === null || _b === void 0 ? void 0 : _b.push(getUpdatedTagsData(requiresTag));
        (_c = onyxData.failureData) === null || _c === void 0 ? void 0 : _c.push(getUpdatedTagsData(!requiresTag));
        (_d = onyxData.successData) === null || _d === void 0 ? void 0 : _d.push(getUpdatedTagsData(requiresTag));
    }
    const parameters = {
        policyID,
        requiresTag,
    };
    API.write(types_1.WRITE_COMMANDS.SET_POLICY_REQUIRES_TAG, parameters, onyxData);
}
exports.setPolicyRequiresTag = setPolicyRequiresTag;
function setPolicyTagsRequired(policyID, requiresTag, tagListIndex) {
    let _a; let _b; let _c;
    let _d; let _e;
    const policyTag =
        (_e = PolicyUtils.getTagLists(
            (_d = allPolicyTags === null || allPolicyTags === void 0 ? void 0 : allPolicyTags[`${  ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS  }${policyID}`]) !== null && _d !== void 0
                ? _d
                : {},
        )) === null || _e === void 0
            ? void 0
            : _e.at(tagListIndex);
    if (!policyTag) {
        return;
    }
    if (!policyTag.name) {
        return;
    }
    const onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
                key: `${  ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS  }${policyID}`,
                value:
                    ((_a = {}),
                    (_a[policyTag.name] = {
                        required: requiresTag,
                        pendingFields: {required: CONST_1['default'].RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                        errorFields: {required: null},
                    }),
                    _a),
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
                key: `${  ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS  }${policyID}`,
                value:
                    ((_b = {}),
                    (_b[policyTag.name] = {
                        pendingFields: {required: null},
                    }),
                    _b),
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
                key: `${  ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS  }${policyID}`,
                value:
                    ((_c = {}),
                    (_c[policyTag.name] = {
                        required: policyTag.required,
                        pendingFields: {required: null},
                        errorFields: {
                            required: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.tags.genericFailureMessage'),
                        },
                    }),
                    _c),
            },
        ],
    };
    const parameters = {
        policyID,
        tagListIndex,
        requireTagList: requiresTag,
    };
    API.write(types_1.WRITE_COMMANDS.SET_POLICY_TAGS_REQUIRED, parameters, onyxData);
}
exports.setPolicyTagsRequired = setPolicyTagsRequired;
function setPolicyTagGLCode(policyID, tagName, tagListIndex, glCode) {
    let _a; let _b; let _c; let _d; let _e; let _f;
    let _g; let _h; let _j; let _k;
    const tagListName = PolicyUtils.getTagListName(
        allPolicyTags === null || allPolicyTags === void 0 ? void 0 : allPolicyTags[`${  ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS  }${policyID}`],
        tagListIndex,
    );
    const policyTagToUpdate =
        (_k =
            (_j =
                (_h =
                    (_g = allPolicyTags === null || allPolicyTags === void 0 ? void 0 : allPolicyTags[`${  ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS  }${policyID}`]) === null || _g === void 0
                        ? void 0
                        : _g[tagListName]) === null || _h === void 0
                    ? void 0
                    : _h.tags) === null || _j === void 0
                ? void 0
                : _j[tagName]) !== null && _k !== void 0
            ? _k
            : {};
    const onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
                key: `${  ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS  }${policyID}`,
                value:
                    ((_a = {}),
                    (_a[tagListName] = {
                        tags:
                            ((_b = {}),
                            (_b[tagName] = {...policyTagToUpdate, pendingAction: CONST_1['default'].RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                pendingFields: {
                                    // eslint-disable-next-line @typescript-eslint/naming-convention
                                    'GL Code': CONST_1['default'].RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                },
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                'GL Code': glCode,}),
                            _b),
                    }),
                    _a),
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
                key: `${  ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS  }${policyID}`,
                value:
                    ((_c = {}),
                    (_c[tagListName] = {
                        tags:
                            ((_d = {}),
                            (_d[tagName] = {
                                errors: null,
                                pendingAction: null,
                                pendingFields: {
                                    // eslint-disable-next-line @typescript-eslint/naming-convention
                                    'GL Code': null,
                                },
                            }),
                            _d),
                    }),
                    _c),
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
                key: `${  ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS  }${policyID}`,
                value:
                    ((_e = {}),
                    (_e[tagListName] = {
                        tags:
                            ((_f = {}),
                            (_f[tagName] = {...policyTagToUpdate, errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.tags.updateGLCodeFailureMessage'),}),
                            _f),
                    }),
                    _e),
            },
        ],
    };
    const parameters = {
        policyID,
        tagName,
        tagListName,
        tagListIndex,
        glCode,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_POLICY_TAG_GL_CODE, parameters, onyxData);
}
exports.setPolicyTagGLCode = setPolicyTagGLCode;
function setPolicyTagApprover(policyID, tag, approver) {
    let _a; let _b;
    const policy = PolicyUtils.getPolicy(policyID);
    const prevApprovalRules =
        (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.rules) === null || _a === void 0 ? void 0 : _a.approvalRules) !== null && _b !== void 0 ? _b : [];
    const approverRuleToUpdate = PolicyUtils.getTagApproverRule(policyID, tag);
    const filteredApprovalRules = approverRuleToUpdate
        ? prevApprovalRules.filter(function (rule) {
              return rule.id !== approverRuleToUpdate.id;
          })
        : prevApprovalRules;
    const toBeUnselected = (approverRuleToUpdate === null || approverRuleToUpdate === void 0 ? void 0 : approverRuleToUpdate.approver) === approver;
    const updatedApproverRule = approverRuleToUpdate
        ? ({...approverRuleToUpdate, approver})
        : {
              applyWhen: [
                  {
                      condition: CONST_1['default'].POLICY.RULE_CONDITIONS.MATCHES,
                      field: CONST_1['default'].POLICY.FIELDS.TAG,
                      value: tag,
                  },
              ],
              approver,
              id: '-1',
          };
    const updatedApprovalRules = toBeUnselected ? filteredApprovalRules : __spreadArrays(filteredApprovalRules, [updatedApproverRule]);
    const onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
                key: `${  ONYXKEYS_1['default'].COLLECTION.POLICY  }${policyID}`,
                value: {
                    rules: {
                        approvalRules: updatedApprovalRules,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
                key: `${  ONYXKEYS_1['default'].COLLECTION.POLICY  }${policyID}`,
                value: {
                    rules: {
                        approvalRules: updatedApprovalRules,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
                key: `${  ONYXKEYS_1['default'].COLLECTION.POLICY  }${policyID}`,
                value: {
                    rules: {
                        approvalRules: prevApprovalRules,
                    },
                },
            },
        ],
    };
    const parameters = {
        policyID,
        tagName: tag,
        approver: toBeUnselected ? null : approver,
    };
    API.write(types_1.WRITE_COMMANDS.SET_POLICY_TAG_APPROVER, parameters, onyxData);
}
exports.setPolicyTagApprover = setPolicyTagApprover;
function downloadTagsCSV(policyID, onDownloadFailed) {
    const finalParameters = enhanceParameters_1['default'](types_1.WRITE_COMMANDS.EXPORT_TAGS_CSV, {
        policyID,
    });
    const fileName = 'Tags.csv';
    const formData = new FormData();
    Object.entries(finalParameters).forEach(function (_a) {
        const key = _a[0];
            const value = _a[1];
        formData.append(key, String(value));
    });
    fileDownload_1['default'](
        ApiUtils.getCommandURL({command: types_1.WRITE_COMMANDS.EXPORT_TAGS_CSV}),
        fileName,
        '',
        false,
        formData,
        CONST_1['default'].NETWORK.METHOD.POST,
        onDownloadFailed,
    );
}
exports.downloadTagsCSV = downloadTagsCSV;
function getPolicyTagsData(policyID) {
    let _a;
    return (_a = allPolicyTags === null || allPolicyTags === void 0 ? void 0 : allPolicyTags[`${  ONYXKEYS_1['default'].COLLECTION.POLICY_TAGS  }${policyID}`]) !== null && _a !== void 0
        ? _a
        : {};
}
exports.getPolicyTagsData = getPolicyTagsData;
