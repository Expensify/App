import lodashCloneDeep from 'lodash/cloneDeep';
import type {OnyxCollection, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {
    EnablePolicyTagsParams,
    ImportMultiLevelTagsParams,
    OpenPolicyTagsPageParams,
    RenamePolicyTagListParams,
    RenamePolicyTagsParams,
    SetPolicyTagApproverParams,
    SetPolicyTagListsRequired,
    SetPolicyTagsEnabled,
    SetPolicyTagsRequired,
    UpdatePolicyTagGLCodeParams,
} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as ApiUtils from '@libs/ApiUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import fileDownload from '@libs/fileDownload';
import {readFileAsync} from '@libs/fileDownload/FileUtils';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
// eslint-disable-next-line @typescript-eslint/no-deprecated
import {translateLocal} from '@libs/Localize';
import Log from '@libs/Log';
import enhanceParameters from '@libs/Network/enhanceParameters';
import * as PolicyUtils from '@libs/PolicyUtils';
import {goBackWhenEnableFeature} from '@libs/PolicyUtils';
import {getTagArrayFromName} from '@libs/TransactionUtils';
import type {PolicyTagList} from '@pages/workspace/tags/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ImportedSpreadsheet, PolicyTag, PolicyTagLists, PolicyTags, RecentlyUsedTags} from '@src/types/onyx';
import type {OnyxValueWithOfflineFeedback} from '@src/types/onyx/OnyxCommon';
import type {ApprovalRule} from '@src/types/onyx/Policy';
import type {OnyxData} from '@src/types/onyx/Request';

let allPolicyTags: OnyxCollection<PolicyTagLists> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY_TAGS,
    waitForCollectionCallback: true,
    callback: (value) => {
        if (!value) {
            allPolicyTags = {};
            return;
        }

        allPolicyTags = value;
    },
});

function openPolicyTagsPage(policyID: string) {
    if (!policyID) {
        Log.warn('openPolicyTagsPage invalid params', {policyID});
        return;
    }

    const params: OpenPolicyTagsPageParams = {
        policyID,
    };

    API.read(READ_COMMANDS.OPEN_POLICY_TAGS_PAGE, params);
}

type BuildOptimisticPolicyRecentlyUsedTagsProps = {
    policyTags: PolicyTagLists;
    policyRecentlyUsedTags: RecentlyUsedTags;
    transactionTags?: string;
};

function buildOptimisticPolicyRecentlyUsedTags({policyTags, policyRecentlyUsedTags, transactionTags}: BuildOptimisticPolicyRecentlyUsedTagsProps): RecentlyUsedTags {
    if (!transactionTags) {
        return {};
    }

    const policyTagKeys = PolicyUtils.getSortedTagKeys(policyTags);
    const newOptimisticPolicyRecentlyUsedTags: RecentlyUsedTags = {};

    getTagArrayFromName(transactionTags).forEach((tag, index) => {
        if (!tag) {
            return;
        }

        const tagListKey = policyTagKeys.at(index) ?? '';
        newOptimisticPolicyRecentlyUsedTags[tagListKey] = [...new Set([tag, ...(policyRecentlyUsedTags[tagListKey] ?? [])])];
    });

    return newOptimisticPolicyRecentlyUsedTags;
}

function updateImportSpreadsheetData(tagsLength: number): OnyxData {
    const onyxData: OnyxData = {
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.IMPORTED_SPREADSHEET,
                value: {
                    shouldFinalModalBeOpened: true,
                    importFinalModal: {
                        // eslint-disable-next-line @typescript-eslint/no-deprecated
                        title: translateLocal('spreadsheet.importSuccessfulTitle'),
                        // eslint-disable-next-line @typescript-eslint/no-deprecated
                        prompt: translateLocal('spreadsheet.importTagsSuccessfulDescription', {tags: tagsLength}),
                    },
                },
            },
        ],

        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.IMPORTED_SPREADSHEET,
                value: {
                    shouldFinalModalBeOpened: true,
                    // eslint-disable-next-line @typescript-eslint/no-deprecated
                    importFinalModal: {title: translateLocal('spreadsheet.importFailedTitle'), prompt: translateLocal('spreadsheet.importFailedDescription')},
                },
            },
        ],
    };

    return onyxData;
}

