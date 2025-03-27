import lodashCloneDeep from 'lodash/cloneDeep';
import lodashUnion from 'lodash/union';
import type {NullishDeep, OnyxCollection, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {PartialDeep} from 'type-fest';
import * as API from '@libs/API';
import type {
    EnablePolicyCategoriesParams,
    GetPolicyCategoriesParams,
    OpenPolicyCategoriesPageParams,
    RemovePolicyCategoryReceiptsRequiredParams,
    SetPolicyCategoryApproverParams,
    SetPolicyCategoryDescriptionRequiredParams,
    SetPolicyCategoryMaxAmountParams,
    SetPolicyCategoryReceiptsRequiredParams,
    SetPolicyCategoryTaxParams,
    SetWorkspaceCategoryDescriptionHintParams,
    UpdatePolicyCategoryGLCodeParams,
} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as ApiUtils from '@libs/ApiUtils';
import * as CategoryUtils from '@libs/CategoryUtils';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import fileDownload from '@libs/fileDownload';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import {translateLocal} from '@libs/Localize';
import Log from '@libs/Log';
import enhanceParameters from '@libs/Network/enhanceParameters';
import {hasEnabledOptions} from '@libs/OptionsListUtils';
import {getPolicy, goBackWhenEnableFeature} from '@libs/PolicyUtils';
import {getAllPolicyReports} from '@libs/ReportUtils';
import {resolveEnableFeatureConflicts} from '@userActions/RequestConflictUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyCategories, PolicyCategory, RecentlyUsedCategories, Report} from '@src/types/onyx';
import type {ApprovalRule, ExpenseRule, MccGroup} from '@src/types/onyx/Policy';
import type {PolicyCategoryExpenseLimitType} from '@src/types/onyx/PolicyCategory';
import type {OnyxData} from '@src/types/onyx/Request';

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
            const policyReports = getAllPolicyReports(policyID);
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

let allRecentlyUsedCategories: OnyxCollection<RecentlyUsedCategories> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES,
    waitForCollectionCallback: true,
    callback: (val) => (allRecentlyUsedCategories = val),
});

let allPolicyCategories: OnyxCollection<PolicyCategories> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY_CATEGORIES,
    waitForCollectionCallback: true,
    callback: (val) => (allPolicyCategories = val),
});

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
            errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.categories.createFailureMessage'),
            pendingAction: null,
        };
        return acc;
    }, {});

    const onyxData: OnyxData = {
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

function buildOptimisticMccGroup() {
    const optimisticMccGroup: Record<'mccGroup', Record<string, MccGroup>> = {
        mccGroup: {
            airlines: {
                category: CONST.POLICY.DEFAULT_CATEGORIES.TRAVEL,
                groupID: 'airlines',
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            },
            commuter: {
                category: CONST.POLICY.DEFAULT_CATEGORIES.CAR,
                groupID: 'commuter',
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            },
            gas: {
                category: CONST.POLICY.DEFAULT_CATEGORIES.CAR,
                groupID: 'gas',
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            },
            goods: {
                category: CONST.POLICY.DEFAULT_CATEGORIES.MATERIALS,
                groupID: 'goods',
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            },
            groceries: {
                category: CONST.POLICY.DEFAULT_CATEGORIES.MEALS_AND_ENTERTAINMENT,
                groupID: 'groceries',
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            },
            hotel: {
                category: CONST.POLICY.DEFAULT_CATEGORIES.TRAVEL,
                groupID: 'hotel',
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            },
            mail: {
                category: CONST.POLICY.DEFAULT_CATEGORIES.OFFICE_SUPPLIES,
                groupID: 'mail',
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            },
            meals: {
                category: CONST.POLICY.DEFAULT_CATEGORIES.MEALS_AND_ENTERTAINMENT,
                groupID: 'meals',
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            },
            rental: {
                category: CONST.POLICY.DEFAULT_CATEGORIES.TRAVEL,
                groupID: 'rental',
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            },
            services: {
                category: CONST.POLICY.DEFAULT_CATEGORIES.PROFESSIONAL_SERVICES,
                groupID: 'services',
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            },
            taxi: {
                category: CONST.POLICY.DEFAULT_CATEGORIES.TRAVEL,
                groupID: 'taxi',
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            },
            uncategorized: {
                category: CONST.POLICY.DEFAULT_CATEGORIES.OTHER,
                groupID: 'uncategorized',
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            },
            utilities: {
                category: CONST.POLICY.DEFAULT_CATEGORIES.UTILITIES,
                groupID: 'utilities',
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            },
        },
    };

    const successMccGroup: Record<'mccGroup', Record<string, Partial<MccGroup>>> = {mccGroup: {}};
    Object.keys(optimisticMccGroup.mccGroup).forEach((key) => (successMccGroup.mccGroup[key] = {pendingAction: null}));

    const mccGroupData = {
        optimisticData: optimisticMccGroup,
        successData: successMccGroup,
        failureData: {mccGroup: null},
    };

    return mccGroupData;
}

function updateImportSpreadsheetData(categoriesLength: number) {
    const onyxData: OnyxData = {
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.IMPORTED_SPREADSHEET,
                value: {
                    shouldFinalModalBeOpened: true,
                    importFinalModal: {
                        title: translateLocal('spreadsheet.importSuccessfullTitle'),
                        prompt: translateLocal('spreadsheet.importCategoriesSuccessfullDescription', {categories: categoriesLength}),
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
                    importFinalModal: {title: translateLocal('spreadsheet.importFailedTitle'), prompt: translateLocal('spreadsheet.importFailedDescription')},
                },
            },
        ],
    };

    return onyxData;
}

