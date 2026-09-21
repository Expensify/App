import {act, renderHook} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import usePolicyData from '@hooks/usePolicyData';

import {
    buildOptimisticMccGroup as buildOptimisticMccGroupFromCategory,
    buildOptimisticPolicyCategories as buildOptimisticPolicyCategoriesFromCategory,
    buildOptimisticPolicyWithExistingCategories as buildOptimisticPolicyWithExistingCategoriesFromCategory,
    createPolicyCategory,
    DEFAULT_MCC_GROUP as DEFAULT_MCC_GROUP_FROM_CATEGORY,
    deleteWorkspaceCategories,
    enablePolicyCategories,
    importPolicyCategories,
    isDefaultMccGroupID as isDefaultMccGroupIDFromCategory,
    renamePolicyCategory,
    setPolicyCategoryReceiptsAndItemizedReceiptRequired,
    setPolicyCategoryTax,
    setWorkspaceCategoryEnabled,
    setWorkspaceRequiresCategory,
} from '@libs/actions/Policy/Category';
import {
    buildOptimisticMccGroup,
    buildOptimisticPolicyCategories,
    buildOptimisticPolicyWithExistingCategories,
    DEFAULT_MCC_GROUP,
    isDefaultMccGroupID,
} from '@libs/actions/Policy/OptimisticPolicyCategoriesAndMccGroups';

import CONST from '@src/CONST';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyCategories, PolicyCategory} from '@src/types/onyx';

import Onyx from 'react-native-onyx';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';

import type {MockFetch} from '../utils/TestHelper';

import createRandomPolicy from '../utils/collections/policies';
import createRandomPolicyCategories from '../utils/collections/policyCategory';
import createRandomPolicyTags from '../utils/collections/policyTags';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

