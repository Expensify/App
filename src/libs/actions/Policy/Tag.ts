import type {NullishDeep, OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {EnablePolicyTagsParams, OpenPolicyTagsPageParams, RenamePolicyTaglistParams, RenamePolicyTagsParams, SetPolicyTagsEnabled, SetPolicyTagsRequired} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import Log from '@libs/Log';
import * as PolicyUtils from '@libs/PolicyUtils';
import {navigateWhenEnableFeature} from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyTag, PolicyTagList, PolicyTags, RecentlyUsedTags, Report} from '@src/types/onyx';
import type {OnyxValueWithOfflineFeedback} from '@src/types/onyx/OnyxCommon';
import type {Attributes, Rate} from '@src/types/onyx/Policy';
import type {OnyxData} from '@src/types/onyx/Request';

type NewCustomUnit = {
    customUnitID: string;
    name: string;
    attributes: Attributes;
    rates: Rate;
};

const allPolicies: OnyxCollection<Policy> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY,
    callback: (val, key) => {
        if (!key) {
            return;
        }
        if (val === null || val === undefined) {
            // If we are deleting a policy, we have to check every report linked to that policy
            // and unset the draft indicator (pencil icon) alongside removing any draft comments. Clearing these values will keep the newly archived chats from being displayed in the LHN.
            // More info: https://github.com/Expensify/App/issues/14260
            const policyID = key.replace(ONYXKEYS.COLLECTION.POLICY, '');
            const policyReports = ReportUtils.getAllPolicyReports(policyID);
            const cleanUpMergeQueries: Record<`${typeof ONYXKEYS.COLLECTION.REPORT}${string}`, NullishDeep<Report>> = {};
            const cleanUpSetQueries: Record<`${typeof ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${string}` | `${typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${string}`, null> = {};
            policyReports.forEach((policyReport) => {
                if (!policyReport) {
                    return;
                }
                const {reportID} = policyReport;
                cleanUpSetQueries[`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`] = null;
                cleanUpSetQueries[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${reportID}`] = null;
            });
            Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, cleanUpMergeQueries);
            Onyx.multiSet(cleanUpSetQueries);
            delete allPolicies[key];
            return;
        }

        allPolicies[key] = val;
    },
});

let allPolicyTags: OnyxCollection<PolicyTagList> = {};
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

let allRecentlyUsedTags: OnyxCollection<RecentlyUsedTags> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS,
    waitForCollectionCallback: true,
    callback: (val) => (allRecentlyUsedTags = val),
});

function openPolicyTagsPage(policyID: string) {
    if (!policyID) {
        Log.warn('openPolicyTasgPage invalid params', {policyID});
        return;
    }

    const params: OpenPolicyTagsPageParams = {
        policyID,
    };

    API.read(READ_COMMANDS.OPEN_POLICY_TAGS_PAGE, params);
}

function buildOptimisticPolicyRecentlyUsedTags(policyID?: string, transactionTags?: string): RecentlyUsedTags {
    if (!policyID || !transactionTags) {
        return {};
    }

    const policyTags = allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`] ?? {};
    const policyTagKeys = PolicyUtils.getSortedTagKeys(policyTags);
    const policyRecentlyUsedTags = allRecentlyUsedTags?.[`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${policyID}`] ?? {};
    const newOptimisticPolicyRecentlyUsedTags: RecentlyUsedTags = {};

    TransactionUtils.getTagArrayFromName(transactionTags).forEach((tag, index) => {
        if (!tag) {
            return;
        }

        const tagListKey = policyTagKeys[index];
        newOptimisticPolicyRecentlyUsedTags[tagListKey] = [...new Set([tag, ...(policyRecentlyUsedTags[tagListKey] ?? [])])];
    });

    return newOptimisticPolicyRecentlyUsedTags;
}

function createPolicyTag(policyID: string, tagName: string) {
    const policyTag = PolicyUtils.getTagLists(allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`] ?? {})?.[0] ?? {};
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
                                pendingAction: null,
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

function setWorkspaceTagEnabled(policyID: string, tagsToUpdate: Record<string, {name: string; enabled: boolean}>, tagListIndex: number) {
    const policyTag = PolicyUtils.getTagLists(allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`] ?? {})?.[tagListIndex] ?? {};

    const onyxData: OnyxData = {
        optimisticData: [
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
                                        enabled: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                    },
                                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                };

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

function deletePolicyTags(policyID: string, tagsToDelete: string[]) {
    const policyTag = PolicyUtils.getTagLists(allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`] ?? {})?.[0] ?? {};

    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
                value: {
                    [policyTag.name]: {
                        tags: {
                            ...tagsToDelete.reduce<Record<string, Partial<OnyxValueWithOfflineFeedback<PolicyTag>>>>((acc, tagName) => {
                                acc[tagName] = {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE};
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
                                acc[tagName] = {pendingAction: null, errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.tags.deleteFailureMessage')};
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

function clearPolicyTagErrors(policyID: string, tagName: string, tagListIndex: number) {
    const tagListName = Object.keys(allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`] ?? {})[tagListIndex];
    const tag = allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`]?.[tagListName].tags?.[tagName];
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

function clearPolicyTagListErrorField(policyID: string, tagListIndex: number, errorField: string) {
    const policyTag = PolicyUtils.getTagLists(allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`] ?? {})?.[tagListIndex] ?? {};

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
    const policyTag = PolicyUtils.getTagLists(allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`] ?? {})?.[tagListIndex] ?? {};

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
    const tagList = PolicyUtils.getTagLists(allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`] ?? {})?.[tagListIndex] ?? {};
    const tag = tagList.tags?.[policyTag.oldName];
    const oldTagName = policyTag.oldName;
    const newTagName = PolicyUtils.escapeTagName(policyTag.newName);
    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
                value: {
                    [tagList.name]: {
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

function enablePolicyTags(policyID: string, enabled: boolean) {
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

    const policyTagList = allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`];
    if (!policyTagList) {
        const defaultTagList: PolicyTagList = {
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
        const policyTag = PolicyUtils.getTagLists(policyTagList)[0];
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

    API.write(WRITE_COMMANDS.ENABLE_POLICY_TAGS, parameters, onyxData);

    if (enabled && getIsNarrowLayout()) {
        navigateWhenEnableFeature(policyID);
    }
}

function renamePolicyTaglist(policyID: string, policyTagListName: {oldName: string; newName: string}, policyTags: OnyxEntry<PolicyTagList>, tagListIndex: number) {
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
    const parameters: RenamePolicyTaglistParams = {
        policyID,
        oldName,
        newName,
        tagListIndex,
    };

    API.write(WRITE_COMMANDS.RENAME_POLICY_TAG_LIST, parameters, onyxData);
}

function setPolicyRequiresTag(policyID: string, requiresTag: boolean) {
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

    const parameters = {
        policyID,
        requiresTag,
    };

    API.write(WRITE_COMMANDS.SET_POLICY_REQUIRES_TAG, parameters, onyxData);
}

function setPolicyTagsRequired(policyID: string, requiresTag: boolean, tagListIndex: number) {
    const policyTag = PolicyUtils.getTagLists(allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`] ?? {})?.[tagListIndex] ?? {};

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
    openPolicyTagsPage,
    renamePolicyTag,
    renamePolicyTaglist,
    setWorkspaceTagEnabled,
};

export type {NewCustomUnit};