function openPolicyCategoriesPage(policyID: string) {
    if (!policyID) {
        Log.warn('openPolicyCategoriesPage invalid params', {policyID});
        return;
    }

    const params: OpenPolicyCategoriesPageParams = {
        policyID,
    };

    API.read(READ_COMMANDS.OPEN_POLICY_CATEGORIES_PAGE, params);
}

function getPolicyCategories(policyID: string) {
    if (!policyID || policyID === '-1' || policyID === CONST.POLICY.ID_FAKE) {
        Log.warn('GetPolicyCategories invalid params', {policyID});
        return;
    }

    const params: GetPolicyCategoriesParams = {
        policyID,
    };

    API.read(READ_COMMANDS.GET_POLICY_CATEGORIES, params);
}

function buildOptimisticPolicyRecentlyUsedCategories(policyID?: string, category?: string) {
    if (!policyID || !category) {
        return [];
    }

    const policyRecentlyUsedCategories = allRecentlyUsedCategories?.[`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${policyID}`] ?? [];

    return lodashUnion([category], policyRecentlyUsedCategories);
}

function setWorkspaceCategoryEnabled(policyID: string, categoriesToUpdate: Record<string, {name: string; enabled: boolean}>) {
    const policyCategories = allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`] ?? {};
    const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
    const optimisticPolicyCategoriesData = {
        ...Object.keys(categoriesToUpdate).reduce<PolicyCategories>((acc, key) => {
            acc[key] = {
                ...categoriesToUpdate[key],
                errors: null,
                pendingFields: {
                    enabled: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            };

            return acc;
        }, {}),
    };
    const shouldDisableRequiresCategory = !hasEnabledOptions({...policyCategories, ...optimisticPolicyCategoriesData});
    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: optimisticPolicyCategoriesData,
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: {
                    ...Object.keys(categoriesToUpdate).reduce<PartialDeep<PolicyCategories>>((acc, key) => {
                        acc[key] = {
                            errors: null,
                            pendingFields: {
                                enabled: null,
                            },
                            pendingAction: null,
                        };

                        return acc;
                    }, {}),
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: {
                    ...Object.keys(categoriesToUpdate).reduce<PolicyCategories>((acc, key) => {
                        acc[key] = {
                            ...policyCategories[key],
                            errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.categories.updateFailureMessage'),
                            pendingFields: {
                                enabled: null,
                            },
                            pendingAction: null,
                        };

                        return acc;
                    }, {}),
                },
            },
        ],
    };
    if (shouldDisableRequiresCategory) {
        onyxData.optimisticData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                requiresCategory: false,
                pendingFields: {
                    requiresCategory: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        });
        onyxData.successData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                pendingFields: {
                    requiresCategory: null,
                },
            },
        });
        onyxData.failureData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                requiresCategory: policy?.requiresCategory,
                pendingFields: {
                    requiresCategory: null,
                },
            },
        });
    }

    const parameters = {
        policyID,
        categories: JSON.stringify(Object.keys(categoriesToUpdate).map((key) => categoriesToUpdate[key])),
    };

    API.write(WRITE_COMMANDS.SET_WORKSPACE_CATEGORIES_ENABLED, parameters, onyxData);
}

function setPolicyCategoryDescriptionRequired(policyID: string, categoryName: string, areCommentsRequired: boolean) {
    const policyCategoryToUpdate = allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`]?.[categoryName];
    const originalAreCommentsRequired = policyCategoryToUpdate?.areCommentsRequired;
    const originalCommentHint = policyCategoryToUpdate?.commentHint;

    // When areCommentsRequired is set to false, commentHint has to be reset
    const updatedCommentHint = areCommentsRequired ? allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`]?.[categoryName]?.commentHint : '';

    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: {
                    [categoryName]: {
                        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        pendingFields: {
                            areCommentsRequired: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        },
                        areCommentsRequired,
                        commentHint: updatedCommentHint,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: {
                    [categoryName]: {
                        pendingAction: null,
                        pendingFields: {
                            areCommentsRequired: null,
                        },
                        areCommentsRequired,
                        commentHint: updatedCommentHint,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: {
                    [categoryName]: {
                        errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                        pendingAction: null,
                        pendingFields: {
                            areCommentsRequired: null,
                        },
                        areCommentsRequired: originalAreCommentsRequired,
                        commentHint: originalCommentHint,
                    },
                },
            },
        ],
    };

    const parameters: SetPolicyCategoryDescriptionRequiredParams = {
        policyID,
        categoryName,
        areCommentsRequired,
    };

    API.write(WRITE_COMMANDS.SET_POLICY_CATEGORY_DESCRIPTION_REQUIRED, parameters, onyxData);
}

function setPolicyCategoryReceiptsRequired(policyID: string, categoryName: string, maxAmountNoReceipt: number) {
    const originalMaxAmountNoReceipt = allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`]?.[categoryName]?.maxAmountNoReceipt;

    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: {
                    [categoryName]: {
                        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        pendingFields: {
                            maxAmountNoReceipt: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        },
                        maxAmountNoReceipt,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: {
                    [categoryName]: {
                        pendingAction: null,
                        pendingFields: {
                            maxAmountNoReceipt: null,
                        },
                        maxAmountNoReceipt,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: {
                    [categoryName]: {
                        errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                        pendingAction: null,
                        pendingFields: {
                            maxAmountNoReceipt: null,
                        },
                        maxAmountNoReceipt: originalMaxAmountNoReceipt,
                    },
                },
            },
        ],
    };

    const parameters: SetPolicyCategoryReceiptsRequiredParams = {
        policyID,
        categoryName,
        maxExpenseAmountNoReceipt: maxAmountNoReceipt,
    };

    API.write(WRITE_COMMANDS.SET_POLICY_CATEGORY_RECEIPTS_REQUIRED, parameters, onyxData);
}