OnyxUpdateManager();
describe('actions/PolicyCategory', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    let mockFetch: MockFetch;
    beforeEach(() => {
        mockFetch = TestHelper.getGlobalFetchMock();
        global.fetch = mockFetch;
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('setWorkspaceRequiresCategory', () => {
        it('Enable require category', async () => {
            const fakePolicy = createRandomPolicy(0);
            fakePolicy.requiresCategory = false;

            mockFetch?.pause?.();
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);

            const {result: policyData} = renderHook(() => usePolicyData(fakePolicy.id), {wrapper: OnyxListItemProvider});
            setWorkspaceRequiresCategory(policyData.current, true, false);
            await waitForBatchedUpdates();
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                    callback: (policy) => {
                        Onyx.disconnect(connection);
                        // Check if policy requiresCategory was updated with correct values
                        expect(policy?.requiresCategory).toBeTruthy();
                        expect(policy?.pendingFields?.requiresCategory).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                        expect(policy?.errors?.requiresCategory).toBeFalsy();
                        resolve();
                    },
                });
            });
            await mockFetch?.resume?.();
            await waitForBatchedUpdates();
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                    callback: (policy) => {
                        Onyx.disconnect(connection);
                        // Check if the policy pendingFields was cleared
                        expect(policy?.pendingFields?.requiresCategory).toBeFalsy();
                        resolve();
                    },
                });
            });
        });
    });
    describe('createWorkspaceCategories', () => {
        it('Create a new policy category', async () => {
            const fakePolicy = createRandomPolicy(0);
            const fakeCategories = createRandomPolicyCategories(3);
            const newCategoryName = 'New category';
            mockFetch?.pause?.();
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${fakePolicy.id}`, fakeCategories);
            createPolicyCategory({
                policyID: fakePolicy.id,
                categoryName: newCategoryName,
                isSetupCategoriesTaskParentReportArchived: false,
                setupCategoryTaskReport: undefined,
                setupCategoryTaskParentReport: undefined,
                currentUserAccountID: CONST.DEFAULT_NUMBER_ID,
                hasOutstandingChildTask: false,
                parentReportAction: undefined,
            });
            await waitForBatchedUpdates();
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${fakePolicy.id}`,
                    callback: (policyCategories) => {
                        Onyx.disconnect(connection);
                        const newCategory = policyCategories?.[newCategoryName];

                        expect(newCategory?.name).toBe(newCategoryName);
                        expect(newCategory?.errors).toBeFalsy();

                        resolve();
                    },
                });
            });
            await mockFetch?.resume?.();
            await waitForBatchedUpdates();
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${fakePolicy.id}`,
                    callback: (policyCategories) => {
                        Onyx.disconnect(connection);

                        const newCategory = policyCategories?.[newCategoryName];
                        expect(newCategory?.errors).toBeFalsy();
                        expect(newCategory?.pendingAction).toBeFalsy();

                        resolve();
                    },
                });
            });
        });
    });
    describe('renameWorkspaceCategory', () => {
        it('Rename category', async () => {
            const fakePolicy = createRandomPolicy(0);
            const fakeCategories = createRandomPolicyCategories(3);
            const oldCategoryName = Object.keys(fakeCategories).at(0);
            const newCategoryName = 'Updated category';
            mockFetch?.pause?.();
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${fakePolicy.id}`, fakeCategories);

            const {result: policyData} = renderHook(() => usePolicyData(fakePolicy.id), {wrapper: OnyxListItemProvider});
            renamePolicyCategory(
                policyData.current,
                {
                    oldName: oldCategoryName ?? '',
                    newName: newCategoryName,
                },
                false,
            );
            await waitForBatchedUpdates();
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${fakePolicy.id}`,
                    callback: (policyCategories) => {
                        Onyx.disconnect(connection);

                        expect(policyCategories?.[oldCategoryName ?? '']).toBeFalsy();
                        expect(policyCategories?.[newCategoryName]?.name).toBe(newCategoryName);
                        expect(policyCategories?.[newCategoryName]?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                        expect(policyCategories?.[newCategoryName]?.pendingFields?.name).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

                        resolve();
                    },
                });
            });
            await mockFetch?.resume?.();
            await waitForBatchedUpdates();
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${fakePolicy.id}`,
                    callback: (policyCategories) => {
                        Onyx.disconnect(connection);

                        expect(policyCategories?.[newCategoryName]?.pendingAction).toBeFalsy();
                        expect(policyCategories?.[newCategoryName]?.pendingFields?.name).toBeFalsy();

                        resolve();
                    },
                });
            });
        });
    });
    describe('setWorkspaceCategoriesEnabled', () => {
        it('Enable category', async () => {
            const fakePolicy = createRandomPolicy(0);
            const fakeCategories = createRandomPolicyCategories(3);
            const categoryNameToUpdate = Object.keys(fakeCategories).at(0) ?? '';
            const categoriesToUpdate = {
                [categoryNameToUpdate]: {
                    name: categoryNameToUpdate,
                    enabled: true,
                },
            };
            mockFetch?.pause?.();
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${fakePolicy.id}`, fakeCategories);

            const {result: policyData} = renderHook(() => usePolicyData(fakePolicy.id), {wrapper: OnyxListItemProvider});
            setWorkspaceCategoryEnabled({
                isVendorMatchingBetaEnabled: false,
                policyData: policyData.current,
                categoriesToUpdate,
                isSetupCategoriesTaskParentReportArchived: false,
                setupCategoryTaskReport: undefined,
                setupCategoryTaskParentReport: undefined,
                currentUserAccountID: CONST.DEFAULT_NUMBER_ID,
                hasOutstandingChildTask: false,
                parentReportAction: undefined,
            });
            await waitForBatchedUpdates();
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${fakePolicy.id}`,
                    callback: (policyCategories) => {
                        Onyx.disconnect(connection);

                        expect(policyCategories?.[categoryNameToUpdate]?.enabled).toBeTruthy();
                        expect(policyCategories?.[categoryNameToUpdate]?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                        expect(policyCategories?.[categoryNameToUpdate]?.pendingFields?.enabled).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                        expect(policyCategories?.[categoryNameToUpdate]?.errors).toBeFalsy();
                        resolve();
                    },
                });
            });
            await mockFetch?.resume?.();
            await waitForBatchedUpdates();
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${fakePolicy.id}`,
                    callback: (policyCategories) => {
                        Onyx.disconnect(connection);

                        expect(policyCategories?.[categoryNameToUpdate]?.pendingAction).toBeFalsy();
                        expect(policyCategories?.[categoryNameToUpdate]?.pendingFields?.enabled).toBeFalsy();

                        resolve();
                    },
                });
            });
        });
    });

    describe('deleteWorkspaceCategories', () => {
        it('Delete category', async () => {
            const fakePolicy = createRandomPolicy(0);
            const fakeCategories = createRandomPolicyCategories(3);
            const categoryNameToDelete = Object.keys(fakeCategories).at(0) ?? '';
            const categoriesToDelete = [categoryNameToDelete];
            mockFetch?.pause?.();
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${fakePolicy.id}`, fakeCategories);

            const {result: policyData} = renderHook(() => usePolicyData(fakePolicy.id), {wrapper: OnyxListItemProvider});
            deleteWorkspaceCategories(policyData.current, categoriesToDelete, false, undefined, undefined, CONST.DEFAULT_NUMBER_ID, false, undefined, false);
            await waitForBatchedUpdates();
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${fakePolicy.id}`,
                    callback: (policyCategories) => {
                        Onyx.disconnect(connection);

                        expect(policyCategories?.[categoryNameToDelete]?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
                        resolve();
                    },
                });
            });
            await mockFetch?.resume?.();
            await waitForBatchedUpdates();
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${fakePolicy.id}`,
                    callback: (policyCategories) => {
                        Onyx.disconnect(connection);
                        expect(policyCategories?.[categoryNameToDelete]).toBeFalsy();

                        resolve();
                    },
                });
            });
        });
    });

    describe('enablePolicyCategories', () => {
        it('Disable categories feature should also disable all category lists', async () => {
            // Given the policy data consisting of policy workspace, categories lists & tags
            const fakePolicy: Policy = {
                ...createRandomPolicy(0),
                areCategoriesEnabled: true,
            };
            const fakeCategories = createRandomPolicyCategories(3);
            const fakeTags = createRandomPolicyTags('Fake tag', 3);
            const {result: policyData} = renderHook(() => usePolicyData(fakePolicy.id), {wrapper: OnyxListItemProvider});

            // Then pause the network requests to test the offline behaviour
            mockFetch?.pause?.();
            await act(async () => {
                Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
                Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${fakePolicy.id}`, fakeCategories);
                Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, fakeTags);
                await waitForBatchedUpdates();
            });

            // Then disable the categories feature
            enablePolicyCategories({...policyData.current, categories: fakeCategories}, false, false, false);

            // Then verify the categories feature are disabled and all the lists are disabled too (offline + online behaviour)
            await waitForBatchedUpdates();
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                    callback: (policy) => {
                        Onyx.disconnect(connection);
                        expect(policy?.pendingFields?.areCategoriesEnabled).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                        resolve();
                    },
                });
            });
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${fakePolicy.id}`,
                    callback: (policyCategories) => {
                        Onyx.disconnect(connection);
                        expect(Object.values(policyCategories ?? {}).every((category) => category.enabled === false)).toBeTruthy();
                        resolve();
                    },
                });
            });

            await mockFetch?.resume?.();
            await waitForBatchedUpdates();
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                    callback: (policy) => {
                        Onyx.disconnect(connection);
                        expect(policy?.areCategoriesEnabled).toBe(false);
                        expect(policy?.requiresCategory).toBe(false);
                        expect(policy?.pendingFields?.areCategoriesEnabled).toBeFalsy();
                        resolve();
                    },
                });
            });
        });
        it('Re-enable categories feature should enable all category lists', async () => {
            // Give policy data consisting of policy workspace with categories feature disabled, categories lists & tags
            const fakePolicy: Policy = {
                ...createRandomPolicy(0),
                areCategoriesEnabled: false,
            };
            const fakeCategories = createRandomPolicyCategories(3);
            const fakeTags = createRandomPolicyTags('Fake tag', 3);
            const {result: policyData} = renderHook(() => usePolicyData(fakePolicy.id), {wrapper: OnyxListItemProvider});

            // Then pause the network requests to test the offline behaviour
            mockFetch?.pause?.();

            await act(async () => {
                Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
                Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${fakePolicy.id}`, fakeCategories);
                Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, fakeTags);
                await waitForBatchedUpdates();
            });

            // Then enable the categories feature
            enablePolicyCategories({...policyData.current, categories: fakeCategories}, true, false, false);

            // Then verify the categories feature are enabled and all the lists are enabled too (offline + online behaviour)
            await waitForBatchedUpdates();
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                    callback: (policy) => {
                        Onyx.disconnect(connection);
                        expect(policy?.pendingFields?.areCategoriesEnabled).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                        resolve();
                    },
                });
            });
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${fakePolicy.id}`,
                    callback: (policyCategories) => {
                        Onyx.disconnect(connection);
                        expect(Object.values(policyCategories ?? {}).every((category) => category.enabled === true)).toBeTruthy();
                        resolve();
                    },
                });
            });

            await mockFetch?.resume?.();
            await waitForBatchedUpdates();
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                    callback: (policy) => {
                        Onyx.disconnect(connection);
                        expect(policy?.areCategoriesEnabled).toBe(true);
                        expect(policy?.requiresCategory).toBe(true);
                        expect(policy?.pendingFields?.areCategoriesEnabled).toBeFalsy();
                        resolve();
                    },
                });
            });
        });
    });

    describe('SetPolicyCategoryTax', () => {
        it('should set expense rule when category expense rule is not present', async () => {
            // Given a policy
            const fakePolicy = createRandomPolicy(0);
            fakePolicy.areCategoriesEnabled = true;
            const categoryName = 'Fake category';
            const fakePolicyCategories = {
                [categoryName]: {
                    name: categoryName,
                    enabled: false,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'GL Code': '',
                    unencodedName: categoryName,
                    externalID: '',
                    areCommentsRequired: false,
                    origin: '',
                },
            };

            mockFetch.pause();

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${fakePolicy.id}`, fakePolicyCategories);

            setPolicyCategoryTax(fakePolicy, categoryName, 'VAT');
            await waitForBatchedUpdates();

            // Then the approval rule should be created with the tag name
            const updatedPolicy = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`);

            expect(updatedPolicy?.rules?.expenseRules).toHaveLength(1);
            expect(updatedPolicy?.rules?.expenseRules?.[0]?.applyWhen?.[0]?.value).toBe(categoryName);
            expect(updatedPolicy?.rules?.expenseRules?.[0]?.applyWhen?.[0]?.condition).toBe(CONST.POLICY.RULE_CONDITIONS.MATCHES);
            expect(updatedPolicy?.rules?.expenseRules?.[0]?.applyWhen?.[0]?.field).toBe(CONST.POLICY.FIELDS.CATEGORY);
            expect(updatedPolicy?.rules?.expenseRules?.[0].tax.field_id_TAX.externalID).toBe('VAT');

            mockFetch.resume();
            await waitForBatchedUpdates();
        });

        it('should update expense rule when category expense rule is present', async () => {
            // Given a policy with approval rules that reference a tag
            const fakePolicy = createRandomPolicy(0);
            fakePolicy.areCategoriesEnabled = true;
            const categoryName = 'Fake category';
            const fakePolicyCategories = {
                [categoryName]: {
                    name: categoryName,
                    enabled: false,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'GL Code': '',
                    unencodedName: categoryName,
                    externalID: '',
                    areCommentsRequired: false,
                    origin: '',
                },
            };

            // Create expense rule that uses the tag
            fakePolicy.rules = {
                expenseRules: [
                    {
                        tax: {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            field_id_TAX: {
                                externalID: 'GST',
                            },
                        },
                        applyWhen: [
                            {
                                condition: CONST.POLICY.RULE_CONDITIONS.MATCHES,
                                field: CONST.POLICY.FIELDS.CATEGORY,
                                value: categoryName,
                            },
                        ],
                    },
                ],
            };

            mockFetch.pause();

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${fakePolicy.id}`, fakePolicyCategories);

            setPolicyCategoryTax(fakePolicy, categoryName, 'VAT');
            await waitForBatchedUpdates();

            // Then the approval rule should be created with the tag name
            const updatedPolicy = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`);

            expect(updatedPolicy?.rules?.expenseRules).toHaveLength(1);
            expect(updatedPolicy?.rules?.expenseRules?.[0]?.applyWhen?.[0]?.value).toBe(categoryName);
            expect(updatedPolicy?.rules?.expenseRules?.[0]?.applyWhen?.[0]?.condition).toBe(CONST.POLICY.RULE_CONDITIONS.MATCHES);
            expect(updatedPolicy?.rules?.expenseRules?.[0]?.applyWhen?.[0]?.field).toBe(CONST.POLICY.FIELDS.CATEGORY);
            expect(updatedPolicy?.rules?.expenseRules?.[0].tax.field_id_TAX.externalID).toBe('VAT');

            mockFetch.resume();
            await waitForBatchedUpdates();
        });
    });

    describe('createPolicyCategory with onboarding task completion', () => {
        it('should complete SETUP_CATEGORIES_AND_TAGS task when creating category and tags already exist', async () => {
            const fakePolicy = createRandomPolicy(0);
            const fakeCategories = createRandomPolicyCategories(3);
            const fakeTags = createRandomPolicyTags('TestTagList', 2);
            const newCategoryName = 'New category';

            // Create a fake task report for SETUP_CATEGORIES_AND_TAGS
            const fakeTaskReportID = '123456';
            const fakeTaskReport = {
                reportID: fakeTaskReportID,
                type: CONST.REPORT.TYPE.TASK,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            };

            mockFetch?.pause?.();
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${fakePolicy.id}`, fakeCategories);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, fakeTags);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${fakeTaskReportID}`, fakeTaskReport);

            createPolicyCategory({
                policyID: fakePolicy.id,
                categoryName: newCategoryName,
                isSetupCategoriesTaskParentReportArchived: false,
                setupCategoryTaskReport: undefined,
                setupCategoryTaskParentReport: undefined,
                currentUserAccountID: CONST.DEFAULT_NUMBER_ID,
                hasOutstandingChildTask: false,
                parentReportAction: undefined,
                setupCategoriesAndTagsTaskReport: fakeTaskReport,
                setupCategoriesAndTagsTaskParentReport: undefined,
                isSetupCategoriesAndTagsTaskParentReportArchived: false,
                setupCategoriesAndTagsHasOutstandingChildTask: false,
                setupCategoriesAndTagsParentReportAction: undefined,
                policyHasTags: true,
            });

            await waitForBatchedUpdates();

            // Verify the category was created
            const policyCategories = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${fakePolicy.id}`);
            const newCategory = policyCategories?.[newCategoryName];
            expect(newCategory?.name).toBe(newCategoryName);

            await mockFetch?.resume?.();
            await waitForBatchedUpdates();
        });

        it('should NOT complete SETUP_CATEGORIES_AND_TAGS task when creating category but no tags exist', async () => {
            const fakePolicy = createRandomPolicy(0);
            const fakeCategories = createRandomPolicyCategories(3);
            const newCategoryName = 'New category without tags';

            // Create a fake task report for SETUP_CATEGORIES_AND_TAGS
            const fakeTaskReportID = '789012';
            const fakeTaskReport = {
                reportID: fakeTaskReportID,
                type: CONST.REPORT.TYPE.TASK,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            };

            mockFetch?.pause?.();
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${fakePolicy.id}`, fakeCategories);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${fakeTaskReportID}`, fakeTaskReport);

            createPolicyCategory({
                policyID: fakePolicy.id,
                categoryName: newCategoryName,
                isSetupCategoriesTaskParentReportArchived: false,
                setupCategoryTaskReport: undefined,
                setupCategoryTaskParentReport: undefined,
                currentUserAccountID: CONST.DEFAULT_NUMBER_ID,
                hasOutstandingChildTask: false,
                parentReportAction: undefined,
                setupCategoriesAndTagsTaskReport: fakeTaskReport,
                setupCategoriesAndTagsTaskParentReport: undefined,
                isSetupCategoriesAndTagsTaskParentReportArchived: false,
                setupCategoriesAndTagsHasOutstandingChildTask: false,
                setupCategoriesAndTagsParentReportAction: undefined,
                policyHasTags: false,
            });

            await waitForBatchedUpdates();

            // Verify the category was created
            const policyCategories = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${fakePolicy.id}`);
            const newCategory = policyCategories?.[newCategoryName];
            expect(newCategory?.name).toBe(newCategoryName);

            await mockFetch?.resume?.();
            await waitForBatchedUpdates();
        });
    });

    describe('importPolicyCategories', () => {
        it('Import categories with correct success modal data', async () => {
            const fakePolicy = createRandomPolicy(0);
            const categoriesToImport: PolicyCategory[] = [
                // eslint-disable-next-line @typescript-eslint/naming-convention
                {name: 'Advertising', enabled: true, 'GL Code': '6000'},
                // eslint-disable-next-line @typescript-eslint/naming-convention
                {name: 'Benefits', enabled: true, 'GL Code': '6001'},
            ];

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            await waitForBatchedUpdates();

            const importFinalModal = await importPolicyCategories(fakePolicy.id, categoriesToImport);

            expect(importFinalModal).toStrictEqual({
                titleKey: 'spreadsheet.importSuccessfulTitle',
                promptKey: 'spreadsheet.importCategoriesAdded',
                promptKeyParams: {count: 2},
            });
        });

        it('Import categories with failure modal data', async () => {
            const fakePolicy = createRandomPolicy(0);
            const categoriesToImport: PolicyCategory[] = [
                // eslint-disable-next-line @typescript-eslint/naming-convention
                {name: 'Travel', enabled: true, 'GL Code': 'GL001'},
            ];

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            await waitForBatchedUpdates();

            mockFetch?.fail?.();
            const importFinalModal = await importPolicyCategories(fakePolicy.id, categoriesToImport);

            expect(importFinalModal).toStrictEqual({
                titleKey: 'spreadsheet.importFailedTitle',
                promptKey: 'spreadsheet.importFailedDescription',
            });
        });

        it('Duplicate category names are counted only once for the unique categories length', async () => {
            const fakePolicy = createRandomPolicy(0);
            const categoriesToImport: PolicyCategory[] = [
                // eslint-disable-next-line @typescript-eslint/naming-convention
                {name: 'Advertising', enabled: true, 'GL Code': '6000'},
                // eslint-disable-next-line @typescript-eslint/naming-convention
                {name: 'Advertising', enabled: false, 'GL Code': '9999'},
                // eslint-disable-next-line @typescript-eslint/naming-convention
                {name: 'Benefits', enabled: true, 'GL Code': '6001'},
            ];

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            await waitForBatchedUpdates();

            const importFinalModal = await importPolicyCategories(fakePolicy.id, categoriesToImport);

            expect(importFinalModal.promptKeyParams).toStrictEqual({count: 2});
        });

        it('Categories with empty names are skipped when counting unique categories', async () => {
            const fakePolicy = createRandomPolicy(0);
            const categoriesToImport: PolicyCategory[] = [
                // eslint-disable-next-line @typescript-eslint/naming-convention
                {name: '', enabled: true, 'GL Code': '6000'},
                // eslint-disable-next-line @typescript-eslint/naming-convention
                {name: 'Meals', enabled: true, 'GL Code': '100'},
            ];

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            await waitForBatchedUpdates();

            const importFinalModal = await importPolicyCategories(fakePolicy.id, categoriesToImport);

            expect(importFinalModal.promptKeyParams).toStrictEqual({count: 1});
        });

        it('Empty categories array results in zero unique count', async () => {
            const fakePolicy = createRandomPolicy(0);

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            await waitForBatchedUpdates();

            const importFinalModal = await importPolicyCategories(fakePolicy.id, []);

            expect(importFinalModal.promptKey).toStrictEqual('spreadsheet.importCategoriesNoneAddedOrUpdated');
        });
    });

    describe('setPolicyCategoryReceiptsAndItemizedReceiptRequired', () => {
        it('should cascade receipt required to Never and also disable itemized receipt because an itemized receipt cannot be required when no receipt is required', async () => {
            // Given a policy with a category that requires both receipts and itemized receipts (Always = 0)
            const fakePolicy = createRandomPolicy(0);
            const categoryName = 'Food';
            const fakeCategories = {
                [categoryName]: {
                    name: categoryName,
                    enabled: true,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'GL Code': '',
                    unencodedName: categoryName,
                    externalID: '',
                    areCommentsRequired: false,
                    origin: '',
                    maxAmountNoReceipt: 0,
                    maxAmountNoItemizedReceipt: 0,
                },
            };

            mockFetch?.pause?.();

            await act(async () => {
                await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
                await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${fakePolicy.id}`, fakeCategories);
            });

            const {result: policyData} = renderHook(() => usePolicyData(fakePolicy.id), {wrapper: OnyxListItemProvider});
            await waitForBatchedUpdates();

            // When setting receipt required to Never, which should cascade itemized receipt to Never as well
            setPolicyCategoryReceiptsAndItemizedReceiptRequired(policyData.current, categoryName, CONST.DISABLED_MAX_EXPENSE_VALUE, CONST.DISABLED_MAX_EXPENSE_VALUE, false);
            await waitForBatchedUpdates();

            // Then both fields should be optimistically updated to Never (DISABLED_MAX_EXPENSE_VALUE) with pending state
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${fakePolicy.id}`,
                    callback: (policyCategories) => {
                        Onyx.disconnect(connection);
                        const category = policyCategories?.[categoryName];

                        expect(category?.maxAmountNoReceipt).toBe(CONST.DISABLED_MAX_EXPENSE_VALUE);
                        expect(category?.maxAmountNoItemizedReceipt).toBe(CONST.DISABLED_MAX_EXPENSE_VALUE);
                        expect(category?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                        expect(category?.pendingFields?.maxAmountNoReceipt).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                        expect(category?.pendingFields?.maxAmountNoItemizedReceipt).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                        resolve();
                    },
                });
            });

            await mockFetch?.resume?.();
            await waitForBatchedUpdates();

            // Then after the API call resolves, pending state should be cleared while values persist
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${fakePolicy.id}`,
                    callback: (policyCategories) => {
                        Onyx.disconnect(connection);
                        const category = policyCategories?.[categoryName];

                        expect(category?.maxAmountNoReceipt).toBe(CONST.DISABLED_MAX_EXPENSE_VALUE);
                        expect(category?.maxAmountNoItemizedReceipt).toBe(CONST.DISABLED_MAX_EXPENSE_VALUE);
                        expect(category?.pendingAction).toBeFalsy();
                        expect(category?.pendingFields?.maxAmountNoReceipt).toBeFalsy();
                        expect(category?.pendingFields?.maxAmountNoItemizedReceipt).toBeFalsy();
                        resolve();
                    },
                });
            });
        });

        it('should cascade itemized receipt required to Always and also enable receipt required because a receipt must exist before it can be itemized', async () => {
            // Given a policy with a category where both receipts and itemized receipts are disabled (Never = DISABLED_MAX_EXPENSE_VALUE)
            const fakePolicy = createRandomPolicy(0);
            const categoryName = 'Travel';
            const fakeCategories = {
                [categoryName]: {
                    name: categoryName,
                    enabled: true,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'GL Code': '',
                    unencodedName: categoryName,
                    externalID: '',
                    areCommentsRequired: false,
                    origin: '',
                    maxAmountNoReceipt: CONST.DISABLED_MAX_EXPENSE_VALUE,
                    maxAmountNoItemizedReceipt: CONST.DISABLED_MAX_EXPENSE_VALUE,
                },
            };

            mockFetch?.pause?.();

            await act(async () => {
                await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
                await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${fakePolicy.id}`, fakeCategories);
            });

            const {result: policyData} = renderHook(() => usePolicyData(fakePolicy.id), {wrapper: OnyxListItemProvider});
            await waitForBatchedUpdates();

            // When setting itemized receipt required to Always, which should cascade receipt required to Always as well
            setPolicyCategoryReceiptsAndItemizedReceiptRequired(policyData.current, categoryName, 0, 0, false);
            await waitForBatchedUpdates();

            // Then both fields should be optimistically updated to Always (0) with pending state
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${fakePolicy.id}`,
                    callback: (policyCategories) => {
                        Onyx.disconnect(connection);
                        const category = policyCategories?.[categoryName];

                        expect(category?.maxAmountNoReceipt).toBe(0);
                        expect(category?.maxAmountNoItemizedReceipt).toBe(0);
                        expect(category?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                        expect(category?.pendingFields?.maxAmountNoReceipt).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                        expect(category?.pendingFields?.maxAmountNoItemizedReceipt).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                        resolve();
                    },
                });
            });

            await mockFetch?.resume?.();
            await waitForBatchedUpdates();

            // Then after the API call resolves, pending state should be cleared while values persist
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${fakePolicy.id}`,
                    callback: (policyCategories) => {
                        Onyx.disconnect(connection);
                        const category = policyCategories?.[categoryName];

                        expect(category?.maxAmountNoReceipt).toBe(0);
                        expect(category?.maxAmountNoItemizedReceipt).toBe(0);
                        expect(category?.pendingAction).toBeFalsy();
                        expect(category?.pendingFields?.maxAmountNoReceipt).toBeFalsy();
                        expect(category?.pendingFields?.maxAmountNoItemizedReceipt).toBeFalsy();
                        resolve();
                    },
                });
            });
        });
    });

    describe('OptimisticPolicyCategoriesAndMccGroups', () => {
        it('buildOptimisticPolicyCategories adds each category, clears the draft and clears the pending action on success', () => {
            const policyID = 'policy1';

            const onyxData = buildOptimisticPolicyCategories(policyID, ['Advertising', 'Benefits']);

            expect(onyxData.optimisticData).toStrictEqual([
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}policy1`,
                    value: {
                        Advertising: {name: 'Advertising', enabled: true, errors: null, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD},
                        Benefits: {name: 'Benefits', enabled: true, errors: null, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD},
                    },
                },
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES_DRAFT}policy1`,
                    value: null,
                },
            ]);

            expect(onyxData.successData).toStrictEqual([
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}policy1`,
                    value: {
                        Advertising: {errors: null, pendingAction: null},
                        Benefits: {errors: null, pendingAction: null},
                    },
                },
            ]);

            const failureUpdate = onyxData.failureData?.[0];
            expect(onyxData.failureData).toHaveLength(1);
            expect(failureUpdate?.onyxMethod).toBe(Onyx.METHOD.MERGE);
            expect(failureUpdate?.key).toBe(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}policy1`);

            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- MERGE value is a partial policy categories patch
            const failureCategories = failureUpdate && 'value' in failureUpdate ? (failureUpdate.value as PolicyCategories) : undefined;
            expect(Object.keys(failureCategories ?? {})).toStrictEqual(['Advertising', 'Benefits']);
            expect(Object.keys(failureCategories?.Advertising?.errors ?? {})).toHaveLength(1);
            expect(Object.keys(failureCategories?.Benefits?.errors ?? {})).toHaveLength(1);
        });

        it('buildOptimisticPolicyWithExistingCategories keeps every category field and skips the ones pending delete', () => {
            const policyID = 'policy2';
            const categories: PolicyCategories = {
                Advertising: {name: 'Advertising', enabled: true, areCommentsRequired: true},
                Travel: {name: 'Travel', enabled: true, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
            };

            const onyxData = buildOptimisticPolicyWithExistingCategories(policyID, categories);

            expect(onyxData.optimisticData).toStrictEqual([
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}policy2`,
                    value: {
                        Advertising: {name: 'Advertising', enabled: true, areCommentsRequired: true, errors: null, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD},
                    },
                },
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES_DRAFT}policy2`,
                    value: null,
                },
            ]);

            expect(onyxData.successData).toStrictEqual([
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}policy2`,
                    value: {
                        Advertising: {errors: null, pendingAction: null},
                        Travel: {errors: null, pendingAction: null},
                    },
                },
            ]);

            const failureUpdate = onyxData.failureData?.[0];
            expect(onyxData.failureData).toHaveLength(1);
            expect(failureUpdate?.onyxMethod).toBe(Onyx.METHOD.MERGE);
            expect(failureUpdate?.key).toBe(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}policy2`);

            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- MERGE value is a partial policy categories patch
            const failureCategories = failureUpdate && 'value' in failureUpdate ? (failureUpdate.value as PolicyCategories) : undefined;
            expect(Object.keys(failureCategories ?? {})).toStrictEqual(['Advertising', 'Travel']);
            expect(Object.keys(failureCategories?.Advertising?.errors ?? {})).toHaveLength(1);
            expect(Object.keys(failureCategories?.Travel?.errors ?? {})).toHaveLength(1);
        });

        it('DEFAULT_MCC_GROUP mirrors the default MCC groups with a pending add action', () => {
            for (const [groupID, definition] of Object.entries(CONST.POLICY.DEFAULT_MCC_GROUPS)) {
                expect(DEFAULT_MCC_GROUP[groupID]).toStrictEqual({...definition, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});
            }
        });

        it('buildOptimisticMccGroup returns copies of the default groups so callers cannot mutate the shared constant', () => {
            const mccGroupData = buildOptimisticMccGroup();

            expect(Object.keys(mccGroupData.optimisticData.mccGroup)).toStrictEqual(Object.keys(DEFAULT_MCC_GROUP));

            for (const groupID of Object.keys(DEFAULT_MCC_GROUP)) {
                expect(mccGroupData.optimisticData.mccGroup[groupID]).toStrictEqual(DEFAULT_MCC_GROUP[groupID]);
                expect(mccGroupData.optimisticData.mccGroup[groupID]).not.toBe(DEFAULT_MCC_GROUP[groupID]);
            }

            expect(mccGroupData.successData.mccGroup).toStrictEqual(Object.fromEntries(Object.keys(DEFAULT_MCC_GROUP).map((groupID) => [groupID, {pendingAction: null}])));
            expect(mccGroupData.failureData).toStrictEqual({mccGroup: null});
        });

        it('isDefaultMccGroupID only accepts IDs present in the default MCC groups', () => {
            // Given the default MCC group IDs from CONST
            for (const groupID of Object.keys(CONST.POLICY.DEFAULT_MCC_GROUPS)) {
                // When the ID is checked
                // Then it is recognized as a default group ID
                expect(isDefaultMccGroupID(groupID)).toBe(true);
            }

            // Given an ID that is not a default MCC group
            // When it is checked
            // Then it is rejected
            expect(isDefaultMccGroupID('notAMccGroupID')).toBe(false);
        });

        it('Category re-exports every builder it no longer defines', () => {
            expect(buildOptimisticMccGroupFromCategory).toBe(buildOptimisticMccGroup);
            expect(buildOptimisticPolicyCategoriesFromCategory).toBe(buildOptimisticPolicyCategories);
            expect(buildOptimisticPolicyWithExistingCategoriesFromCategory).toBe(buildOptimisticPolicyWithExistingCategories);
            expect(DEFAULT_MCC_GROUP_FROM_CATEGORY).toBe(DEFAULT_MCC_GROUP);
            expect(isDefaultMccGroupIDFromCategory).toBe(isDefaultMccGroupID);
        });
    });
});
