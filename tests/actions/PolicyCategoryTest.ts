import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import * as Category from '@src/libs/actions/Policy/Category';
import ONYXKEYS from '@src/ONYXKEYS';
import createRandomPolicy from '../utils/collections/policies';
import createRandomPolicyCategories from '../utils/collections/policyCategory';
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
            Category.setWorkspaceRequiresCategory(fakePolicy.id, true);
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
            Category.createPolicyCategory(fakePolicy.id, newCategoryName);
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
            const oldCategoryName = Object.keys(fakeCategories)[0];
            const newCategoryName = 'Updated category';
            mockFetch?.pause?.();
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${fakePolicy.id}`, fakeCategories);
            Category.renamePolicyCategory(fakePolicy.id, {
                oldName: oldCategoryName,
                newName: newCategoryName,
            });
            await waitForBatchedUpdates();
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${fakePolicy.id}`,
                    waitForCollectionCallback: false,
                    callback: (policyCategories) => {
                        Onyx.disconnect(connection);

                        expect(policyCategories?.[oldCategoryName]).toBeFalsy();
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
            const categoryNameToUpdate = Object.keys(fakeCategories)[0];
            const categoriesToUpdate = {
                [categoryNameToUpdate]: {
                    name: categoryNameToUpdate,
                    enabled: true,
                },
            };
            mockFetch?.pause?.();
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${fakePolicy.id}`, fakeCategories);
            Category.setWorkspaceCategoryEnabled(fakePolicy.id, categoriesToUpdate);
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
            const categoryNameToDelete = Object.keys(fakeCategories)[0];
            const categoriesToDelete = [categoryNameToDelete];
            mockFetch?.pause?.();
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${fakePolicy.id}`, fakeCategories);
            Category.deleteWorkspaceCategories(fakePolicy.id, categoriesToDelete);
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
});