function removePolicyCategoryReceiptsRequired(policyID: string, categoryName: string) {
    const originalMaxAmountNoReceipt = allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`]?.[categoryName]?.maxAmountNoReceipt;

    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: {
                    [categoryName]: {
                        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        pendingFields: {
                            maxAmountNoReceipt: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        },
                        maxAmountNoReceipt: null,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: {
                    [categoryName]: {
                        pendingAction: null,
                        pendingFields: {
                            maxAmountNoReceipt: null,
                        },
                        maxAmountNoReceipt: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: {
                    [categoryName]: {
                        errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                        pendingAction: null,
                        pendingFields: {
                            maxAmountNoReceipt: null,
                        },
                        maxAmountNoReceipt: originalMaxAmountNoReceipt,
                    },
                },
            },
        ],
    };

    const parameters: RemovePolicyCategoryReceiptsRequiredParams = {
        policyID,
        categoryName,
    };

    API.write(WRITE_COMMANDS.REMOVE_POLICY_CATEGORY_RECEIPTS_REQUIRED, parameters, onyxData);
}

function createPolicyCategory(policyID: string, categoryName: string) {
    const onyxData = buildOptimisticPolicyCategories(policyID, [categoryName]);

    const parameters = {
        policyID,
        categories: JSON.stringify([{name: categoryName}]),
    };

    API.write(WRITE_COMMANDS.CREATE_WORKSPACE_CATEGORIES, parameters, onyxData);
}

function importPolicyCategories(policyID: string, categories: PolicyCategory[]) {
    const uniqueCategories = categories.reduce<Record<string, PolicyCategory>>((acc, category) => {
        if (!category.name) {
            return acc;
        }
        acc[category.name] = category;
        return acc;
    }, {});
    const categoriesLength = Object.keys(uniqueCategories).length;
    const onyxData = updateImportSpreadsheetData(categoriesLength);

    const parameters = {
        policyID,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        categories: JSON.stringify([...categories.map((category) => ({name: category.name, enabled: category.enabled, 'GL Code': String(category['GL Code'])}))]),
    };

    API.write(WRITE_COMMANDS.IMPORT_CATEGORIES_SPREADSHEET, parameters, onyxData);
}

function renamePolicyCategory(policyID: string, policyCategory: {oldName: string; newName: string}) {
    const policy = getPolicy(policyID);
    const policyCategoryToUpdate = allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`]?.[policyCategory.oldName];

    const policyCategoryApproverRule = CategoryUtils.getCategoryApproverRule(policy?.rules?.approvalRules ?? [], policyCategory.oldName);
    const policyCategoryExpenseRule = CategoryUtils.getCategoryExpenseRule(policy?.rules?.expenseRules ?? [], policyCategory.oldName);
    const approvalRules = policy?.rules?.approvalRules ?? [];
    const expenseRules = policy?.rules?.expenseRules ?? [];
    const mccGroup = policy?.mccGroup ?? {};
    const updatedApprovalRules: ApprovalRule[] = lodashCloneDeep(approvalRules);
    const updatedExpenseRules: ExpenseRule[] = lodashCloneDeep(expenseRules);
    const clonedMccGroup: Record<string, MccGroup> = lodashCloneDeep(mccGroup);
    const updatedMccGroup = CategoryUtils.updateCategoryInMccGroup(clonedMccGroup, policyCategory.oldName, policyCategory.newName);
    const updatedMccGroupWithClearedPendingAction = CategoryUtils.updateCategoryInMccGroup(clonedMccGroup, policyCategory.oldName, policyCategory.newName, true);

    if (policyCategoryExpenseRule) {
        const ruleIndex = updatedExpenseRules.findIndex((rule) => rule.id === policyCategoryExpenseRule.id);
        policyCategoryExpenseRule.applyWhen = policyCategoryExpenseRule.applyWhen.map((applyWhen) => ({
            ...applyWhen,
            ...(applyWhen.field === CONST.POLICY.FIELDS.CATEGORY && applyWhen.value === policyCategory.oldName && {value: policyCategory.newName}),
        }));
        updatedExpenseRules[ruleIndex] = policyCategoryExpenseRule;
    }

    // Its related by name, so the corresponding rule has to be updated to handle offline scenario
    if (policyCategoryApproverRule) {
        const indexToUpdate = updatedApprovalRules.findIndex((rule) => rule.id === policyCategoryApproverRule.id);
        policyCategoryApproverRule.applyWhen = policyCategoryApproverRule.applyWhen.map((ruleCondition) => {
            const {value, field, condition} = ruleCondition;

            if (value === policyCategory.oldName && field === CONST.POLICY.FIELDS.CATEGORY && condition === CONST.POLICY.RULE_CONDITIONS.MATCHES) {
                return {...ruleCondition, value: policyCategory.newName};
            }

            return ruleCondition;
        });
        updatedApprovalRules[indexToUpdate] = policyCategoryApproverRule;
    }

    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: {
                    [policyCategory.oldName]: null,
                    [policyCategory.newName]: {
                        ...policyCategoryToUpdate,
                        errors: null,
                        name: policyCategory.newName,
                        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        pendingFields: {
                            ...(policyCategoryToUpdate?.pendingFields ?? {}),
                            name: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        },
                        previousCategoryName: policyCategory.oldName,
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    rules: {
                        approvalRules: updatedApprovalRules,
                        expenseRules: updatedExpenseRules,
                    },
                    mccGroup: updatedMccGroup,
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    mccGroup: updatedMccGroupWithClearedPendingAction,
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: {
                    [policyCategory.newName]: {
                        pendingAction: null,
                        pendingFields: {
                            name: null,
                        },
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: {
                    [policyCategory.newName]: null,
                    [policyCategory.oldName]: {
                        ...policyCategoryToUpdate,
                        errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.categories.updateFailureMessage'),
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    rules: {
                        approvalRules,
                    },
                    mccGroup,
                },
            },
        ],
    };

    const parameters = {
        policyID,
        categories: JSON.stringify({[policyCategory.oldName]: policyCategory.newName}),
    };

    API.write(WRITE_COMMANDS.RENAME_WORKSPACE_CATEGORY, parameters, onyxData);
}

function setPolicyCategoryPayrollCode(policyID: string, categoryName: string, payrollCode: string) {
    const policyCategoryToUpdate = allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`]?.[categoryName] ?? {};

    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: {
                    [categoryName]: {
                        ...policyCategoryToUpdate,
                        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        pendingFields: {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            'Payroll Code': CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        },
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        'Payroll Code': payrollCode,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: {
                    [categoryName]: {
                        ...policyCategoryToUpdate,
                        pendingAction: null,
                        pendingFields: {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            'Payroll Code': null,
                        },
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        'Payroll Code': payrollCode,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: {
                    [categoryName]: {
                        ...policyCategoryToUpdate,
                        errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.categories.updatePayrollCodeFailureMessage'),
                        pendingAction: null,
                        pendingFields: {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            'Payroll Code': null,
                        },
                    },
                },
            },
        ],
    };

    const parameters = {
        policyID,
        categoryName,
        payrollCode,
    };

    API.write(WRITE_COMMANDS.UPDATE_POLICY_CATEGORY_PAYROLL_CODE, parameters, onyxData);
}

function setPolicyCategoryGLCode(policyID: string, categoryName: string, glCode: string) {
    const policyCategoryToUpdate = allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`]?.[categoryName] ?? {};

    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: {
                    [categoryName]: {
                        ...policyCategoryToUpdate,
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
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: {
                    [categoryName]: {
                        ...policyCategoryToUpdate,
                        pendingAction: null,
                        pendingFields: {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            'GL Code': null,
                        },
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        'GL Code': glCode,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: {
                    [categoryName]: {
                        ...policyCategoryToUpdate,
                        errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.categories.updateGLCodeFailureMessage'),
                        pendingAction: null,
                        pendingFields: {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            'GL Code': null,
                        },
                    },
                },
            },
        ],
    };

    const parameters: UpdatePolicyCategoryGLCodeParams = {
        policyID,
        categoryName,
        glCode,
    };

    API.write(WRITE_COMMANDS.UPDATE_POLICY_CATEGORY_GL_CODE, parameters, onyxData);
}

function setWorkspaceRequiresCategory(policyID: string, requiresCategory: boolean) {
    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    requiresCategory,
                    errors: {
                        requiresCategory: null,
                    },
                    pendingFields: {
                        requiresCategory: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
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
                        requiresCategory: null,
                    },
                    pendingFields: {
                        requiresCategory: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    requiresCategory: !requiresCategory,
                    errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.categories.updateFailureMessage'),
                    pendingFields: {
                        requiresCategory: null,
                    },
                },
            },
        ],
    };

    const parameters = {
        policyID,
        requiresCategory,
    };

    API.write(WRITE_COMMANDS.SET_WORKSPACE_REQUIRES_CATEGORY, parameters, onyxData);
}