function createPolicyTag(policyID: string, tagName: string, policyTags: PolicyTagLists = {}) {
    const policyTag = PolicyUtils.getTagLists(policyTags)?.at(0) ?? ({} as PolicyTagList);
    const newTagName = PolicyUtils.escapeTagName(tagName);

    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
                value: {
                    [policyTag.name]: {
                        tags: {
                            [newTagName]: {
                                name: newTagName,
                                enabled: true,
                                errors: null,
                                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                            },
                        },
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
                value: {
                    [policyTag.name]: {
                        tags: {
                            [newTagName]: {
                                errors: null,
                                pendingAction: null,
                            },
                        },
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
                value: {
                    [policyTag.name]: {
                        tags: {
                            [newTagName]: {
                                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.tags.genericFailureMessage'),
                            },
                        },
                    },
                },
            },
        ],
    };

    const parameters = {
        policyID,
        tags: JSON.stringify([{name: newTagName}]),
    };

    API.write(WRITE_COMMANDS.CREATE_POLICY_TAG, parameters, onyxData);
}

function importPolicyTags(policyID: string, tags: PolicyTag[]) {
    const onyxData = updateImportSpreadsheetData(tags.length);

    const parameters = {
        policyID,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        tags: JSON.stringify(tags.map((tag) => ({name: tag.name, enabled: tag.enabled, 'GL Code': tag['GL Code']}))),
    };

    API.write(WRITE_COMMANDS.IMPORT_TAGS_SPREADSHEET, parameters, onyxData);
}

type SetWorkspaceTagEnabledProps = {
    policyID: string;
    tagsToUpdate: Record<string, {name: string; enabled: boolean}>;
    tagListIndex: number;
    policyTags: OnyxEntry<PolicyTagLists>;
};

function setWorkspaceTagEnabled({policyID, tagsToUpdate, tagListIndex, policyTags}: SetWorkspaceTagEnabledProps) {
    const policyTag = PolicyUtils.getTagLists(policyTags ?? {})?.at(tagListIndex);

    if (!policyTag || tagListIndex === -1) {
        return;
    }

    const optimisticPolicyTagsData = {
        ...Object.keys(tagsToUpdate).reduce<PolicyTags>((acc, key) => {
            acc[key] = {
                ...policyTag.tags[key],
                ...tagsToUpdate[key],
                errors: null,
                pendingFields: {
                    ...policyTag.tags[key]?.pendingFields,
                    enabled: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            };

            return acc;
        }, {}),
    };
    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
                value: {
                    [policyTag.name]: {
                        tags: optimisticPolicyTagsData,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
                value: {
                    [policyTag.name]: {
                        tags: {
                            ...Object.keys(tagsToUpdate).reduce<PolicyTags>((acc, key) => {
                                acc[key] = {
                                    ...policyTag.tags[key],
                                    ...tagsToUpdate[key],
                                    errors: null,
                                    pendingFields: {
                                        ...policyTag.tags[key].pendingFields,
                                        enabled: null,
                                    },
                                    pendingAction: null,
                                };

                                return acc;
                            }, {}),
                        },
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
                value: {
                    [policyTag.name]: {
                        tags: {
                            ...Object.keys(tagsToUpdate).reduce<PolicyTags>((acc, key) => {
                                acc[key] = {
                                    ...policyTag.tags[key],
                                    ...tagsToUpdate[key],
                                    errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.tags.genericFailureMessage'),
                                    pendingFields: {
                                        ...policyTag.tags[key].pendingFields,
                                        enabled: null,
                                    },
                                    pendingAction: null,
                                };

                                return acc;
                            }, {}),
                        },
                    },
                },
            },
        ],
    };

    const parameters: SetPolicyTagsEnabled = {
        policyID,
        tags: JSON.stringify(Object.keys(tagsToUpdate).map((key) => tagsToUpdate[key])),
        tagListIndex,
    };

    API.write(WRITE_COMMANDS.SET_POLICY_TAGS_ENABLED, parameters, onyxData);
}

function setWorkspaceTagRequired(policyID: string, tagListIndexes: number[], isRequired: boolean, policyTags: OnyxEntry<PolicyTagLists>) {
    if (!policyTags) {
        return;
    }

    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
                value: {
                    ...Object.keys(policyTags).reduce<PolicyTagLists>((acc, key) => {
                        if (tagListIndexes.includes(policyTags[key].orderWeight)) {
                            acc[key] = {
                                ...acc[key],
                                required: isRequired,
                                errors: undefined,
                                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                pendingFields: {
                                    required: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                },
                            };

                            return acc;
                        }

                        return acc;
                    }, {}),
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
                value: {
                    ...Object.keys(policyTags).reduce<PolicyTagLists>((acc, key) => {
                        if (tagListIndexes.includes(policyTags[key].orderWeight)) {
                            acc[key] = {
                                ...acc[key],
                                errors: undefined,
                                pendingAction: null,
                                pendingFields: {
                                    required: null,
                                },
                            };
                            return acc;
                        }

                        return acc;
                    }, {}),
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
                value: {
                    ...Object.keys(policyTags).reduce<PolicyTagLists>((acc, key) => {
                        acc[key] = {
                            ...acc[key],
                            errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.tags.genericFailureMessage'),
                            pendingAction: null,
                            pendingFields: {
                                required: null,
                            },
                        };
                        return acc;
                    }, {}),
                },
            },
        ],
    };

    const parameters: SetPolicyTagListsRequired = {
        policyID,
        tagListIndexes,
        isRequired,
    };

    API.write(WRITE_COMMANDS.SET_POLICY_TAG_LISTS_REQUIRED, parameters, onyxData);
}

function deletePolicyTags(policyID: string, tagsToDelete: string[], policyTags: OnyxEntry<PolicyTagLists>) {
    const policyTag = PolicyUtils.getTagLists(policyTags ?? {})?.at(0);

    if (!policyTag) {
        return;
    }

    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
                value: {
                    [policyTag.name]: {
                        tags: {
                            ...tagsToDelete.reduce<Record<string, Partial<OnyxValueWithOfflineFeedback<PolicyTag>>>>((acc, tagName) => {
                                acc[tagName] = {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE, enabled: false};
                                return acc;
                            }, {}),
                        },
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
                value: {
                    [policyTag.name]: {
                        tags: {
                            ...tagsToDelete.reduce<Record<string, null | Partial<OnyxValueWithOfflineFeedback<PolicyTag>>>>((acc, tagName) => {
                                acc[tagName] = null;
                                return acc;
                            }, {}),
                        },
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
                value: {
                    [policyTag.name]: {
                        tags: {
                            ...tagsToDelete.reduce<Record<string, Partial<OnyxValueWithOfflineFeedback<PolicyTag>>>>((acc, tagName) => {
                                acc[tagName] = {
                                    pendingAction: null,
                                    errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.tags.deleteFailureMessage'),
                                    enabled: !!policyTag?.tags[tagName]?.enabled,
                                };
                                return acc;
                            }, {}),
                        },
                    },
                },
            },
        ],
    };

    const parameters = {
        policyID,
        tags: JSON.stringify(tagsToDelete),
    };

    API.write(WRITE_COMMANDS.DELETE_POLICY_TAGS, parameters, onyxData);
}

type ClearPolicyTagErrorsProps = {
    policyID: string;
    tagName: string;
    tagListIndex: number;
    policyTags: OnyxEntry<PolicyTagLists>;
};

function clearPolicyTagErrors({policyID, tagName, tagListIndex, policyTags}: ClearPolicyTagErrorsProps) {
    const tagListName = PolicyUtils.getTagListName(policyTags, tagListIndex);
    const tag = policyTags?.[tagListName]?.tags?.[tagName];
    if (!tag) {
        return;
    }

    if (tag.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
        Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {
            [tagListName]: {
                tags: {
                    [tagName]: null,
                },
            },
        });
        return;
    }

    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {
        [tagListName]: {
            tags: {
                [tagName]: {
                    errors: null,
                    pendingAction: null,
                },
            },
        },
    });
}

type ClearPolicyTagListErrorFieldProps = {
    policyID: string;
    tagListIndex: number;
    errorField: string;
    policyTags: OnyxEntry<PolicyTagLists>;
};

function clearPolicyTagListErrorField({policyID, tagListIndex, errorField, policyTags}: ClearPolicyTagListErrorFieldProps) {
    const policyTag = PolicyUtils.getTagLists(policyTags ?? {})?.at(tagListIndex);

    if (!policyTag) {
        return;
    }

    if (!policyTag.name) {
        return;
    }

    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {
        [policyTag.name]: {
            errorFields: {
                [errorField]: null,
            },
        },
    });
}

