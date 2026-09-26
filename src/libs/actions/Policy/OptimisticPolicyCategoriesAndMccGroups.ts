import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyCategories, PolicyCategory} from '@src/types/onyx';
import type {MccGroup} from '@src/types/onyx/Policy';
import type {OnyxData} from '@src/types/onyx/Request';

import Onyx from 'react-native-onyx';

function buildOptimisticPolicyWithExistingCategories(policyID: string, categories: PolicyCategories) {
    const categoriesValues = Object.values(categories);
    const optimisticCategoryMap = categoriesValues.reduce<Record<string, Partial<PolicyCategory>>>((acc, category) => {
        if (category.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            return acc;
        }
        acc[category.name] = {
            ...category,
            errors: null,
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        };
        return acc;
    }, {});

    const successCategoryMap = categoriesValues.reduce<Record<string, Partial<PolicyCategory>>>((acc, category) => {
        acc[category.name] = {
            errors: null,
            pendingAction: null,
        };
        return acc;
    }, {});

    const failureCategoryMap = categoriesValues.reduce<Record<string, Partial<PolicyCategory>>>((acc, category) => {
        acc[category.name] = {
            errors: getMicroSecondOnyxErrorWithTranslationKey('workspace.categories.createFailureMessage'),
        };
        return acc;
    }, {});

    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.POLICY_CATEGORIES | typeof ONYXKEYS.COLLECTION.POLICY_CATEGORIES_DRAFT> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: optimisticCategoryMap,
            },
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES_DRAFT}${policyID}`,
                value: null,
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: successCategoryMap,
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: failureCategoryMap,
            },
        ],
    };

    return onyxData;
}

function buildOptimisticPolicyCategories(policyID: string, categories: readonly string[]) {
    const optimisticCategoryMap = categories.reduce<Record<string, Partial<PolicyCategory>>>((acc, category) => {
        acc[category] = {
            name: category,
            enabled: true,
            errors: null,
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        };
        return acc;
    }, {});

    const successCategoryMap = categories.reduce<Record<string, Partial<PolicyCategory>>>((acc, category) => {
        acc[category] = {
            errors: null,
            pendingAction: null,
        };
        return acc;
    }, {});

    const failureCategoryMap = categories.reduce<Record<string, Partial<PolicyCategory>>>((acc, category) => {
        acc[category] = {
            errors: getMicroSecondOnyxErrorWithTranslationKey('workspace.categories.createFailureMessage'),
        };
        return acc;
    }, {});

    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.POLICY_CATEGORIES | typeof ONYXKEYS.COLLECTION.POLICY_CATEGORIES_DRAFT> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: optimisticCategoryMap,
            },
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES_DRAFT}${policyID}`,
                value: null,
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: successCategoryMap,
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: failureCategoryMap,
            },
        ],
    };

    return onyxData;
}

const DEFAULT_MCC_GROUP: Record<string, MccGroup> = Object.fromEntries(
    Object.entries(CONST.POLICY.DEFAULT_MCC_GROUPS).map(([groupID, definition]) => [
        groupID,
        {
            ...definition,
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        },
    ]),
);

type DefaultMccGroupID = keyof typeof CONST.POLICY.DEFAULT_MCC_GROUPS;

function isDefaultMccGroupID(groupID: string): groupID is DefaultMccGroupID {
    return Object.hasOwn(CONST.POLICY.DEFAULT_MCC_GROUPS, groupID);
}

function buildOptimisticMccGroup() {
    const optimisticMccGroup: Record<'mccGroup', Record<string, MccGroup>> = {
        mccGroup: Object.fromEntries(Object.entries(DEFAULT_MCC_GROUP).map(([groupID, group]) => [groupID, {...group}])),
    };

    const successMccGroup: Record<'mccGroup', Record<string, Partial<MccGroup>>> = {mccGroup: {}};
    for (const key of Object.keys(optimisticMccGroup.mccGroup)) {
        successMccGroup.mccGroup[key] = {pendingAction: null};
    }

    const mccGroupData = {
        optimisticData: optimisticMccGroup,
        successData: successMccGroup,
        failureData: {mccGroup: null},
    };

    return mccGroupData;
}

export {buildOptimisticMccGroup, buildOptimisticPolicyCategories, buildOptimisticPolicyWithExistingCategories, DEFAULT_MCC_GROUP, isDefaultMccGroupID};