function clearCategoryErrors(policyID: string, categoryName: string) {
    const category = allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`]?.[categoryName];

    if (!category) {
        return;
    }

    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`, {
        [category.name]: {
            errors: null,
        },
    });
}

function deleteWorkspaceCategories(policyID: string, categoryNamesToDelete: string[]) {
    const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
    const policyCategories = allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`] ?? {};
    const optimisticPolicyCategoriesData = categoryNamesToDelete.reduce<Record<string, Partial<PolicyCategory>>>((acc, categoryName) => {
        acc[categoryName] = {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE, enabled: false};
        return acc;
    }, {});
    const shouldDisableRequiresCategory = !hasEnabledOptions(
        Object.values(policyCategories).filter((category) => !categoryNamesToDelete.includes(category.name) && category.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE),
    );
    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: optimisticPolicyCategoriesData,
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: categoryNamesToDelete.reduce<Record<string, null>>((acc, categoryName) => {
                    acc[categoryName] = null;
                    return acc;
                }, {}),
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: categoryNamesToDelete.reduce<Record<string, Partial<PolicyCategory>>>((acc, categoryName) => {
                    acc[categoryName] = {
                        pendingAction: null,
                        errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.categories.deleteFailureMessage'),
                        enabled: !!policyCategories?.[categoryName]?.enabled,
                    };
                    return acc;
                }, {}),
            },
        ],
    };
    if (shouldDisableRequiresCategory) {
        onyxData.optimisticData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                requiresCategory: false,
                pendingFields: {
                    requiresCategory: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        });
        onyxData.successData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                pendingFields: {
                    requiresCategory: null,
                },
            },
        });
        onyxData.failureData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                requiresCategory: policy?.requiresCategory,
                pendingFields: {
                    requiresCategory: null,
                },
            },
        });
    }

    const parameters = {
        policyID,
        categories: JSON.stringify(categoryNamesToDelete),
    };

    API.write(WRITE_COMMANDS.DELETE_WORKSPACE_CATEGORIES, parameters, onyxData);
}

function enablePolicyCategories(policyID: string, enabled: boolean, shouldGoBack = true) {
    const onyxUpdatesToDisableCategories: OnyxUpdate[] = [];
    if (!enabled) {
        onyxUpdatesToDisableCategories.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: Object.fromEntries(
                    Object.entries(allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`] ?? {}).map(([categoryName]) => [
                        categoryName,
                        {
                            enabled: false,
                        },
                    ]),
                ),
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    requiresCategory: false,
                },
            },
        );
    }
    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    areCategoriesEnabled: enabled,
                    pendingFields: {
                        areCategoriesEnabled: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
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
                        areCategoriesEnabled: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    areCategoriesEnabled: !enabled,
                    pendingFields: {
                        areCategoriesEnabled: null,
                    },
                },
            },
        ],
    };

    if (onyxUpdatesToDisableCategories.length > 0) {
        onyxData.optimisticData?.push(...onyxUpdatesToDisableCategories);
    }

    const parameters: EnablePolicyCategoriesParams = {policyID, enabled};

    API.write(WRITE_COMMANDS.ENABLE_POLICY_CATEGORIES, parameters, onyxData, {
        checkAndFixConflictingRequest: (persistedRequests) => resolveEnableFeatureConflicts(WRITE_COMMANDS.ENABLE_POLICY_CATEGORIES, persistedRequests, parameters),
    });

    if (enabled && getIsNarrowLayout() && shouldGoBack) {
        goBackWhenEnableFeature(policyID);
    }
}