function clearPolicyTagListErrors(policyID: string, tagListIndex: number) {
    const policyTag = PolicyUtils.getTagLists(allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`] ?? {})?.at(tagListIndex);

    if (!policyTag) {
        return;
    }

    if (!policyTag.name) {
        return;
    }

    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {
        [policyTag.name]: {
            errors: null,
        },
    });
}

function renamePolicyTag(policyID: string, policyTag: {oldName: string; newName: string}, tagListIndex: number) {
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const policy = PolicyUtils.getPolicy(policyID);
    const tagList = PolicyUtils.getTagLists(allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`] ?? {})?.at(tagListIndex);
    if (!tagList) {
        return;
    }
    const tag = tagList.tags?.[policyTag.oldName];
    const oldTagName = policyTag.oldName;
    const newTagName = PolicyUtils.escapeTagName(policyTag.newName);

    const policyTagRule = PolicyUtils.getTagApproverRule(policyID, oldTagName);
    const approvalRules = policy?.rules?.approvalRules ?? [];
    const updatedApprovalRules: ApprovalRule[] = lodashCloneDeep(approvalRules);

    // Its related by name, so the corresponding rule has to be updated to handle offline scenario
    if (policyTagRule) {
        const indexToUpdate = updatedApprovalRules.findIndex((rule) => rule.id === policyTagRule.id);
        policyTagRule.applyWhen = policyTagRule.applyWhen.map((ruleCondition) => {
            const {value, field, condition} = ruleCondition;

            if (value === policyTag.oldName && field === CONST.POLICY.FIELDS.TAG && condition === CONST.POLICY.RULE_CONDITIONS.MATCHES) {
                return {...ruleCondition, value: policyTag.newName};
            }

            return ruleCondition;
        });
        updatedApprovalRules[indexToUpdate] = policyTagRule;
    }

    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
                value: {
                    [tagList?.name]: {
                        tags: {
                            [oldTagName]: null,
                            [newTagName]: {
                                ...tag,
                                name: newTagName,
                                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                pendingFields: {
                                    ...tag.pendingFields,
                                    name: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                },
                                previousTagName: oldTagName,
                                errors: null,
                            },
                        },
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    rules: {
                        approvalRules: updatedApprovalRules,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
                value: {
                    [tagList.name]: {
                        tags: {
                            [newTagName]: {
                                pendingAction: null,
                                pendingFields: {
                                    ...tag.pendingFields,
                                    name: null,
                                },
                            },
                        },
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
                value: {
                    [tagList.name]: {
                        tags: {
                            [newTagName]: null,
                            [oldTagName]: {
                                ...tag,
                                pendingAction: null,
                                pendingFields: {
                                    ...tag.pendingFields,
                                    name: null,
                                },
                                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.tags.genericFailureMessage'),
                            },
                        },
                    },
                },
            },
        ],
    };

    const parameters: RenamePolicyTagsParams = {
        policyID,
        oldName: oldTagName,
        newName: newTagName,
        tagListIndex,
    };

    API.write(WRITE_COMMANDS.RENAME_POLICY_TAG, parameters, onyxData);
}

type EnablePolicyTagsProps = {
    policyID: string;
    enabled: boolean;
    policyTags?: PolicyTagLists;
};

function enablePolicyTags({policyID, enabled, policyTags}: EnablePolicyTagsProps) {
    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    areTagsEnabled: enabled,
                    pendingFields: {
                        areTagsEnabled: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    pendingFields: {
                        areTagsEnabled: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    areTagsEnabled: !enabled,
                    pendingFields: {
                        areTagsEnabled: null,
                    },
                },
            },
        ],
    };

    if (!policyTags) {
        const defaultTagList: PolicyTagLists = {
            Tag: {
                name: 'Tag',
                orderWeight: 0,
                required: false,
                tags: {},
            },
        };
        onyxData.optimisticData?.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
            value: defaultTagList,
        });
        onyxData.failureData?.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
            value: null,
        });
    } else if (!enabled) {
        const policyTag = PolicyUtils.getTagLists(policyTags).at(0);

        if (!policyTag) {
            return;
        }

        onyxData.optimisticData?.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
                value: {
                    [policyTag.name]: {
                        tags: Object.fromEntries(
                            Object.keys(policyTag.tags).map((tagName) => [
                                tagName,
                                {
                                    enabled: false,
                                },
                            ]),
                        ),
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    requiresTag: false,
                },
            },
        );
    }

    const parameters: EnablePolicyTagsParams = {policyID, enabled};

    // We can't use writeWithNoDuplicatesEnableFeatureConflicts because the tags data is also changed when disabling/enabling this feature
    API.write(WRITE_COMMANDS.ENABLE_POLICY_TAGS, parameters, onyxData);

    if (enabled && getIsNarrowLayout()) {
        goBackWhenEnableFeature(policyID);
    }
}

