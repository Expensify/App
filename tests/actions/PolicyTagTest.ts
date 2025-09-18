import {renderHook, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
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
        it('create new policy tag', () => {
            const fakePolicy = createRandomPolicy(0);
            fakePolicy.areTagsEnabled = true;

            const tagListName = 'Fake tag';
            const newTagName = 'new tag';
            const fakePolicyTags = createRandomPolicyTags(tagListName);

            mockFetch?.pause?.();

            return Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy)
                .then(() => {
                    Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, fakePolicyTags);
                })
                .then(() => {
                    createPolicyTag(fakePolicy.id, newTagName);
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

                                    const newTag = policyTags?.[tagListName]?.tags?.[newTagName];
                                    expect(newTag?.name).toBe(newTagName);
                                    expect(newTag?.enabled).toBe(true);
                                    expect(newTag?.errors).toBeFalsy();
                                    expect(newTag?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

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

                                    const newTag = policyTags?.[tagListName]?.tags?.[newTagName];
                                    expect(newTag?.errors).toBeFalsy();
                                    expect(newTag?.pendingAction).toBeFalsy();

                                    resolve();
                                },
                            });
                        }),
                );
        });

        it('reset new policy tag when api returns error', () => {
            const fakePolicy = createRandomPolicy(0);
            fakePolicy.areTagsEnabled = true;

            const tagListName = 'Fake tag';
            const newTagName = 'new tag';
            const fakePolicyTags = createRandomPolicyTags(tagListName);

            mockFetch?.pause?.();

            return Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy)
                .then(() => {
                    Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, fakePolicyTags);
                })
                .then(() => {
                    mockFetch?.fail?.();

                    createPolicyTag(fakePolicy.id, newTagName);
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

                                    const newTag = policyTags?.[tagListName]?.tags?.[newTagName];
                                    expect(newTag?.errors).toBeTruthy();

                                    resolve();
                                },
                            });
                        }),
                );
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

            const emptyPolicyTags = {};
            const tagsToDelete = ['tag1', 'tag2'];

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, existingPolicyTags);

            expect(() => {
                deletePolicyTags(fakePolicy.id, tagsToDelete, emptyPolicyTags);
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

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, existingPolicyTags);

            expect(() => {
                deletePolicyTags(fakePolicy.id, tagsToDelete, existingPolicyTags);
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

            deletePolicyTags(fakePolicy.id, tagsToDelete, fakePolicyTags);
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

            mockFetch?.fail?.();
            deletePolicyTags(fakePolicy.id, tagsToDelete, fakePolicyTags);
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

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, fakePolicyTags);

            const {result} = renderHook(() => useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`));

            await waitFor(() => {
                expect(result.current[0]).toBeDefined();
            });

            deletePolicyTags(fakePolicy.id, tagsToDelete, result.current[0]);

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
});