function setPolicyCustomUnitDefaultCategory(policyID: string, customUnitID: string, oldCategory: string | undefined, category: string) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                customUnits: {
                    [customUnitID]: {
                        defaultCategory: category,
                        pendingFields: {defaultCategory: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                    },
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                customUnits: {
                    [customUnitID]: {
                        pendingFields: {defaultCategory: null},
                    },
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                customUnits: {
                    [customUnitID]: {
                        defaultCategory: oldCategory,
                        errorFields: {defaultCategory: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')},
                        pendingFields: {defaultCategory: null},
                    },
                },
            },
        },
    ];

    const params = {
        policyID,
        customUnitID,
        category,
    };

    API.write(WRITE_COMMANDS.SET_CUSTOM_UNIT_DEFAULT_CATEGORY, params, {optimisticData, successData, failureData});
}

function downloadCategoriesCSV(policyID: string, onDownloadFailed: () => void) {
    const finalParameters = enhanceParameters(WRITE_COMMANDS.EXPORT_CATEGORIES_CSV, {
        policyID,
    });

    const fileName = 'Categories.csv';

    const formData = new FormData();
    Object.entries(finalParameters).forEach(([key, value]) => {
        formData.append(key, String(value));
    });

    fileDownload(ApiUtils.getCommandURL({command: WRITE_COMMANDS.EXPORT_CATEGORIES_CSV}), fileName, '', false, formData, CONST.NETWORK.METHOD.POST, onDownloadFailed);
}