function cleanPolicyTags(policyID: string) {
    // We do not have any optimistic data or success data for this command as this action cannot be done offline
    API.write(WRITE_COMMANDS.CLEAN_POLICY_TAGS, {policyID});
}

function setImportedSpreadsheetIsImportingMultiLevelTags(isImportingMultiLevelTags: boolean) {
    Onyx.merge(ONYXKEYS.IMPORTED_SPREADSHEET, {isImportingMultiLevelTags});
}

function setImportedSpreadsheetIsImportingIndependentMultiLevelTags(isImportingIndependentMultiLevelTags: boolean) {
    Onyx.merge(ONYXKEYS.IMPORTED_SPREADSHEET, {isImportingIndependentMultiLevelTags});
}

function setImportedSpreadsheetIsFirstLineHeader(containsHeader: boolean) {
    Onyx.merge(ONYXKEYS.IMPORTED_SPREADSHEET, {containsHeader});
}

function setImportedSpreadsheetIsGLAdjacent(isGLAdjacent: boolean) {
    Onyx.merge(ONYXKEYS.IMPORTED_SPREADSHEET, {isGLAdjacent});
}

function setImportedSpreadsheetFileURI(fileURI: string) {
    Onyx.merge(ONYXKEYS.IMPORTED_SPREADSHEET, {fileURI});
}

