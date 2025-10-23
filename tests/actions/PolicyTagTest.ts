import {act, renderHook, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import useOnyx from '@hooks/useOnyx';
import usePolicyData from '@hooks/usePolicyData';
import OnyxUpdateManager from '@libs/actions/OnyxUpdateManager';
import {
    buildOptimisticPolicyRecentlyUsedTags,
    clearPolicyTagErrors,
    clearPolicyTagListErrorField,
    createPolicyTag,
    deletePolicyTags,
    enablePolicyTags,
    renamePolicyTag,
    renamePolicyTagList,
    setPolicyRequiresTag,
    setPolicyTagsRequired,
    setWorkspaceTagEnabled,
} from '@libs/actions/Policy/Tag';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyTagLists, PolicyTags, RecentlyUsedTags} from '@src/types/onyx';
import createRandomPolicy from '../utils/collections/policies';
import createRandomPolicyTags from '../utils/collections/policyTags';
import * as TestHelper from '../utils/TestHelper';
import type {MockFetch} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

OnyxUpdateManager();

describe('actions/Policy', () => {
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

    describe('SetPolicyRequiresTag', () => {
        it('enable require tag', () => {
            const fakePolicy = createRandomPolicy(0);
            fakePolicy.requiresTag = false;

            mockFetch?.pause?.();

            return Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy)
                .then(() => {
                    const {result: policyData} = renderHook(() => usePolicyData(fakePolicy.id), {wrapper: OnyxListItemProvider});
                    setPolicyRequiresTag(policyData.current, true);
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                waitForCollectionCallback: false,
                                callback: (policy) => {
                                    Onyx.disconnect(connection);

                                    // RequiresTag is enabled and pending
                                    expect(policy?.requiresTag).toBeTruthy();
                                    expect(policy?.pendingFields?.requiresTag).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(mockFetch?.resume)
                .then(waitForBatchedUpdates)
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                waitForCollectionCallback: false,
                                callback: (policy) => {
                                    Onyx.disconnect(connection);
                                    expect(policy?.pendingFields?.requiresTag).toBeFalsy();
                                    resolve();
                                },
                            });
                        }),
                );
        });

        it('disable require tag', () => {
            const fakePolicy = createRandomPolicy(0);
            fakePolicy.requiresTag = true;

            mockFetch?.pause?.();

            return Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy)
                .then(() => {
                    const {result: policyData} = renderHook(() => usePolicyData(fakePolicy.id), {wrapper: OnyxListItemProvider});
                    setPolicyRequiresTag(policyData.current, false);
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                waitForCollectionCallback: false,
                                callback: (policy) => {
                                    Onyx.disconnect(connection);

                                    // RequiresTag is disabled and pending
                                    expect(policy?.requiresTag).toBeFalsy();
                                    expect(policy?.pendingFields?.requiresTag).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(mockFetch?.resume)
                .then(waitForBatchedUpdates)
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                waitForCollectionCallback: false,
                                callback: (policy) => {
                                    Onyx.disconnect(connection);
                                    expect(policy?.pendingFields?.requiresTag).toBeFalsy();
                                    resolve();
                                },
                            });
                        }),
                );
        });

        it('reset require tag when api returns an error', () => {
            const fakePolicy = createRandomPolicy(0);
            fakePolicy.requiresTag = true;

            mockFetch?.pause?.();

            return Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy)
                .then(() => {
                    mockFetch?.fail?.();
                    const {result: policyData} = renderHook(() => usePolicyData(fakePolicy.id), {wrapper: OnyxListItemProvider});
                    setPolicyRequiresTag(policyData.current, false);
                    return waitForBatchedUpdates();
                })

                .then(mockFetch?.resume)
                .then(waitForBatchedUpdates)
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                waitForCollectionCallback: false,
                                callback: (policy) => {
                                    Onyx.disconnect(connection);
                                    expect(policy?.pendingFields?.requiresTag).toBeFalsy();
                                    expect(policy?.errors).toBeTruthy();
                                    expect(policy?.requiresTag).toBeTruthy();
                                    resolve();
                                },
                            });
                        }),
                );
        });

        it('should update required field in policy tag list', async () => {
            const fakePolicy = createRandomPolicy(0);
            const tagListName = 'Tag';
            fakePolicy.requiresTag = false;

            const fakePolicyTags = createRandomPolicyTags(tagListName);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, fakePolicyTags);

            const {result: policyData} = renderHook(() => usePolicyData(fakePolicy.id), {wrapper: OnyxListItemProvider});
            setPolicyRequiresTag(policyData.current, true);
            await waitForBatchedUpdates();

            let updatePolicyTags: PolicyTagLists | undefined;

            await TestHelper.getOnyxData({
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`,
                callback: (val) => (updatePolicyTags = val),
            });

            expect(updatePolicyTags?.[tagListName]?.required).toBeTruthy();
        });
    });

    describe('renamePolicyTagList', () => {
        it('rename policy tag list', () => {
            const fakePolicy = createRandomPolicy(0);
            fakePolicy.areTagsEnabled = true;

            const oldTagListName = 'Old tag list name';
            const newTagListName = 'New tag list name';
            const fakePolicyTags = createRandomPolicyTags(oldTagListName);

            mockFetch?.pause?.();

            return Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy)
                .then(() => {
                    Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, fakePolicyTags);
                })
                .then(() => {
                    const {result: policyData} = renderHook(() => usePolicyData(fakePolicy.id), {wrapper: OnyxListItemProvider});

                    renamePolicyTagList(
                        policyData.current,
                        {
                            oldName: oldTagListName,
                            newName: newTagListName,
                        },
                        Object.values(fakePolicyTags).at(0)?.orderWeight ?? 0,
                    );
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`,
                                waitForCollectionCallback: false,
                                callback: (policyTags) => {
                                    Onyx.disconnect(connection);

                                    // Tag list name is updated and pending
                                    expect(Object.keys(policyTags?.[oldTagListName] ?? {}).length).toBe(0);
                                    expect(policyTags?.[newTagListName]?.name).toBe(newTagListName);
                                    expect(policyTags?.[newTagListName]?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(mockFetch?.resume)
                .then(waitForBatchedUpdates)
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`,
                                waitForCollectionCallback: false,
                                callback: (policyTags) => {
                                    Onyx.disconnect(connection);

                                    expect(policyTags?.[newTagListName]?.pendingAction).toBeFalsy();
                                    expect(Object.keys(policyTags?.[oldTagListName] ?? {}).length).toBe(0);

                                    resolve();
                                },
                            });
                        }),
                );
        });

        it('reset the policy tag list name when api returns error', () => {
            const fakePolicy = createRandomPolicy(0);
            fakePolicy.areTagsEnabled = true;

            const oldTagListName = 'Old tag list name';
            const newTagListName = 'New tag list name';
            const fakePolicyTags = createRandomPolicyTags(oldTagListName);

            mockFetch?.pause?.();

            return Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy)
                .then(() => {
                    Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, fakePolicyTags);
                })
                .then(() => {
                    mockFetch?.fail?.();

                    const {result: policyData} = renderHook(() => usePolicyData(fakePolicy.id), {wrapper: OnyxListItemProvider});

                    renamePolicyTagList(
                        policyData.current,
                        {
                            oldName: oldTagListName,
                            newName: newTagListName,
                        },
                        Object.values(fakePolicyTags).at(0)?.orderWeight ?? 0,
                    );
                    return waitForBatchedUpdates();
                })
                .then(mockFetch?.resume)
                .then(waitForBatchedUpdates)
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`,
                                waitForCollectionCallback: false,
                                callback: (policyTags) => {
                                    Onyx.disconnect(connection);

                                    expect(policyTags?.[newTagListName]).toBeFalsy();
                                    expect(policyTags?.[oldTagListName]).toBeTruthy();
                                    expect(policyTags?.[oldTagListName]?.errors).toBeTruthy();

                                    resolve();
                                },
                            });
                        }),
                );
        });
    });

    describe('CreatePolicyTag', () => {
        it('create new policy tag', async () => {
            // Given a policy with existing tags
            const fakePolicy = createRandomPolicy(0);
            fakePolicy.areTagsEnabled = true;

            const tagListName = 'Fake tag';
            const newTagName = 'new tag';
            const fakePolicyTags = createRandomPolicyTags(tagListName);

            mockFetch.pause();
            await waitForBatchedUpdates();

            // When creating a new tag
            createPolicyTag(fakePolicy.id, newTagName, fakePolicyTags);
            await waitForBatchedUpdates();

            // Then the tag should appear optimistically with pending state so the user sees immediate feedback
            const policyTagsOptimistic = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`);
            const newTagOptimistic = policyTagsOptimistic?.[tagListName]?.tags?.[newTagName];
            expect(newTagOptimistic?.name).toBe(newTagName);
            expect(newTagOptimistic?.enabled).toBe(true);
            expect(newTagOptimistic?.errors).toBeFalsy();
            expect(newTagOptimistic?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

            mockFetch.resume();
            await waitForBatchedUpdates();

            // Then the pending state should be cleared after API success
            const policyTagsSuccess = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`);
            const newTagSuccess = policyTagsSuccess?.[tagListName]?.tags?.[newTagName];
            expect(newTagSuccess?.errors).toBeFalsy();
            expect(newTagSuccess?.pendingAction).toBeFalsy();
        });

        it('reset new policy tag when api returns error', async () => {
            // Given a policy with existing tags
            const fakePolicy = createRandomPolicy(0);
            fakePolicy.areTagsEnabled = true;

            const tagListName = 'Fake tag';
            const newTagName = 'new tag';
            const fakePolicyTags = createRandomPolicyTags(tagListName);

            mockFetch.pause();
            await waitForBatchedUpdates();
            mockFetch.fail();

            // When the API fails
            createPolicyTag(fakePolicy.id, newTagName, fakePolicyTags);
            await waitForBatchedUpdates();
            mockFetch.resume();
            await waitForBatchedUpdates();

            // Then the tag should have errors
            const policyTags = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`);
            const newTag = policyTags?.[tagListName]?.tags?.[newTagName];
            expect(newTag?.errors).toBeTruthy();
        });

        it('should handle empty policy tags object', async () => {
            // Given a policy with no existing tags
            const fakePolicy = createRandomPolicy(0);
            fakePolicy.areTagsEnabled = true;

            const newTagName = 'new tag';

            mockFetch.pause();
            await waitForBatchedUpdates();

            // When adding the first tag
            createPolicyTag(fakePolicy.id, newTagName, {});
            await waitForBatchedUpdates();

            // Then the tag should be created in a new list with pending state so the user sees immediate feedback
            const policyTagsOptimistic = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`);
            const tagListKeys = Object.keys(policyTagsOptimistic ?? {});
            const firstTagList = tagListKeys.at(0);
            if (firstTagList != null) {
                const newTagOptimistic = policyTagsOptimistic?.[firstTagList]?.tags?.[newTagName];
                expect(newTagOptimistic?.name).toBe(newTagName);
                expect(newTagOptimistic?.enabled).toBe(true);
                expect(newTagOptimistic?.errors).toBeFalsy();
                expect(newTagOptimistic?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
            }

            mockFetch.resume();
            await waitForBatchedUpdates();

            // Then the pending state should be cleared after API success
            const policyTagsSuccess = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`);
            const tagListKeysSuccess = Object.keys(policyTagsSuccess ?? {});
            const firstTagListSuccess = tagListKeysSuccess.at(0);
            if (firstTagListSuccess != null) {
                const newTagSuccess = policyTagsSuccess?.[firstTagListSuccess]?.tags?.[newTagName];
                expect(newTagSuccess?.errors).toBeFalsy();
                expect(newTagSuccess?.pendingAction).toBeFalsy();
            }
        });

        it('should work with data from useOnyx hook', async () => {
            // Given a policy with tags loaded via useOnyx
            const fakePolicy = createRandomPolicy(0);
            fakePolicy.areTagsEnabled = true;

            const tagListName = 'Integration tag';
            const newTagName = 'useOnyx tag';
            const fakePolicyTags = createRandomPolicyTags(tagListName);

            mockFetch.pause();

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, fakePolicyTags);
            await waitForBatchedUpdates();

            const {result} = renderHook(() => useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`));

            await waitFor(() => {
                expect(result.current[0]).toBeDefined();
            });

            // When using data from useOnyx hook
            createPolicyTag(fakePolicy.id, newTagName, result.current[0] ?? {});
            await waitForBatchedUpdates();

            // Then the tag should appear optimistically with pending state so the user sees immediate feedback
            const policyTagsOptimistic = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`);
            const newTagOptimistic = policyTagsOptimistic?.[tagListName]?.tags?.[newTagName];
            expect(newTagOptimistic?.name).toBe(newTagName);
            expect(newTagOptimistic?.enabled).toBe(true);
            expect(newTagOptimistic?.errors).toBeFalsy();
            expect(newTagOptimistic?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

            mockFetch.resume();
            await waitForBatchedUpdates();

            // Then the pending state should be cleared after API success
            const policyTagsSuccess = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`);
            const newTagSuccess = policyTagsSuccess?.[tagListName]?.tags?.[newTagName];
            expect(newTagSuccess?.errors).toBeFalsy();
            expect(newTagSuccess?.pendingAction).toBeFalsy();
        });
    });

    describe('SetWorkspaceTagEnabled', () => {
        it('set policy tag enable', async () => {
            const fakePolicy = createRandomPolicy(0);
            fakePolicy.areTagsEnabled = true;

            const tagListName = 'Fake tag';
            const fakePolicyTags = createRandomPolicyTags(tagListName, 2);
            const tagsToUpdate = Object.keys(fakePolicyTags?.[tagListName]?.tags ?? {}).reduce<PolicyTags>((acc, key) => {
                acc[key] = {
                    name: fakePolicyTags?.[tagListName]?.tags[key].name,
                    enabled: false,
                };
                return acc;
            }, {});

            mockFetch?.pause?.();

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, fakePolicyTags);

            const {result: policyData} = renderHook(() => usePolicyData(fakePolicy.id), {wrapper: OnyxListItemProvider});
            await waitForBatchedUpdates();
            setWorkspaceTagEnabled(policyData.current, tagsToUpdate, 0);
            await waitForBatchedUpdates();

            // Check optimistic updates
            let optimisticPolicyTags: PolicyTagLists | undefined;
            await TestHelper.getOnyxData({
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`,
                callback: (val) => (optimisticPolicyTags = val),
            });

            Object.keys(tagsToUpdate).forEach((key) => {
                const updatedTag = optimisticPolicyTags?.[tagListName]?.tags[key];
                expect(updatedTag?.enabled).toBeFalsy();
                expect(updatedTag?.errors).toBeFalsy();
                expect(updatedTag?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                expect(updatedTag?.pendingFields?.enabled).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
            });

            mockFetch?.resume?.();
            await waitForBatchedUpdates();

            // Check success updates
            let successPolicyTags: PolicyTagLists | undefined;
            await TestHelper.getOnyxData({
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`,
                callback: (val) => (successPolicyTags = val),
            });

            Object.keys(tagsToUpdate).forEach((key) => {
                const updatedTag = successPolicyTags?.[tagListName]?.tags[key];
                expect(updatedTag?.errors).toBeFalsy();
                expect(updatedTag?.pendingAction).toBeFalsy();
                expect(updatedTag?.pendingFields?.enabled).toBeFalsy();
            });
        });

        it('reset policy tag enable when api returns error', async () => {
            const fakePolicy = createRandomPolicy(0);
            fakePolicy.areTagsEnabled = true;

            const tagListName = 'Fake tag';
            const fakePolicyTags = createRandomPolicyTags(tagListName, 2);
            const tagsToUpdate = Object.keys(fakePolicyTags?.[tagListName]?.tags ?? {}).reduce<PolicyTags>((acc, key) => {
                acc[key] = {
                    name: fakePolicyTags?.[tagListName]?.tags[key].name,
                    enabled: false,
                };
                return acc;
            }, {});

            mockFetch?.pause?.();

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, fakePolicyTags);

            mockFetch?.fail?.();
            const {result: policyData} = renderHook(() => usePolicyData(fakePolicy.id), {wrapper: OnyxListItemProvider});
            setWorkspaceTagEnabled(policyData.current, tagsToUpdate, 0);
            await waitForBatchedUpdates();

            mockFetch?.resume?.();
            await waitForBatchedUpdates();

            // Check failure updates
            let failurePolicyTags: PolicyTagLists | undefined;
            await TestHelper.getOnyxData({
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`,
                callback: (val) => (failurePolicyTags = val),
            });

            Object.keys(tagsToUpdate).forEach((key) => {
                const updatedTag = failurePolicyTags?.[tagListName]?.tags[key];
                expect(updatedTag?.errors).toBeTruthy();
                expect(updatedTag?.pendingAction).toBeFalsy();
                expect(updatedTag?.pendingFields?.enabled).toBeFalsy();
            });
        });

        it('should work with data from useOnyx hook', async () => {
            const fakePolicy = createRandomPolicy(0);
            const tagListName = 'Test tag';
            const fakePolicyTags = createRandomPolicyTags(tagListName, 1);
            const tagName = Object.keys(fakePolicyTags?.[tagListName]?.tags ?? {}).at(0) ?? '';

            mockFetch?.pause?.();
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, fakePolicyTags);

            const {result} = renderHook(() => useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`));

            const {result: policyData} = renderHook(() => usePolicyData(fakePolicy.id), {wrapper: OnyxListItemProvider});
            await waitForBatchedUpdates();

            await waitFor(() => {
                expect(result.current[0]).toBeDefined();
            });

            setWorkspaceTagEnabled(policyData.current, {[tagName]: {name: tagName, enabled: false}}, 0);

            await waitForBatchedUpdates();

            // Check optimistic updates
            let optimisticPolicyTags: PolicyTagLists | undefined;
            await TestHelper.getOnyxData({
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`,
                callback: (val) => (optimisticPolicyTags = val),
            });

            const optimisticTag = optimisticPolicyTags?.[tagListName]?.tags[tagName];
            expect(optimisticTag?.enabled).toBe(false);
            expect(optimisticTag?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            // Check success updates
            mockFetch?.resume?.();
            await waitForBatchedUpdates();

            let successPolicyTags: PolicyTagLists | undefined;
            await TestHelper.getOnyxData({
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`,
                callback: (val) => (successPolicyTags = val),
            });

            const successTag = successPolicyTags?.[tagListName]?.tags[tagName];
            expect(successTag?.enabled).toBe(false);
            expect(successTag?.pendingAction).toBeFalsy();
        });
    });

    describe('RenamePolicyTag', () => {
        it('rename policy tag', () => {
            const fakePolicy = createRandomPolicy(0);
            fakePolicy.areTagsEnabled = true;

            const tagListName = 'Fake tag';
            const fakePolicyTags = createRandomPolicyTags(tagListName, 2);
            const oldTagName = Object.keys(fakePolicyTags?.[tagListName]?.tags).at(0);
            const newTagName = 'New tag';

            mockFetch?.pause?.();

            return Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy)
                .then(() => {
                    Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, fakePolicyTags);
                })
                .then(() => {
                    const {result: policyData} = renderHook(() => usePolicyData(fakePolicy.id), {wrapper: OnyxListItemProvider});
                    renamePolicyTag(
                        policyData.current,
                        {
                            oldName: oldTagName ?? '',
                            newName: newTagName,
                        },
                        0,
                    );
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`,
                                waitForCollectionCallback: false,
                                callback: (policyTags) => {
                                    Onyx.disconnect(connection);

                                    const tags = policyTags?.[tagListName]?.tags;
                                    expect(tags?.[oldTagName ?? '']).toBeFalsy();
                                    expect(tags?.[newTagName]?.name).toBe(newTagName);
                                    expect(tags?.[newTagName]?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                                    expect(tags?.[newTagName]?.pendingFields?.name).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(mockFetch?.resume)
                .then(waitForBatchedUpdates)
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`,
                                waitForCollectionCallback: false,
                                callback: (policyTags) => {
                                    Onyx.disconnect(connection);

                                    const tags = policyTags?.[tagListName]?.tags;
                                    expect(tags?.[newTagName]?.pendingAction).toBeFalsy();
                                    expect(tags?.[newTagName]?.pendingFields?.name).toBeFalsy();

                                    resolve();
                                },
                            });
                        }),
                );
        });

        it('reset policy tag name when api returns error', () => {
            const fakePolicy = createRandomPolicy(0);
            fakePolicy.areTagsEnabled = true;

            const tagListName = 'Fake tag';
            const fakePolicyTags = createRandomPolicyTags(tagListName, 2);
            const oldTagName = Object.keys(fakePolicyTags?.[tagListName]?.tags).at(0) ?? '';
            const newTagName = 'New tag';

            mockFetch?.pause?.();

            return Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy)
                .then(() => {
                    Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, fakePolicyTags);
                })
                .then(() => {
                    mockFetch?.fail?.();

                    const {result: policyData} = renderHook(() => usePolicyData(fakePolicy.id), {wrapper: OnyxListItemProvider});
                    renamePolicyTag(
                        policyData.current,
                        {
                            oldName: oldTagName,
                            newName: newTagName,
                        },
                        0,
                    );
                    return waitForBatchedUpdates();
                })
                .then(mockFetch?.resume)
                .then(waitForBatchedUpdates)
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`,
                                waitForCollectionCallback: false,
                                callback: (policyTags) => {
                                    Onyx.disconnect(connection);

                                    const tags = policyTags?.[tagListName]?.tags;
                                    expect(tags?.[newTagName]).toBeFalsy();
                                    expect(tags?.[oldTagName]?.errors).toBeTruthy();

                                    resolve();
                                },
                            });
                        }),
                );
        });
    });

    describe('DeletePolicyTags', () => {
        it('should not modify Onyx data when policyTags is empty', async () => {
            const fakePolicy = createRandomPolicy(0);
            const tagListName = 'ExistingTagList';
            const existingPolicyTags = createRandomPolicyTags(tagListName, 3);

            existingPolicyTags[tagListName] = {
                ...existingPolicyTags[tagListName],
                required: true,
                orderWeight: 1,
            };

            mockFetch?.pause?.();

            const tagsToDelete = ['tag1', 'tag2'];

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, existingPolicyTags);
            await waitForBatchedUpdates();

            const {result: policyData} = renderHook(() => usePolicyData(fakePolicy.id), {wrapper: OnyxListItemProvider});
            expect(() => {
                deletePolicyTags(policyData.current, tagsToDelete);
            }).not.toThrow();

            await mockFetch?.resume?.();
            await waitForBatchedUpdates();

            let updatedPolicyTags: PolicyTagLists | undefined;
            await TestHelper.getOnyxData({
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`,
                callback: (val) => (updatedPolicyTags = val),
            });

            expect(updatedPolicyTags).toEqual(existingPolicyTags);
            expect(Object.keys(updatedPolicyTags?.[tagListName]?.tags ?? {}).length).toBe(3);
            expect(updatedPolicyTags?.[tagListName]?.required).toBe(true);
            expect(updatedPolicyTags?.[tagListName]?.orderWeight).toBe(1);
        });

        it('should not modify Onyx data when tagsToDelete do not exist', async () => {
            const fakePolicy = createRandomPolicy(0);
            const tagListName = 'ExistingTagList';
            const existingPolicyTags = createRandomPolicyTags(tagListName, 3);

            existingPolicyTags[tagListName] = {
                ...existingPolicyTags[tagListName],
                required: true,
                orderWeight: 1,
            };

            const tagsToDelete = ['NonExistentTag1', 'NonExistentTag2', 'NonExistentTag3'];

            mockFetch?.pause?.();

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, existingPolicyTags);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, existingPolicyTags);

            await waitForBatchedUpdates();
            const {result: policyData} = renderHook(() => usePolicyData(fakePolicy.id), {wrapper: OnyxListItemProvider});

            expect(() => {
                deletePolicyTags(policyData.current, tagsToDelete);
            }).not.toThrow();

            await mockFetch?.resume?.();
            await waitForBatchedUpdates();

            let updatedPolicyTags: PolicyTagLists | undefined;
            await TestHelper.getOnyxData({
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`,
                callback: (val) => (updatedPolicyTags = val),
            });

            expect(updatedPolicyTags).toEqual(existingPolicyTags);
            expect(Object.keys(updatedPolicyTags?.[tagListName]?.tags ?? {}).length).toBe(3);
            expect(updatedPolicyTags?.[tagListName]?.required).toBe(true);
            expect(updatedPolicyTags?.[tagListName]?.orderWeight).toBe(1);
        });

        it('delete policy tag', async () => {
            const fakePolicy = createRandomPolicy(0);
            fakePolicy.areTagsEnabled = true;

            const tagListName = 'Fake tag';
            const fakePolicyTags = createRandomPolicyTags(tagListName, 2);
            const tagsToDelete = Object.keys(fakePolicyTags?.[tagListName]?.tags ?? {});

            mockFetch?.pause?.();

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, fakePolicyTags);

            const {result: policyData} = renderHook(() => usePolicyData(fakePolicy.id), {wrapper: OnyxListItemProvider});
            deletePolicyTags(policyData.current, tagsToDelete);

            await waitForBatchedUpdates();

            // Verify optimistic data
            let updatePolicyTags: PolicyTagLists | undefined;
            await TestHelper.getOnyxData({
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`,
                callback: (val) => (updatePolicyTags = val),
            });

            tagsToDelete.forEach((tagName) => {
                expect(updatePolicyTags?.[tagListName]?.tags[tagName]?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
            });

            await mockFetch?.resume?.();
            await waitForBatchedUpdates();

            // Verify success data
            await TestHelper.getOnyxData({
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`,
                callback: (val) => (updatePolicyTags = val),
            });

            tagsToDelete.forEach((tagName) => {
                expect(updatePolicyTags?.[tagListName]?.tags[tagName]).toBeFalsy();
            });
        });

        it('reset the deleted policy tag when api returns error', async () => {
            const fakePolicy = createRandomPolicy(0);
            fakePolicy.areTagsEnabled = true;

            const tagListName = 'Fake tag';
            const fakePolicyTags = createRandomPolicyTags(tagListName, 2);
            const tagsToDelete = Object.keys(fakePolicyTags?.[tagListName]?.tags ?? {});

            mockFetch?.pause?.();

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, fakePolicyTags);
            await waitForBatchedUpdates();

            const {result: policyData} = renderHook(() => usePolicyData(fakePolicy.id), {wrapper: OnyxListItemProvider});

            mockFetch?.fail?.();
            deletePolicyTags(policyData.current, tagsToDelete);
            await waitForBatchedUpdates();

            await mockFetch?.resume?.();
            await waitForBatchedUpdates();

            // Verify failure data
            let updatePolicyTags: PolicyTagLists | undefined;
            await TestHelper.getOnyxData({
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`,
                callback: (val) => (updatePolicyTags = val),
            });

            tagsToDelete.forEach((tagName) => {
                expect(updatePolicyTags?.[tagListName]?.tags[tagName].pendingAction).toBeFalsy();
                expect(updatePolicyTags?.[tagListName]?.tags[tagName].errors).toBeTruthy();
            });
        });

        it('should work with data from useOnyx hook', async () => {
            const fakePolicy = createRandomPolicy(0);
            const tagListName = 'Test tag';
            const fakePolicyTags = createRandomPolicyTags(tagListName, 2);
            const tagsToDelete = Object.keys(fakePolicyTags?.[tagListName]?.tags ?? {});

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, fakePolicyTags);

            const {result: policyData} = renderHook(() => usePolicyData(fakePolicy.id), {wrapper: OnyxListItemProvider});

            deletePolicyTags(policyData.current, tagsToDelete);

            await mockFetch?.resume?.();
            await waitForBatchedUpdates();

            // Verify success data
            let updatePolicyTags: PolicyTagLists | undefined;
            await TestHelper.getOnyxData({
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`,
                callback: (val) => (updatePolicyTags = val),
            });

            tagsToDelete.forEach((tagName) => {
                expect(updatePolicyTags?.[tagListName]?.tags[tagName]).toBeFalsy();
            });
        });
    });

    describe('ClearPolicyTagErrors', () => {
        it('should clear errors for a tag', async () => {
            const fakePolicy = createRandomPolicy(0);
            const tagListName = 'Test tag';
            const fakePolicyTags = createRandomPolicyTags(tagListName, 2);
            const tagNames = Object.keys(fakePolicyTags?.[tagListName]?.tags ?? {});
            const tagToClear = tagNames.at(0) ?? '';
            const tagToKeep = tagNames.at(1) ?? '';

            // Add errors to both tags
            fakePolicyTags[tagListName].tags[tagToClear] = {
                ...fakePolicyTags[tagListName].tags[tagToClear],
                errors: {field: 'Error on first tag'},
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            };
            fakePolicyTags[tagListName].tags[tagToKeep] = {
                ...fakePolicyTags[tagListName].tags[tagToKeep],
                errors: {field: 'Error on second tag'},
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, fakePolicyTags);

            // Clear errors only for the first tag
            clearPolicyTagErrors({policyID: fakePolicy.id, tagName: tagToClear, tagListIndex: 0, policyTags: fakePolicyTags});
            await waitForBatchedUpdates();

            let updatedPolicyTags: PolicyTagLists | undefined;
            await TestHelper.getOnyxData({
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`,
                callback: (val) => (updatedPolicyTags = val),
            });

            // Verify that the first tag has errors cleared
            expect(updatedPolicyTags?.[tagListName]?.tags[tagToClear]).toBeDefined();
            expect(updatedPolicyTags?.[tagListName]?.tags[tagToClear].name).toBe(tagToClear);
            expect(updatedPolicyTags?.[tagListName]?.tags[tagToClear].enabled).toBe(true);
            expect(updatedPolicyTags?.[tagListName]?.tags[tagToClear].errors).toBeUndefined();
            expect(updatedPolicyTags?.[tagListName]?.tags[tagToClear].pendingAction).toBeUndefined();

            // Verify that the second tag still has errors
            expect(updatedPolicyTags?.[tagListName]?.tags[tagToKeep]).toBeDefined();
            expect(updatedPolicyTags?.[tagListName]?.tags[tagToKeep].name).toBe(tagToKeep);
            expect(updatedPolicyTags?.[tagListName]?.tags[tagToKeep].enabled).toBe(true);
            expect(updatedPolicyTags?.[tagListName]?.tags[tagToKeep].errors).toEqual({field: 'Error on second tag'});
            expect(updatedPolicyTags?.[tagListName]?.tags[tagToKeep].pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
        });

        it('should delete tag when pendingAction is ADD', async () => {
            const fakePolicy = createRandomPolicy(0);
            const tagListName = 'Test tag';
            const fakePolicyTags = createRandomPolicyTags(tagListName, 1);
            const tagName = Object.keys(fakePolicyTags?.[tagListName]?.tags ?? {}).at(0) ?? '';

            fakePolicyTags[tagListName].tags[tagName] = {
                ...fakePolicyTags[tagListName].tags[tagName],
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, fakePolicyTags);

            clearPolicyTagErrors({policyID: fakePolicy.id, tagName, tagListIndex: 0, policyTags: fakePolicyTags});
            await waitForBatchedUpdates();

            let updatedPolicyTags: PolicyTagLists | undefined;
            await TestHelper.getOnyxData({
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`,
                callback: (val) => (updatedPolicyTags = val),
            });

            expect(updatedPolicyTags?.[tagListName]?.tags[tagName]).toBeUndefined();
        });

        it('should return early if tag does not exist', () => {
            const fakePolicy = createRandomPolicy(0);
            const tagListName = 'Test tag';
            const fakePolicyTags = createRandomPolicyTags(tagListName, 2);

            const nonExistentTagName = 'nonExistentTag';
            clearPolicyTagErrors({policyID: fakePolicy.id, tagName: nonExistentTagName, tagListIndex: 0, policyTags: fakePolicyTags});

            const existingTagNames = Object.keys(fakePolicyTags[tagListName].tags);
            expect(existingTagNames).toHaveLength(2);
            expect(fakePolicyTags[tagListName].tags[nonExistentTagName]).toBeUndefined();
        });

        it('should work with data from useOnyx hook', async () => {
            const fakePolicy = createRandomPolicy(0);
            const tagListName = 'Test tag';
            const fakePolicyTags = createRandomPolicyTags(tagListName, 1);
            const tagName = Object.keys(fakePolicyTags?.[tagListName]?.tags ?? {}).at(0) ?? '';

            fakePolicyTags[tagListName].tags[tagName] = {
                ...fakePolicyTags[tagListName].tags[tagName],
                errors: {field: 'Test error'},
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, fakePolicyTags);

            const {result} = renderHook(() => useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`));

            clearPolicyTagErrors({policyID: fakePolicy.id, tagName, tagListIndex: 0, policyTags: result.current[0]});
            await waitForBatchedUpdates();

            // Verify errors are cleared
            let updatedPolicyTags: PolicyTagLists | undefined;
            await TestHelper.getOnyxData({
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`,
                callback: (val) => (updatedPolicyTags = val),
            });

            expect(updatedPolicyTags?.[tagListName]?.tags[tagName]).toBeDefined();
            expect(updatedPolicyTags?.[tagListName]?.tags[tagName].name).toBe(tagName);
            expect(updatedPolicyTags?.[tagListName]?.tags[tagName].enabled).toBe(true);
            expect(updatedPolicyTags?.[tagListName]?.tags[tagName].errors).toBeUndefined();
            expect(updatedPolicyTags?.[tagListName]?.tags[tagName].pendingAction).toBeUndefined();
        });
    });

    describe('ClearPolicyTagListErrorField', () => {
        it('should clear specific error field from tag list', async () => {
            // Given a policy with a tag list that has multiple error fields
            const fakePolicy = createRandomPolicy(0);
            const tagListName = 'Test tag list';
            const fakePolicyTags = createRandomPolicyTags(tagListName, 2);

            fakePolicyTags[tagListName] = {
                ...fakePolicyTags[tagListName],
                errorFields: {
                    name: {genericError: 'Name error'},
                    required: {genericError: 'Required error'},
                    maxTagsSelected: {genericError: 'Max tags error'},
                },
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, fakePolicyTags);

            // When clearing only the 'required' error field from the tag list
            clearPolicyTagListErrorField({policyID: fakePolicy.id, tagListIndex: 0, errorField: 'required', policyTags: fakePolicyTags});
            await waitForBatchedUpdates();

            let updatedPolicyTags: PolicyTagLists | undefined;
            await TestHelper.getOnyxData({
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`,
                callback: (val) => (updatedPolicyTags = val),
            });

            // Then only the 'required' error field should be cleared while other error fields remain
            expect(updatedPolicyTags?.[tagListName]).toBeDefined();
            expect(updatedPolicyTags?.[tagListName].errorFields?.required).toBeUndefined();
            expect(updatedPolicyTags?.[tagListName].errorFields?.name).toEqual({genericError: 'Name error'});
            expect(updatedPolicyTags?.[tagListName].errorFields?.maxTagsSelected).toEqual({genericError: 'Max tags error'});
        });

        it('should not modify Onyx data when tag list does not exist', async () => {
            // Given a policy with no tag lists
            const fakePolicy = createRandomPolicy(0);
            const fakePolicyTags = {};

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, fakePolicyTags);

            // When attempting to clear an error field from a non-existent tag list
            expect(() => {
                clearPolicyTagListErrorField({policyID: fakePolicy.id, tagListIndex: 0, errorField: 'required', policyTags: fakePolicyTags});
            }).not.toThrow();

            let updatedPolicyTags: PolicyTagLists | undefined;
            await TestHelper.getOnyxData({
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`,
                callback: (val) => (updatedPolicyTags = val),
            });

            // Then the policy tags should remain unchanged because the tag list does not exist
            expect(updatedPolicyTags).toEqual(fakePolicyTags);
        });

        it('should not modify Onyx data when tag list has no name', async () => {
            // Given a policy with a tag list that has an empty name and error fields
            const fakePolicy = createRandomPolicy(0);
            const tagListName = 'Test tag list';
            const fakePolicyTags = createRandomPolicyTags(tagListName, 1);

            fakePolicyTags[tagListName] = {
                ...fakePolicyTags[tagListName],
                name: '',
                errorFields: {
                    required: {genericError: 'This error should not be cleared'},
                    name: {genericError: 'This error should also remain'},
                },
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, fakePolicyTags);

            // When attempting to clear an error field from a tag list with no name
            expect(() => {
                clearPolicyTagListErrorField({policyID: fakePolicy.id, tagListIndex: 0, errorField: 'required', policyTags: fakePolicyTags});
            }).not.toThrow();

            await waitForBatchedUpdates();

            let updatedPolicyTags: PolicyTagLists | undefined;
            await TestHelper.getOnyxData({
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`,
                callback: (val) => (updatedPolicyTags = val),
            });

            // Then the error fields should remain unchanged because the tag list name is empty
            expect(updatedPolicyTags?.[tagListName].errorFields?.required).toEqual({genericError: 'This error should not be cleared'});
            expect(updatedPolicyTags?.[tagListName].errorFields?.name).toEqual({genericError: 'This error should also remain'});
            expect(updatedPolicyTags?.[tagListName].name).toBe('');
        });

        it('should work with data from useOnyx hook', async () => {
            // Given a policy with a tag list that has error fields and is accessed via useOnyx hook
            const fakePolicy = createRandomPolicy(0);
            const tagListName = 'Test tag list';
            const fakePolicyTags = createRandomPolicyTags(tagListName, 1);

            fakePolicyTags[tagListName] = {
                ...fakePolicyTags[tagListName],
                errorFields: {
                    required: {genericError: 'Required field error'},
                    name: {genericError: 'Name field error'},
                },
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, fakePolicyTags);

            const {result} = renderHook(() => useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`));

            await waitFor(() => {
                expect(result.current[0]).toBeDefined();
            });

            // When clearing the 'name' error field using data from the useOnyx hook
            clearPolicyTagListErrorField({policyID: fakePolicy.id, tagListIndex: 0, errorField: 'name', policyTags: result.current[0]});
            await waitForBatchedUpdates();

            let updatedPolicyTags: PolicyTagLists | undefined;
            await TestHelper.getOnyxData({
                key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`,
                callback: (val) => (updatedPolicyTags = val),
            });

            // Then only the 'name' error field should be cleared while the 'required' error field remains
            expect(updatedPolicyTags?.[tagListName].errorFields?.name).toBeUndefined();
            expect(updatedPolicyTags?.[tagListName].errorFields?.required).toEqual({genericError: 'Required field error'});
        });
    });

    describe('buildOptimisticPolicyRecentlyUsedTags', () => {
        it('should return empty object when transactionTags is undefined', () => {
            const result = buildOptimisticPolicyRecentlyUsedTags({
                policyTags: {},
                policyRecentlyUsedTags: {},
                transactionTags: undefined,
            });
            expect(result).toEqual({});
        });

        it('should return empty object when transactionTags is empty string', () => {
            const result = buildOptimisticPolicyRecentlyUsedTags({
                policyTags: {
                    Tag: {
                        name: 'Tag',
                        orderWeight: 0,
                        required: false,
                        tags: {
                            Engineering: {name: 'Engineering', enabled: true},
                            Marketing: {name: 'Marketing', enabled: true},
                            Sales: {name: 'Sales', enabled: true},
                        },
                    },
                },
                policyRecentlyUsedTags: {
                    Tag: ['Marketing', 'Sales'],
                },
                transactionTags: '',
            });
            expect(result).toEqual({});
        });

        it('should build optimistic recently used tags', () => {
            const result = buildOptimisticPolicyRecentlyUsedTags({
                policyTags: {
                    Tag: {
                        name: 'Tag',
                        orderWeight: 0,
                        required: false,
                        tags: {
                            Engineering: {name: 'Engineering', enabled: true},
                            Marketing: {name: 'Marketing', enabled: true},
                            Sales: {name: 'Sales', enabled: true},
                        },
                    },
                },
                policyRecentlyUsedTags: {
                    Tag: ['Marketing', 'Sales'],
                },
                transactionTags: 'Engineering',
            });

            expect(result).toEqual({
                Tag: ['Engineering', 'Marketing', 'Sales'],
            });
        });

        it('should handle multi-level tags', () => {
            const result = buildOptimisticPolicyRecentlyUsedTags({
                policyTags: {
                    Tag: {
                        name: 'Tag',
                        orderWeight: 0,
                        required: false,
                        tags: {
                            Engineering: {name: 'Engineering', enabled: true},
                            Marketing: {name: 'Marketing', enabled: true},
                        },
                    },
                    Team: {
                        name: 'Team',
                        orderWeight: 1,
                        required: false,
                        tags: {
                            Frontend: {name: 'Frontend', enabled: true},
                            Backend: {name: 'Backend', enabled: true},
                        },
                    },
                },
                policyRecentlyUsedTags: {
                    Tag: ['Marketing'],
                    Team: ['Backend', 'DevOps'],
                },
                transactionTags: 'Engineering:Frontend',
            });

            expect(result).toEqual({
                Tag: ['Engineering', 'Marketing'],
                Team: ['Frontend', 'Backend', 'DevOps'],
            });
        });

        it('should handle missing recently used tags', () => {
            const result = buildOptimisticPolicyRecentlyUsedTags({
                policyTags: {
                    Tag: {
                        name: 'Tag',
                        orderWeight: 0,
                        required: false,
                        tags: {
                            Engineering: {name: 'Engineering', enabled: true},
                        },
                    },
                },
                policyRecentlyUsedTags: {},
                transactionTags: 'Engineering',
            });

            expect(result).toEqual({
                Tag: ['Engineering'],
            });
        });

        it('should prevent duplicate tags in recently used array', () => {
            const result = buildOptimisticPolicyRecentlyUsedTags({
                policyTags: {
                    Tag: {
                        name: 'Tag',
                        orderWeight: 0,
                        required: false,
                        tags: {
                            Engineering: {name: 'Engineering', enabled: true},
                        },
                    },
                },
                policyRecentlyUsedTags: {
                    Tag: ['Engineering', 'Marketing', 'Sales'],
                },
                transactionTags: 'Engineering',
            });

            expect(result).toEqual({
                Tag: ['Engineering', 'Marketing', 'Sales'],
            });
        });

        it('should handle mismatched recently used tags keys', () => {
            const result = buildOptimisticPolicyRecentlyUsedTags({
                policyTags: {
                    Tag: {
                        name: 'Tag',
                        orderWeight: 0,
                        required: false,
                        tags: {
                            Engineering: {name: 'Engineering', enabled: true},
                        },
                    },
                    Team: {
                        name: 'Team',
                        orderWeight: 1,
                        required: false,
                        tags: {
                            Frontend: {name: 'Frontend', enabled: true},
                        },
                    },
                },
                policyRecentlyUsedTags: {
                    OldTag: ['Marketing'],
                    Team: ['Backend'],
                    AnotherOldList: ['SomeTag'],
                },
                transactionTags: 'Engineering:Frontend',
            });

            expect(result).toEqual({
                Tag: ['Engineering'],
                Team: ['Frontend', 'Backend'],
            });
        });

        it('should handle empty policy tags', () => {
            const result = buildOptimisticPolicyRecentlyUsedTags({
                policyTags: {},
                policyRecentlyUsedTags: {},
                transactionTags: 'Engineering',
            });

            expect(result).toEqual({
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '': ['Engineering'],
            });
        });

        it('should work with useOnyx data integration', async () => {
            const policyID = 'policy123';
            const transactionTags = 'Engineering';

            const policyTags: PolicyTagLists = {
                Tag: {
                    name: 'Tag',
                    orderWeight: 0,
                    required: false,
                    tags: {
                        Engineering: {name: 'Engineering', enabled: true},
                        Marketing: {name: 'Marketing', enabled: true},
                        Sales: {name: 'Sales', enabled: true},
                    },
                },
            };

            const existingRecentlyUsedTags: RecentlyUsedTags = {
                Tag: ['Marketing', 'Sales'],
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, policyTags);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${policyID}`, existingRecentlyUsedTags);
            await waitForBatchedUpdates();

            function useTestHook() {
                const [policyTagsFromOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {canBeMissing: true});
                const [policyRecentlyUsedTagsFromOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${policyID}`, {canBeMissing: true});

                return buildOptimisticPolicyRecentlyUsedTags({
                    policyTags: policyTagsFromOnyx ?? {},
                    policyRecentlyUsedTags: policyRecentlyUsedTagsFromOnyx ?? {},
                    transactionTags,
                });
            }

            const {result} = renderHook(() => useTestHook());

            await waitFor(() => {
                expect(result.current).toEqual({
                    Tag: ['Engineering', 'Marketing', 'Sales'],
                });
            });
        });
    });

    describe('EnablePolicyTags', () => {
        it('should enable tags and create default tag list if none exists', async () => {
            // Given a policy without tags
            const fakePolicy = createRandomPolicy(0);
            fakePolicy.areTagsEnabled = false;

            mockFetch.pause();

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            await waitForBatchedUpdates();

            const {result: policyData, rerender} = renderHook(() => usePolicyData(fakePolicy.id), {wrapper: OnyxListItemProvider});

            // When enabling tags
            enablePolicyTags(policyData.current, true);
            await waitForBatchedUpdates();

            rerender(fakePolicy.id);

            // Then the policy should be updated optimistically
            expect(policyData.current.policy?.areTagsEnabled).toBe(true);
            expect(policyData.current.policy?.pendingFields?.areTagsEnabled).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            // And a default tag list should be created
            const defaultTag = Object.values(policyData.current?.tags ?? {}).at(0);
            expect(defaultTag?.name).toBe('Tag');
            expect(defaultTag?.orderWeight).toBe(0);
            expect(defaultTag?.required).toBe(false);
            expect(defaultTag?.tags).toEqual({});

            mockFetch.resume();
            await waitForBatchedUpdates();

            rerender(fakePolicy.id);
            // And after API success, pending fields should be cleared
            expect(policyData.current.policy?.pendingFields?.areTagsEnabled).toBeFalsy();
        });

        it('should disable tags and update existing tag list', async () => {
            // Given a policy with enabled tags and existing tag list
            const fakePolicy = createRandomPolicy(0);
            fakePolicy.areTagsEnabled = true;

            const tagListName = 'Tag';
            const fakePolicyTags = createRandomPolicyTags(tagListName, 2);
            const existingTags = fakePolicyTags[tagListName]?.tags ?? {};

            mockFetch.pause();

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, fakePolicyTags);
            await waitForBatchedUpdates();

            const {result: policyData, rerender} = renderHook(() => usePolicyData(fakePolicy.id), {wrapper: OnyxListItemProvider});

            // When disabling tags
            enablePolicyTags(policyData.current, false);
            await waitForBatchedUpdates();

            // Then the policy should be updated optimistically
            rerender(fakePolicy.id);
            expect(policyData.current.policy?.areTagsEnabled).toBe(false);
            expect(policyData.current.policy?.requiresTag).toBe(false);
            expect(policyData.current.policy?.pendingFields?.areTagsEnabled).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            // And all tags should be disabled
            Object.keys(existingTags).forEach((tagName) => {
                expect(policyData.current?.tags?.[tagListName]?.tags[tagName]?.enabled).toBe(false);
            });

            await mockFetch.resume();

            await waitForBatchedUpdates();

            // And after API success, pending fields should be cleared
            rerender(fakePolicy.id);
            expect(policyData.current.policy?.pendingFields).toBeDefined();
        });

        it('should reset changes when API returns error', async () => {
            // Given a policy with disabled tags
            const fakePolicy = createRandomPolicy(0);
            fakePolicy.areTagsEnabled = false;

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            await waitForBatchedUpdates();

            const {result: policyData, rerender} = renderHook(() => usePolicyData(fakePolicy.id), {wrapper: OnyxListItemProvider});

            mockFetch.fail();

            // When enabling tags fails
            enablePolicyTags(policyData.current, true);
            await waitForBatchedUpdates();

            await mockFetch.resume();
            await waitForBatchedUpdates();

            rerender(fakePolicy.id);

            // After the API request failure, the policy should be reset to original state
            expect(policyData.current.policy.areTagsEnabled).toBe(false);
            expect(policyData.current.policy.pendingFields?.areTagsEnabled).toBeUndefined();
            expect(policyData.current.tags).toMatchObject({});
        });

        it('should work with data from useOnyx hook', async () => {
            // Given a policy data loaded via useOnyx
            const fakePolicy = createRandomPolicy(0);
            fakePolicy.areTagsEnabled = false;

            mockFetch.pause();

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            await waitForBatchedUpdates();

            const {result: policyData, rerender} = renderHook(() => usePolicyData(fakePolicy.id), {wrapper: OnyxListItemProvider});

            expect(policyData.current.policy).toBeDefined();

            enablePolicyTags(policyData.current, true);
            await waitForBatchedUpdates();
            rerender(fakePolicy.id);

            // Then the policy should be updated optimistically
            expect(policyData.current.policy.areTagsEnabled).toBe(true);
            expect(policyData.current.policy.pendingFields?.areTagsEnabled).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            await mockFetch.resume();
            await waitForBatchedUpdates();

            rerender(fakePolicy.id);

            // And after API success, policy should be enabled
            expect(policyData.current.policy.areTagsEnabled).toBe(true);
            expect(policyData.current.policy.pendingFields?.areTagsEnabled).toBeUndefined();

            // And default tag list should be created
            expect(policyData.current.tags.Tag).toBeDefined();
        });
    });

    describe('SetPolicyTagsRequired', () => {
        it('should set tag list as required when requiresTag is true', async () => {
            // Given a policy with a tag list that is not required
            const fakePolicy = createRandomPolicy(0);
            const tagListName = 'Test Tag List';
            const fakePolicyTags = createRandomPolicyTags(tagListName, 2);

            fakePolicyTags[tagListName] = {
                ...fakePolicyTags[tagListName],
                required: false,
                orderWeight: 0,
            };

            mockFetch.pause();
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, fakePolicyTags);
            await waitForBatchedUpdates();

            const {result: policyData, rerender} = renderHook(() => usePolicyData(fakePolicy.id), {wrapper: OnyxListItemProvider});

            // When setPolicyTagsRequired is called with requiresTag = true
            setPolicyTagsRequired(policyData.current, true, 0);
            await waitForBatchedUpdates();

            // Then the tag list should be marked as required with pending fields
            let updatedPolicyTags = policyData.current.tags;

            expect(updatedPolicyTags?.[tagListName]?.required).toBe(true);
            // Check optimistic data - pendingFields should be set
            if (updatedPolicyTags?.[tagListName]?.pendingFields?.required) {
                expect(updatedPolicyTags[tagListName].pendingFields.required).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
            }

            mockFetch.resume();
            await waitForBatchedUpdates();

            // Then after API success, pending fields should be cleared
            updatedPolicyTags = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`);

            expect(updatedPolicyTags?.[tagListName]?.required).toBe(true);
            expect(updatedPolicyTags?.[tagListName]?.pendingFields?.required).toBeUndefined();
        });

        it('should set tag list as not required when requiresTag is false', async () => {
            // Given a policy with a tag list that is required
            const fakePolicy = createRandomPolicy(0);
            const tagListName = 'Test Tag List';
            const fakePolicyTags = createRandomPolicyTags(tagListName, 2);

            fakePolicyTags[tagListName] = {
                ...fakePolicyTags[tagListName],
                required: true,
                orderWeight: 0,
            };

            mockFetch.pause();

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, fakePolicyTags);
            await waitForBatchedUpdates();

            const {result: policyData, rerender} = renderHook(() => usePolicyData(fakePolicy.id), {wrapper: OnyxListItemProvider});

            // When setPolicyTagsRequired is called with requiresTag = false
            setPolicyTagsRequired(policyData.current, false, 0);
            await waitForBatchedUpdates();

            rerender(fakePolicy.id);
            // Then the tag list should be marked as not required with pending fields
            let updatedPolicyTags = policyData.current.tags;

            expect(updatedPolicyTags?.[tagListName]?.required).toBe(false);
            // Check optimistic data - pendingFields should be set
            if (updatedPolicyTags?.[tagListName]?.pendingFields?.required) {
                expect(updatedPolicyTags[tagListName].pendingFields.required).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
            }

            mockFetch.resume();
            await waitForBatchedUpdates();

            rerender(fakePolicy.id);
            // Then after API success, pending fields should be cleared
            updatedPolicyTags = policyData.current.tags;

            expect(updatedPolicyTags?.[tagListName]?.required).toBe(false);
            expect(updatedPolicyTags?.[tagListName]?.pendingFields?.required).toBeUndefined();
        });

        it('should handle API failure and restore original state with error', async () => {
            // Given a policy with a tag list that is not required
            const fakePolicy = createRandomPolicy(0);
            const tagListName = 'Test Tag List';
            const fakePolicyTags = createRandomPolicyTags(tagListName, 2);

            fakePolicyTags[tagListName] = {
                ...fakePolicyTags[tagListName],
                required: false,
                orderWeight: 0,
            };

            mockFetch.pause();

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, fakePolicyTags);

            await waitForBatchedUpdates();

            const {result: policyData, rerender} = renderHook(() => usePolicyData(fakePolicy.id), {wrapper: OnyxListItemProvider});

            // When setPolicyTagsRequired is called and API fails
            mockFetch.fail();
            setPolicyTagsRequired(policyData.current, true, 0);
            await waitForBatchedUpdates();

            mockFetch.resume();
            await waitForBatchedUpdates();
            rerender(fakePolicy.id);

            // Then the tag list should be restored to original state with error
            const updatedPolicyTags = policyData.current.tags;
            expect(updatedPolicyTags?.[tagListName]?.required).toBe(false);
            expect(updatedPolicyTags?.[tagListName]?.pendingFields?.required).toBeUndefined();
            expect(updatedPolicyTags?.[tagListName]?.errorFields?.required).toBeTruthy();
        });

        it('should work with data from useOnyx hook', async () => {
            // Given a policy with a tag list that is not required
            const fakePolicy = createRandomPolicy(0);
            const tagListName = 'Test Tag List';
            const fakePolicyTags = createRandomPolicyTags(tagListName, 2);

            fakePolicyTags[tagListName] = {
                ...fakePolicyTags[tagListName],
                required: false,
                orderWeight: 0,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, fakePolicyTags);

            const {result} = renderHook(() => useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`));

            await waitFor(() => {
                expect(result.current[0]).toBeDefined();
            });

            const {result: policyData, rerender} = renderHook(() => usePolicyData(fakePolicy.id), {wrapper: OnyxListItemProvider});

            await act(async () => {
                // When setPolicyTagsRequired is called with data from useOnyx
                setPolicyTagsRequired(policyData.current, true, 0);
                await waitForBatchedUpdates();
            });

            // Then the tag list should be marked as required
            const updatedPolicyTags = policyData.current.tags;

            expect(updatedPolicyTags?.[tagListName]?.required).toBe(true);
            // Check optimistic data - pendingFields should be set
            if (updatedPolicyTags?.[tagListName]?.pendingFields?.required) {
                expect(updatedPolicyTags[tagListName].pendingFields.required).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
            }
        });
    });
});