function setWorkspaceCategoryDescriptionHint(policyID: string, categoryName: string, commentHint: string) {
    const originalCommentHint = allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`]?.[categoryName]?.commentHint;

    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: {
                    [categoryName]: {
                        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        pendingFields: {
                            commentHint: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        },
                        commentHint,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: {
                    [categoryName]: {
                        pendingAction: null,
                        pendingFields: {
                            commentHint: null,
                        },
                        commentHint,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: {
                    [categoryName]: {
                        errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                        pendingAction: null,
                        pendingFields: {
                            commentHint: null,
                        },
                        commentHint: originalCommentHint,
                    },
                },
            },
        ],
    };

    const parameters: SetWorkspaceCategoryDescriptionHintParams = {
        policyID,
        categoryName,
        commentHint,
    };

    API.write(WRITE_COMMANDS.SET_WORKSPACE_CATEGORY_DESCRIPTION_HINT, parameters, onyxData);
}

function setPolicyCategoryMaxAmount(policyID: string, categoryName: string, maxExpenseAmount: string, expenseLimitType: PolicyCategoryExpenseLimitType) {
    const policyCategoryToUpdate = allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`]?.[categoryName];
    const originalMaxExpenseAmount = policyCategoryToUpdate?.maxExpenseAmount;
    const originalExpenseLimitType = policyCategoryToUpdate?.expenseLimitType;
    const parsedMaxExpenseAmount = maxExpenseAmount === '' ? null : CurrencyUtils.convertToBackendAmount(parseFloat(maxExpenseAmount));

    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: {
                    [categoryName]: {
                        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        pendingFields: {
                            maxExpenseAmount: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            expenseLimitType: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        },
                        maxExpenseAmount: parsedMaxExpenseAmount,
                        expenseLimitType,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: {
                    [categoryName]: {
                        pendingAction: null,
                        pendingFields: {
                            maxExpenseAmount: null,
                            expenseLimitType: null,
                        },
                        maxExpenseAmount: parsedMaxExpenseAmount,
                        expenseLimitType,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: {
                    [categoryName]: {
                        errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                        pendingAction: null,
                        pendingFields: {
                            maxExpenseAmount: null,
                            expenseLimitType: null,
                        },
                        maxExpenseAmount: originalMaxExpenseAmount,
                        expenseLimitType: originalExpenseLimitType,
                    },
                },
            },
        ],
    };

    const parameters: SetPolicyCategoryMaxAmountParams = {
        policyID,
        categoryName,
        maxExpenseAmount: parsedMaxExpenseAmount,
        expenseLimitType,
    };

    API.write(WRITE_COMMANDS.SET_POLICY_CATEGORY_MAX_AMOUNT, parameters, onyxData);
}