function importMultiLevelTags(policyID: string, spreadsheet: ImportedSpreadsheet | undefined) {
    if (!spreadsheet) {
        return;
    }

    const onyxData: OnyxData = {
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    hasMultipleTagLists: true,
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.IMPORTED_SPREADSHEET,
                value: {
                    shouldFinalModalBeOpened: true,
                    // eslint-disable-next-line @typescript-eslint/no-deprecated
                    importFinalModal: {title: translateLocal('spreadsheet.importSuccessfulTitle'), prompt: translateLocal('spreadsheet.importMultiLevelTagsSuccessfulDescription')},
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    hasMultipleTagLists: false,
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.IMPORTED_SPREADSHEET,
                value: {
                    shouldFinalModalBeOpened: true,
                    // eslint-disable-next-line @typescript-eslint/no-deprecated
                    importFinalModal: {title: translateLocal('spreadsheet.importFailedTitle'), prompt: translateLocal('spreadsheet.importFailedDescription')},
                },
            },
        ],
    };

    readFileAsync(
        spreadsheet?.fileURI ?? '',
        spreadsheet?.fileName ?? CONST.MULTI_LEVEL_TAGS_FILE_NAME,
        (file) => {
            const parameters: ImportMultiLevelTagsParams = {
                policyID,
                isFirstLineHeader: spreadsheet?.containsHeader,
                isIndependent: spreadsheet?.isImportingIndependentMultiLevelTags,
                isGLAdjacent: spreadsheet?.isGLAdjacent,
                file,
            };

            API.write(WRITE_COMMANDS.IMPORT_MULTI_LEVEL_TAGS, parameters, onyxData);
        },
        () => {},
        spreadsheet?.fileType ?? CONST.SHARE_FILE_MIMETYPE.CSV,
    );
}

