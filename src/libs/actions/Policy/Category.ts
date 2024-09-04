import lodashUnion from 'lodash/union';
import type {NullishDeep, OnyxCollection, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {EnablePolicyCategoriesParams, OpenPolicyCategoriesPageParams, SetPolicyDistanceRatesDefaultCategoryParams, UpdatePolicyCategoryGLCodeParams} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import {translateLocal} from '@libs/Localize';
import Log from '@libs/Log';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import {navigateWhenEnableFeature, removePendingFieldsFromCustomUnit} from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyCategories, PolicyCategory, RecentlyUsedCategories, Report} from '@src/types/onyx';
import type {CustomUnit} from '@src/types/onyx/Policy';
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
                        prompt: translateLocal('spreadsheet.importCategoriesSuccessfullDescription', categoriesLength),
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
                ...policyCategories[key],
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
    const shouldDisableRequiresCategory = !OptionsListUtils.hasEnabledOptions({...policyCategories, ...optimisticPolicyCategoriesData});
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
                    ...Object.keys(categoriesToUpdate).reduce<PolicyCategories>((acc, key) => {
                        acc[key] = {
                            ...policyCategories[key],
                            ...categoriesToUpdate[key],
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
                            ...categoriesToUpdate[key],
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

function createPolicyCategory(policyID: string, categoryName: string) {
    const onyxData = buildOptimisticPolicyCategories(policyID, [categoryName]);

    const parameters = {
        policyID,
        categories: JSON.stringify([{name: categoryName}]),
    };

    API.write(WRITE_COMMANDS.CREATE_WORKSPACE_CATEGORIES, parameters, onyxData);
}

function importPolicyCategories(policyID: string, categories: PolicyCategory[]) {
    const onyxData = updateImportSpreadsheetData(categories.length);

    const parameters = {
        policyID,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        categories: JSON.stringify([...categories.map((category) => ({name: category.name, enabled: category.enabled, 'GL Code': String(category['GL Code'])}))]),
    };

    API.write(WRITE_COMMANDS.IMPORT_CATEGORIES_SREADSHEET, parameters, onyxData);
}

function renamePolicyCategory(policyID: string, policyCategory: {oldName: string; newName: string}) {
    const policyCategoryToUpdate = allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`]?.[policyCategory.oldName];

    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: {
                    [policyCategory.oldName]: null,
                    [policyCategory.newName]: {
                        ...policyCategoryToUpdate,
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
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
                value: {
                    [policyCategory.oldName]: null,
                    [policyCategory.newName]: {
                        ...policyCategoryToUpdate,
                        name: policyCategory.newName,
                        errors: null,
                        pendingAction: null,
                        pendingFields: {
                            ...(policyCategoryToUpdate?.pendingFields ?? {}),
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
                        name: policyCategory.oldName,
                        errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.categories.updateFailureMessage'),
                        pendingAction: null,
                    },
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
        acc[categoryName] = {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE};
        return acc;
    }, {});
    const shouldDisableRequiresCategory = !OptionsListUtils.hasEnabledOptions(
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

function enablePolicyCategories(policyID: string, enabled: boolean) {
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

    API.write(WRITE_COMMANDS.ENABLE_POLICY_CATEGORIES, parameters, onyxData);

    if (enabled && getIsNarrowLayout()) {
        navigateWhenEnableFeature(policyID);
    }
}

function setPolicyDistanceRatesDefaultCategory(policyID: string, currentCustomUnit: CustomUnit, newCustomUnit: CustomUnit) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                customUnits: {
                    [newCustomUnit.customUnitID]: {
                        ...newCustomUnit,
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
                    [newCustomUnit.customUnitID]: {
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
                    [currentCustomUnit.customUnitID]: {
                        ...currentCustomUnit,
                        errorFields: {defaultCategory: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')},
                        pendingFields: {defaultCategory: null},
                    },
                },
            },
        },
    ];

    const params: SetPolicyDistanceRatesDefaultCategoryParams = {
        policyID,
        customUnit: JSON.stringify(removePendingFieldsFromCustomUnit(newCustomUnit)),
    };

    API.write(WRITE_COMMANDS.SET_POLICY_DISTANCE_RATES_DEFAULT_CATEGORY, params, {optimisticData, successData, failureData});
}

export {
    openPolicyCategoriesPage,
    buildOptimisticPolicyRecentlyUsedCategories,
    setWorkspaceCategoryEnabled,
    setWorkspaceRequiresCategory,
    setPolicyCategoryPayrollCode,
    createPolicyCategory,
    renamePolicyCategory,
    setPolicyCategoryGLCode,
    clearCategoryErrors,
    enablePolicyCategories,
    setPolicyDistanceRatesDefaultCategory,
    deleteWorkspaceCategories,
    buildOptimisticPolicyCategories,
    importPolicyCategories,
};