function setPolicyCategoryApprover(policyID: string, categoryName: string, approver: string) {
    const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
    const approvalRules = policy?.rules?.approvalRules ?? [];
    let updatedApprovalRules: ApprovalRule[] = lodashCloneDeep(approvalRules);
    const existingCategoryApproverRule = CategoryUtils.getCategoryApproverRule(updatedApprovalRules, categoryName);

    let newApprover = approver;

    if (!existingCategoryApproverRule) {
        updatedApprovalRules.push({
            approver,
            applyWhen: [
                {
                    condition: CONST.POLICY.RULE_CONDITIONS.MATCHES,
                    field: 'category',
                    value: categoryName,
                },
            ],
        });
    } else if (existingCategoryApproverRule?.approver === approver) {
        updatedApprovalRules = updatedApprovalRules.filter((rule) => rule.approver !== approver);
        newApprover = '';
    } else {
        const indexToUpdate = updatedApprovalRules.indexOf(existingCategoryApproverRule);
        const approvalRule = updatedApprovalRules.at(indexToUpdate);
        if (approvalRule && indexToUpdate !== -1) {
            approvalRule.approver = approver;
        }
    }

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

        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    rules: {
                        approvalRules,
                    },
                },
            },
        ],
    };

    const parameters: SetPolicyCategoryApproverParams = {
        policyID,
        categoryName,
        approver: newApprover,
    };

    API.write(WRITE_COMMANDS.SET_POLICY_CATEGORY_APPROVER, parameters, onyxData);
}