function renamePolicyTagList(policyID: string, policyTagListName: {oldName: string; newName: string}, policyTags: OnyxEntry<PolicyTagLists>, tagListIndex: number) {
    const newName = policyTagListName.newName;
    const oldName = policyTagListName.oldName;
    const oldPolicyTags = policyTags?.[oldName] ?? {};
    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
                value: {
                    [newName]: {...oldPolicyTags, name: newName, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD, errors: null},
                    [oldName]: null,
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
                value: {
                    [newName]: {pendingAction: null},
                    [oldName]: null,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
                value: {
                    [newName]: null,
                    [oldName]: {
                        ...oldPolicyTags,
                        pendingAction: null,
                        errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.tags.genericFailureMessage'),
                    },
                },
            },
        ],
    };
    const parameters: RenamePolicyTagListParams = {
        policyID,
        oldName,
        newName,
        tagListIndex,
    };

    API.write(WRITE_COMMANDS.RENAME_POLICY_TAG_LIST, parameters, onyxData);
}

function setPolicyRequiresTag(policyID: string, requiresTag: boolean) {
    const policyTags = allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`] ?? {};

    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    requiresTag,
                    errors: {requiresTag: null},
                    pendingFields: {
                        requiresTag: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
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
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
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

    const getUpdatedTagsData = (required: boolean): OnyxUpdate => ({
        key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
        onyxMethod: Onyx.METHOD.MERGE,
        value: {
            ...Object.keys(policyTags).reduce<PolicyTagLists>((acc, key) => {
                acc[key] = {
                    ...acc[key],
                    required,
                };
                return acc;
            }, {}),
        },
    });

    onyxData.optimisticData?.push(getUpdatedTagsData(requiresTag));
    onyxData.failureData?.push(getUpdatedTagsData(!requiresTag));
    onyxData.successData?.push(getUpdatedTagsData(requiresTag));

    const parameters = {
        policyID,
        requiresTag,
    };

    API.write(WRITE_COMMANDS.SET_POLICY_REQUIRES_TAG, parameters, onyxData);
}

function setPolicyTagsRequired(policyID: string, requiresTag: boolean, tagListIndex: number) {
    const policyTag = PolicyUtils.getTagLists(allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`] ?? {})?.at(tagListIndex);

    if (!policyTag) {
        return;
    }

    if (!policyTag.name) {
        return;
    }

    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
                value: {
                    [policyTag.name]: {
                        required: requiresTag,
                        pendingFields: {required: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                        errorFields: {required: null},
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
                value: {
                    [policyTag.name]: {
                        pendingFields: {required: null},
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
                value: {
                    [policyTag.name]: {
                        required: policyTag.required,
                        pendingFields: {required: null},
                        errorFields: {
                            required: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.tags.genericFailureMessage'),
                        },
                    },
                },
            },
        ],
    };

    const parameters: SetPolicyTagsRequired = {
        policyID,
        tagListIndex,
        requireTagList: requiresTag,
    };

    API.write(WRITE_COMMANDS.SET_POLICY_TAGS_REQUIRED, parameters, onyxData);
}

function setPolicyTagGLCode(policyID: string, tagName: string, tagListIndex: number, glCode: string) {
    const tagListName = PolicyUtils.getTagListName(allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`], tagListIndex);
    const policyTagToUpdate = allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`]?.[tagListName]?.tags?.[tagName] ?? {};
    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
                value: {
                    [tagListName]: {
                        tags: {
                            [tagName]: {
                                ...policyTagToUpdate,
                                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                pendingFields: {
                                    // eslint-disable-next-line @typescript-eslint/naming-convention
                                    'GL Code': CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                },
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                'GL Code': glCode,
                            },
                        },
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
                value: {
                    [tagListName]: {
                        tags: {
                            [tagName]: {
                                errors: null,
                                pendingAction: null,
                                pendingFields: {
                                    // eslint-disable-next-line @typescript-eslint/naming-convention
                                    'GL Code': null,
                                },
                            },
                        },
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
                value: {
                    [tagListName]: {
                        tags: {
                            [tagName]: {
                                ...policyTagToUpdate,
                                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.tags.updateGLCodeFailureMessage'),
                            },
                        },
                    },
                },
            },
        ],
    };

    const parameters: UpdatePolicyTagGLCodeParams = {
        policyID,
        tagName,
        tagListName,
        tagListIndex,
        glCode,
    };

    API.write(WRITE_COMMANDS.UPDATE_POLICY_TAG_GL_CODE, parameters, onyxData);
}

function setPolicyTagApprover(policyID: string, tag: string, approver: string) {
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const policy = PolicyUtils.getPolicy(policyID);
    const prevApprovalRules = policy?.rules?.approvalRules ?? [];
    const approverRuleToUpdate = PolicyUtils.getTagApproverRule(policyID, tag);
    const filteredApprovalRules = approverRuleToUpdate ? prevApprovalRules.filter((rule) => rule.id !== approverRuleToUpdate.id) : prevApprovalRules;
    const toBeUnselected = approverRuleToUpdate?.approver === approver;

    const updatedApproverRule = approverRuleToUpdate
        ? {...approverRuleToUpdate, approver}
        : {
              applyWhen: [
                  {
                      condition: CONST.POLICY.RULE_CONDITIONS.MATCHES,
                      field: CONST.POLICY.FIELDS.TAG,
                      value: tag,
                  },
              ],
              approver,
              id: '-1',
          };

    const updatedApprovalRules = toBeUnselected ? filteredApprovalRules : [...filteredApprovalRules, updatedApproverRule];

    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    rules: {
                        approvalRules: updatedApprovalRules,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    rules: {
                        approvalRules: updatedApprovalRules,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    rules: {
                        approvalRules: prevApprovalRules,
                    },
                },
            },
        ],
    };

    const parameters: SetPolicyTagApproverParams = {
        policyID,
        tagName: tag,
        approver: toBeUnselected ? null : approver,
    };

    API.write(WRITE_COMMANDS.SET_POLICY_TAG_APPROVER, parameters, onyxData);
}

