import {act, renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import usePolicyData from '@hooks/usePolicyData';
import {
    createPolicyCategory,
    deleteWorkspaceCategories,
    enablePolicyCategories,
    renamePolicyCategory,
    setPolicyCategoryTax,
    setWorkspaceCategoryEnabled,
    setWorkspaceRequiresCategory,
} from '@libs/actions/Policy/Category';
import CONST from '@src/CONST';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import createRandomPolicy from '../utils/collections/policies';
import createRandomPolicyCategories from '../utils/collections/policyCategory';
import createRandomPolicyTags from '../utils/collections/policyTags';
import * as TestHelper from '../utils/TestHelper';
import type {MockFetch} from '../utils/TestHelper';
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
        global.fetch = TestHelper.getGlobalFetchMock();
        mockFetch = fetch as MockFetch;
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('setWorkspaceRequiresCategory', () => {
        it('Enable require category', async () => {
            const fakePolicy = createRandomPolicy(0);
            fakePolicy.requiresCategory = false;

            mockFetch?.pause?.();
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);

            const {result: policyData} = renderHook(() => usePolicyData(fakePolicy.id), {wrapper: OnyxListItemProvider});
            setWorkspaceRequiresCategory(policyData.current, true);
            await waitForBatchedUpdates();
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                    waitForCollectionCallback: false,
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
                    waitForCollectionCallback: false,
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
                    waitForCollectionCallback: false,
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
                    waitForCollectionCallback: false,
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
            renamePolicyCategory(policyData.current, {
                oldName: oldCategoryName ?? '',
                newName: newCategoryName,
            });
            await waitForBatchedUpdates();
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${fakePolicy.id}`,
                    waitForCollectionCallback: false,
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
                    waitForCollectionCallback: false,
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
                    waitForCollectionCallback: false,
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
                    waitForCollectionCallback: false,
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
            deleteWorkspaceCategories(policyData.current, categoriesToDelete, false, undefined, undefined, CONST.DEFAULT_NUMBER_ID, false, undefined);
            await waitForBatchedUpdates();
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${fakePolicy.id}`,
                    waitForCollectionCallback: false,
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
                    waitForCollectionCallback: false,
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
            enablePolicyCategories({...policyData.current, categories: fakeCategories}, false, false);

            // Then verify the categories feature are disabled and all the lists are disabled too (offline + online behaviour)
            await waitForBatchedUpdates();
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                    waitForCollectionCallback: false,
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
                    waitForCollectionCallback: false,
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
                    waitForCollectionCallback: false,
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
            enablePolicyCategories({...policyData.current, categories: fakeCategories}, true, false);

            // Then verify the categories feature are enabled and all the lists are enabled too (offline + online behaviour)
            await waitForBatchedUpdates();
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                    waitForCollectionCallback: false,
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
                    waitForCollectionCallback: false,
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
                    waitForCollectionCallback: false,
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
});