function setPolicyCategoryTax(policyID: string, categoryName: string, taxID: string) {
    const policy = getPolicy(policyID);
    const expenseRules = policy?.rules?.expenseRules ?? [];
    const updatedExpenseRules: ExpenseRule[] = lodashCloneDeep(expenseRules);
    const existingCategoryExpenseRule = updatedExpenseRules.find((rule) => rule.applyWhen.some((when) => when.value === categoryName));

    if (!existingCategoryExpenseRule) {
        updatedExpenseRules.push({
            tax: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                field_id_TAX: {
                    externalID: taxID,
                },
            },
            applyWhen: [
                {
                    condition: CONST.POLICY.RULE_CONDITIONS.MATCHES,
                    field: 'category',
                    value: categoryName,
                },
            ],
        });
    } else {
        const indexToUpdate = updatedExpenseRules.indexOf(existingCategoryExpenseRule);
        const expenseRule = updatedExpenseRules.at(indexToUpdate);

        if (expenseRule && indexToUpdate !== -1) {
            expenseRule.tax.field_id_TAX.externalID = taxID;
        }
    }

    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    rules: {
                        expenseRules: updatedExpenseRules,
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
                        expenseRules,
                    },
                },
            },
        ],
    };

    const parameters: SetPolicyCategoryTaxParams = {
        policyID,
        categoryName,
        taxID,
    };

    API.write(WRITE_COMMANDS.SET_POLICY_CATEGORY_TAX, parameters, onyxData);
}

function getPolicyCategoriesData(policyID: string | undefined) {
    return allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`] ?? {};
}

export {
    buildOptimisticPolicyCategories,
    buildOptimisticMccGroup,
    buildOptimisticPolicyRecentlyUsedCategories,
    clearCategoryErrors,
    createPolicyCategory,
    deleteWorkspaceCategories,
    downloadCategoriesCSV,
    enablePolicyCategories,
    getPolicyCategories,
    getPolicyCategoriesData,
    importPolicyCategories,
    openPolicyCategoriesPage,
    removePolicyCategoryReceiptsRequired,
    renamePolicyCategory,
    setPolicyCategoryApprover,
    setPolicyCategoryDescriptionRequired,
    setPolicyCategoryGLCode,
    setPolicyCategoryMaxAmount,
    setPolicyCategoryPayrollCode,
    setPolicyCategoryReceiptsRequired,
    setPolicyCategoryTax,
    setPolicyCustomUnitDefaultCategory,
    setWorkspaceCategoryDescriptionHint,
    setWorkspaceCategoryEnabled,
    setWorkspaceRequiresCategory,
};