function downloadTagsCSV(policyID: string, onDownloadFailed: () => void) {
    const finalParameters = enhanceParameters(WRITE_COMMANDS.EXPORT_TAGS_CSV, {
        policyID,
    });
    const fileName = 'Tags.csv';

    const formData = new FormData();
    Object.entries(finalParameters).forEach(([key, value]) => {
        formData.append(key, String(value));
    });

    fileDownload(ApiUtils.getCommandURL({command: WRITE_COMMANDS.EXPORT_TAGS_CSV}), fileName, '', false, formData, CONST.NETWORK.METHOD.POST, onDownloadFailed);
}

function downloadMultiLevelIndependentTagsCSV(policyID: string, onDownloadFailed: () => void) {
    const finalParameters = enhanceParameters(WRITE_COMMANDS.EXPORT_MULTI_LEVEL_TAGS_CSV, {
        policyID,
    });
    const fileName = 'MultiLevelTags.csv';

    const formData = new FormData();
    Object.entries(finalParameters).forEach(([key, value]) => {
        formData.append(key, String(value));
    });

    fileDownload(ApiUtils.getCommandURL({command: WRITE_COMMANDS.EXPORT_MULTI_LEVEL_TAGS_CSV}), fileName, '', false, formData, CONST.NETWORK.METHOD.POST, onDownloadFailed);
}

function getPolicyTagsData(policyID: string | undefined) {
    return allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`] ?? {};
}

export {
    buildOptimisticPolicyRecentlyUsedTags,
    setPolicyRequiresTag,
    setPolicyTagsRequired,
    createPolicyTag,
    clearPolicyTagErrors,
    clearPolicyTagListErrors,
    clearPolicyTagListErrorField,
    deletePolicyTags,
    enablePolicyTags,
    setWorkspaceTagRequired,
    openPolicyTagsPage,
    renamePolicyTag,
    renamePolicyTagList,
    setWorkspaceTagEnabled,
    setPolicyTagGLCode,
    setPolicyTagApprover,
    importPolicyTags,
    downloadTagsCSV,
    getPolicyTagsData,
    downloadMultiLevelIndependentTagsCSV,
    cleanPolicyTags,
    setImportedSpreadsheetIsImportingMultiLevelTags,
    setImportedSpreadsheetIsImportingIndependentMultiLevelTags,
    setImportedSpreadsheetIsFirstLineHeader,
    setImportedSpreadsheetIsGLAdjacent,
    setImportedSpreadsheetFileURI,
    importMultiLevelTags,
};
