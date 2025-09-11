import {renderHook, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';
import useOnyx from '@hooks/useOnyx';
import OnyxUpdateManager from '@libs/actions/OnyxUpdateManager';
import {createPolicyTag, deletePolicyTags, renamePolicyTag, renamePolicyTagList, setPolicyRequiresTag, setWorkspaceTagEnabled} from '@libs/actions/Policy/Tag';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyTagLists, PolicyTags} from '@src/types/onyx';
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
                    setPolicyRequiresTag(fakePolicy.id, true);
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
                    setPolicyRequiresTag(fakePolicy.id, false);
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
                    setPolicyRequiresTag(fakePolicy.id, false);
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

            setPolicyRequiresTag(fakePolicy.id, true);
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
                    renamePolicyTagList(
                        fakePolicy.id,
                        {
                            oldName: oldTagListName,
                            newName: newTagListName,
                        },
                        fakePolicyTags,
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

                    renamePolicyTagList(
                        fakePolicy.id,
                        {
                            oldName: oldTagListName,
                            newName: newTagListName,
                        },
                        fakePolicyTags,
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
            const fakePolicy = createRandomPolicy(0);
            fakePolicy.areTagsEnabled = true;

            const tagListName = 'Fake tag';
            const newTagName = 'new tag';
            const fakePolicyTags = createRandomPolicyTags(tagListName);

            mockFetch?.pause?.();

            await waitForBatchedUpdates();
            createPolicyTag(fakePolicy.id, newTagName, fakePolicyTags);
            await waitForBatchedUpdates();

            // Verify optimistic data
            const policyTagsOptimistic = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`);
            const newTagOptimistic = policyTagsOptimistic?.[tagListName]?.tags?.[newTagName];
            expect(newTagOptimistic?.name).toBe(newTagName);
            expect(newTagOptimistic?.enabled).toBe(true);
            expect(newTagOptimistic?.errors).toBeFalsy();
            expect(newTagOptimistic?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

            mockFetch?.resume?.();
            await waitForBatchedUpdates();

            // Verify success data
            const policyTagsSuccess = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`);
            const newTagSuccess = policyTagsSuccess?.[tagListName]?.tags?.[newTagName];
            expect(newTagSuccess?.errors).toBeFalsy();
            expect(newTagSuccess?.pendingAction).toBeFalsy();
        });

        it('reset new policy tag when api returns error', async () => {
            const fakePolicy = createRandomPolicy(0);
            fakePolicy.areTagsEnabled = true;

            const tagListName = 'Fake tag';
            const newTagName = 'new tag';
            const fakePolicyTags = createRandomPolicyTags(tagListName);

            mockFetch?.pause?.();

            await waitForBatchedUpdates();
            mockFetch?.fail?.();
            createPolicyTag(fakePolicy.id, newTagName, fakePolicyTags);
            await waitForBatchedUpdates();

            mockFetch?.resume?.();
            await waitForBatchedUpdates();

            // Verify error state
            const policyTags = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`);
            const newTag = policyTags?.[tagListName]?.tags?.[newTagName];
            expect(newTag?.errors).toBeTruthy();
        });

        it('should handle empty policy tags object', async () => {
            const fakePolicy = createRandomPolicy(0);
            fakePolicy.areTagsEnabled = true;

            const newTagName = 'new tag';

            mockFetch?.pause?.();

            await waitForBatchedUpdates();
            createPolicyTag(fakePolicy.id, newTagName, {});
            await waitForBatchedUpdates();

            // Verify optimistic data
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

            mockFetch?.resume?.();
            await waitForBatchedUpdates();

            // Verify success data
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
            const fakePolicy = createRandomPolicy(0);
            fakePolicy.areTagsEnabled = true;

            const tagListName = 'Integration tag';
            const newTagName = 'useOnyx tag';
            const fakePolicyTags = createRandomPolicyTags(tagListName);

            mockFetch?.pause?.();

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, fakePolicyTags);
            await waitForBatchedUpdates();

            const {result} = renderHook(() => useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`));

            await waitFor(() => {
                expect(result.current[0]).toBeDefined();
            });

            createPolicyTag(fakePolicy.id, newTagName, result.current[0] ?? {});

            await waitForBatchedUpdates();

            // Verify optimistic data
            const policyTagsOptimistic = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`);
            const newTagOptimistic = policyTagsOptimistic?.[tagListName]?.tags?.[newTagName];
            expect(newTagOptimistic?.name).toBe(newTagName);
            expect(newTagOptimistic?.enabled).toBe(true);
            expect(newTagOptimistic?.errors).toBeFalsy();
            expect(newTagOptimistic?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

            mockFetch?.resume?.();
            await waitForBatchedUpdates();

            // Verify success data
            const policyTagsSuccess = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`);
            const newTagSuccess = policyTagsSuccess?.[tagListName]?.tags?.[newTagName];
            expect(newTagSuccess?.errors).toBeFalsy();
            expect(newTagSuccess?.pendingAction).toBeFalsy();
        });
    });

    describe('SetPolicyTagsEnabled', () => {
        it('set policy tag enable', () => {
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

            return Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy)
                .then(() => {
                    Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, fakePolicyTags);
                })
                .then(() => {
                    setWorkspaceTagEnabled(fakePolicy.id, tagsToUpdate, 0);
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

                                    Object.keys(tagsToUpdate).forEach((key) => {
                                        const updatedTag = policyTags?.[tagListName]?.tags[key];
                                        expect(updatedTag?.enabled).toBeFalsy();
                                        expect(updatedTag?.errors).toBeFalsy();
                                        expect(updatedTag?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                                        expect(updatedTag?.pendingFields?.enabled).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                                    });

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

                                    Object.keys(tagsToUpdate).forEach((key) => {
                                        const updatedTag = policyTags?.[tagListName]?.tags[key];
                                        expect(updatedTag?.errors).toBeFalsy();
                                        expect(updatedTag?.pendingAction).toBeFalsy();
                                        expect(updatedTag?.pendingFields?.enabled).toBeFalsy();
                                    });

                                    resolve();
                                },
                            });
                        }),
                );
        });

        it('reset policy tag enable when api returns error', () => {
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

            return Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy)
                .then(() => {
                    Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, fakePolicyTags);
                })
                .then(() => {
                    mockFetch?.fail?.();

                    setWorkspaceTagEnabled(fakePolicy.id, tagsToUpdate, 0);
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

                                    Object.keys(tagsToUpdate).forEach((key) => {
                                        const updatedTag = policyTags?.[tagListName]?.tags[key];
                                        expect(updatedTag?.errors).toBeTruthy();
                                        expect(updatedTag?.pendingAction).toBeFalsy();
                                        expect(updatedTag?.pendingFields?.enabled).toBeFalsy();
                                    });

                                    resolve();
                                },
                            });
                        }),
                );
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
                    renamePolicyTag(
                        fakePolicy.id,
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

                    renamePolicyTag(
                        fakePolicy.id,
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
        it('delete policy tag', () => {
            const fakePolicy = createRandomPolicy(0);
            fakePolicy.areTagsEnabled = true;

            const tagListName = 'Fake tag';
            const fakePolicyTags = createRandomPolicyTags(tagListName, 2);
            const tagsToDelete = Object.keys(fakePolicyTags?.[tagListName]?.tags ?? {});

            mockFetch?.pause?.();

            return Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy)
                .then(() => {
                    Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, fakePolicyTags);
                })
                .then(() => {
                    deletePolicyTags(fakePolicy.id, tagsToDelete);
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

                                    tagsToDelete.forEach((tagName) => {
                                        expect(policyTags?.[tagListName]?.tags[tagName]?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
                                    });

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

                                    tagsToDelete.forEach((tagName) => {
                                        expect(policyTags?.[tagListName]?.tags[tagName]).toBeFalsy();
                                    });

                                    resolve();
                                },
                            });
                        }),
                );
        });

        it('reset the deleted policy tag when api returns error', () => {
            const fakePolicy = createRandomPolicy(0);
            fakePolicy.areTagsEnabled = true;

            const tagListName = 'Fake tag';
            const fakePolicyTags = createRandomPolicyTags(tagListName, 2);
            const tagsToDelete = Object.keys(fakePolicyTags?.[tagListName]?.tags ?? {});

            mockFetch?.pause?.();

            return Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy)
                .then(() => {
                    Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, fakePolicyTags);
                })
                .then(() => {
                    mockFetch?.fail?.();

                    deletePolicyTags(fakePolicy.id, tagsToDelete);
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

                                    tagsToDelete.forEach((tagName) => {
                                        expect(policyTags?.[tagListName]?.tags[tagName].pendingAction).toBeFalsy();
                                        expect(policyTags?.[tagListName]?.tags[tagName].errors).toBeTruthy();
                                    });

                                    resolve();
                                },
                            });
                        }),
                );
        });
    });
});
