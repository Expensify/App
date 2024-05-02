import Onyx from 'react-native-onyx';
import OnyxUpdateManager from '@libs/actions/OnyxUpdateManager';
import * as Policy from '@libs/actions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyTags} from '@src/types/onyx';
import createRandomPolicy from '../utils/collections/policies';
import createRandomPolicyTags from '../utils/collections/policyTags';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

OnyxUpdateManager();
describe('actions/Policy', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
        global.fetch = TestHelper.getGlobalFetchMock();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('SetPolicyRequiresTag', () => {
        it('enable require tag', () => {
            const fakePolicy = createRandomPolicy(0);
            fakePolicy.requiresTag = false;

            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();

            return (
                Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy)
                    .then(() => {
                        Policy.setPolicyRequiresTag(fakePolicy.id, true);
                        return waitForBatchedUpdates();
                    })
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                    waitForCollectionCallback: false,
                                    callback: (policy) => {
                                        Onyx.disconnect(connectionID);

                                        // RequiresTag is enabled and pending
                                        expect(policy?.requiresTag).toBeTruthy();
                                        expect(policy?.pendingFields?.requiresTag).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

                                        resolve();
                                    },
                                });
                            }),
                    )
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    .then(fetch.resume)
                    .then(waitForBatchedUpdates)
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                    waitForCollectionCallback: false,
                                    callback: (policy) => {
                                        Onyx.disconnect(connectionID);
                                        expect(policy?.pendingFields?.requiresTag).toBeFalsy();
                                        resolve();
                                    },
                                });
                            }),
                    )
            );
        });

        it('disable require tag', () => {
            const fakePolicy = createRandomPolicy(0);
            fakePolicy.requiresTag = true;

            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();

            return (
                Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy)
                    .then(() => {
                        Policy.setPolicyRequiresTag(fakePolicy.id, false);
                        return waitForBatchedUpdates();
                    })
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                    waitForCollectionCallback: false,
                                    callback: (policy) => {
                                        Onyx.disconnect(connectionID);

                                        // RequiresTag is disabled and pending
                                        expect(policy?.requiresTag).toBeFalsy();
                                        expect(policy?.pendingFields?.requiresTag).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

                                        resolve();
                                    },
                                });
                            }),
                    )
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    .then(fetch.resume)
                    .then(waitForBatchedUpdates)
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                    waitForCollectionCallback: false,
                                    callback: (policy) => {
                                        Onyx.disconnect(connectionID);
                                        expect(policy?.pendingFields?.requiresTag).toBeFalsy();
                                        resolve();
                                    },
                                });
                            }),
                    )
            );
        });

        it('reset require tag when api returns an error', () => {
            const fakePolicy = createRandomPolicy(0);
            fakePolicy.requiresTag = true;

            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();

            return (
                Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy)
                    .then(() => {
                        // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                        fetch.fail();
                        Policy.setPolicyRequiresTag(fakePolicy.id, false);
                        return waitForBatchedUpdates();
                    })
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    .then(fetch.resume)
                    .then(waitForBatchedUpdates)
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                    waitForCollectionCallback: false,
                                    callback: (policy) => {
                                        Onyx.disconnect(connectionID);
                                        expect(policy?.pendingFields?.requiresTag).toBeFalsy();
                                        expect(policy?.errors).toBeTruthy();
                                        expect(policy?.requiresTag).toBeTruthy();
                                        resolve();
                                    },
                                });
                            }),
                    )
            );
        });
    });

    describe('RenamePolicyTaglist', () => {
        it('rename policy tag list', () => {
            const fakePolicy = createRandomPolicy(0);
            fakePolicy.areTagsEnabled = true;

            const oldTagListName = 'Old tag list name';
            const newTagListName = 'New tag list name';
            const fakePolicyTags = createRandomPolicyTags(oldTagListName);

            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();

            return (
                Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy)
                    .then(() => {
                        Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, fakePolicyTags);
                    })
                    .then(() => {
                        Policy.renamePolicyTaglist(
                            fakePolicy.id,
                            {
                                oldName: oldTagListName,
                                newName: newTagListName,
                            },
                            fakePolicyTags,
                        );
                        return waitForBatchedUpdates();
                    })
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`,
                                    waitForCollectionCallback: false,
                                    callback: (policyTags) => {
                                        Onyx.disconnect(connectionID);

                                        // Tag list name is updated and pending
                                        expect(Object.keys(policyTags?.[oldTagListName] ?? {}).length).toBe(0);
                                        expect(policyTags?.[newTagListName]?.name).toBe(newTagListName);
                                        expect(policyTags?.[newTagListName]?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

                                        resolve();
                                    },
                                });
                            }),
                    )
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    .then(fetch.resume)
                    .then(waitForBatchedUpdates)
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`,
                                    waitForCollectionCallback: false,
                                    callback: (policyTags) => {
                                        Onyx.disconnect(connectionID);

                                        expect(policyTags?.[newTagListName]?.pendingAction).toBeFalsy();
                                        expect(Object.keys(policyTags?.[oldTagListName] ?? {}).length).toBe(0);

                                        resolve();
                                    },
                                });
                            }),
                    )
            );
        });

        it('reset the policy tag list name when api returns error', () => {
            const fakePolicy = createRandomPolicy(0);
            fakePolicy.areTagsEnabled = true;

            const oldTagListName = 'Old tag list name';
            const newTagListName = 'New tag list name';
            const fakePolicyTags = createRandomPolicyTags(oldTagListName);

            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();

            return (
                Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy)
                    .then(() => {
                        Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, fakePolicyTags);
                    })
                    .then(() => {
                        // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                        fetch.fail();

                        Policy.renamePolicyTaglist(
                            fakePolicy.id,
                            {
                                oldName: oldTagListName,
                                newName: newTagListName,
                            },
                            fakePolicyTags,
                        );
                        return waitForBatchedUpdates();
                    })
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    .then(fetch.resume)
                    .then(waitForBatchedUpdates)
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`,
                                    waitForCollectionCallback: false,
                                    callback: (policyTags) => {
                                        Onyx.disconnect(connectionID);

                                        expect(policyTags?.[newTagListName]).toBeFalsy();
                                        expect(policyTags?.[oldTagListName]).toBeTruthy();

                                        resolve();
                                    },
                                });
                            }),
                    )
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

            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();

            return (
                Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy)
                    .then(() => {
                        Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, fakePolicyTags);
                    })
                    .then(() => {
                        Policy.createPolicyTag(fakePolicy.id, newTagName);
                        return waitForBatchedUpdates();
                    })
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`,
                                    waitForCollectionCallback: false,
                                    callback: (policyTags) => {
                                        Onyx.disconnect(connectionID);

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
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    .then(fetch.resume)
                    .then(waitForBatchedUpdates)
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`,
                                    waitForCollectionCallback: false,
                                    callback: (policyTags) => {
                                        Onyx.disconnect(connectionID);

                                        const newTag = policyTags?.[tagListName]?.tags?.[newTagName];
                                        expect(newTag?.errors).toBeFalsy();
                                        expect(newTag?.pendingAction).toBeFalsy();

                                        resolve();
                                    },
                                });
                            }),
                    )
            );
        });

        it('reset new policy tag when api returns error', () => {
            const fakePolicy = createRandomPolicy(0);
            fakePolicy.areTagsEnabled = true;

            const tagListName = 'Fake tag';
            const newTagName = 'new tag';
            const fakePolicyTags = createRandomPolicyTags(tagListName);

            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();

            return (
                Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy)
                    .then(() => {
                        Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, fakePolicyTags);
                    })
                    .then(() => {
                        // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                        fetch.fail();

                        Policy.createPolicyTag(fakePolicy.id, newTagName);
                        return waitForBatchedUpdates();
                    })
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    .then(fetch.resume)
                    .then(waitForBatchedUpdates)
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`,
                                    waitForCollectionCallback: false,
                                    callback: (policyTags) => {
                                        Onyx.disconnect(connectionID);

                                        const newTag = policyTags?.[tagListName]?.tags?.[newTagName];
                                        expect(newTag?.errors).toBeTruthy();

                                        resolve();
                                    },
                                });
                            }),
                    )
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

            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();

            return (
                Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy)
                    .then(() => {
                        Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, fakePolicyTags);
                    })
                    .then(() => {
                        Policy.setWorkspaceTagEnabled(fakePolicy.id, tagsToUpdate);
                        return waitForBatchedUpdates();
                    })
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`,
                                    waitForCollectionCallback: false,
                                    callback: (policyTags) => {
                                        Onyx.disconnect(connectionID);

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
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    .then(fetch.resume)
                    .then(waitForBatchedUpdates)
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`,
                                    waitForCollectionCallback: false,
                                    callback: (policyTags) => {
                                        Onyx.disconnect(connectionID);

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
                    )
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

            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();

            return (
                Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy)
                    .then(() => {
                        Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, fakePolicyTags);
                    })
                    .then(() => {
                        // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                        fetch.fail();

                        Policy.setWorkspaceTagEnabled(fakePolicy.id, tagsToUpdate);
                        return waitForBatchedUpdates();
                    })
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    .then(fetch.resume)
                    .then(waitForBatchedUpdates)
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`,
                                    waitForCollectionCallback: false,
                                    callback: (policyTags) => {
                                        Onyx.disconnect(connectionID);

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
                    )
            );
        });
    });

    describe('RenamePolicyTag', () => {
        it('rename policy tag', () => {
            const fakePolicy = createRandomPolicy(0);
            fakePolicy.areTagsEnabled = true;

            const tagListName = 'Fake tag';
            const fakePolicyTags = createRandomPolicyTags(tagListName, 2);
            const oldTagName = Object.keys(fakePolicyTags?.[tagListName]?.tags)[0];
            const newTagName = 'New tag';

            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();

            return (
                Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy)
                    .then(() => {
                        Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, fakePolicyTags);
                    })
                    .then(() => {
                        Policy.renamePolicyTag(fakePolicy.id, {
                            oldName: oldTagName,
                            newName: newTagName,
                        });
                        return waitForBatchedUpdates();
                    })
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`,
                                    waitForCollectionCallback: false,
                                    callback: (policyTags) => {
                                        Onyx.disconnect(connectionID);

                                        const tags = policyTags?.[tagListName]?.tags;
                                        expect(tags?.[oldTagName]).toBeFalsy();
                                        expect(tags?.[newTagName]?.name).toBe(newTagName);
                                        expect(tags?.[newTagName]?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                                        expect(tags?.[newTagName]?.pendingFields?.name).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

                                        resolve();
                                    },
                                });
                            }),
                    )
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    .then(fetch.resume)
                    .then(waitForBatchedUpdates)
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`,
                                    waitForCollectionCallback: false,
                                    callback: (policyTags) => {
                                        Onyx.disconnect(connectionID);

                                        const tags = policyTags?.[tagListName]?.tags;
                                        expect(tags?.[newTagName]?.pendingAction).toBeFalsy();
                                        expect(tags?.[newTagName]?.pendingFields?.name).toBeFalsy();

                                        resolve();
                                    },
                                });
                            }),
                    )
            );
        });

        it('reset policy tag name when api returns error', () => {
            const fakePolicy = createRandomPolicy(0);
            fakePolicy.areTagsEnabled = true;

            const tagListName = 'Fake tag';
            const fakePolicyTags = createRandomPolicyTags(tagListName, 2);
            const oldTagName = Object.keys(fakePolicyTags?.[tagListName]?.tags)[0];
            const newTagName = 'New tag';

            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();

            return (
                Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy)
                    .then(() => {
                        Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, fakePolicyTags);
                    })
                    .then(() => {
                        // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                        fetch.fail();

                        Policy.renamePolicyTag(fakePolicy.id, {
                            oldName: oldTagName,
                            newName: newTagName,
                        });
                        return waitForBatchedUpdates();
                    })
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    .then(fetch.resume)
                    .then(waitForBatchedUpdates)
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`,
                                    waitForCollectionCallback: false,
                                    callback: (policyTags) => {
                                        Onyx.disconnect(connectionID);

                                        const tags = policyTags?.[tagListName]?.tags;
                                        expect(tags?.[newTagName]).toBeFalsy();
                                        expect(tags?.[oldTagName]?.errors).toBeTruthy();

                                        resolve();
                                    },
                                });
                            }),
                    )
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

            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();

            return (
                Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy)
                    .then(() => {
                        Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, fakePolicyTags);
                    })
                    .then(() => {
                        Policy.deletePolicyTags(fakePolicy.id, tagsToDelete);
                        return waitForBatchedUpdates();
                    })
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`,
                                    waitForCollectionCallback: false,
                                    callback: (policyTags) => {
                                        Onyx.disconnect(connectionID);

                                        tagsToDelete.forEach((tagName) => {
                                            expect(policyTags?.[tagListName]?.tags[tagName]?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
                                        });

                                        resolve();
                                    },
                                });
                            }),
                    )
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    .then(fetch.resume)
                    .then(waitForBatchedUpdates)
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`,
                                    waitForCollectionCallback: false,
                                    callback: (policyTags) => {
                                        Onyx.disconnect(connectionID);

                                        tagsToDelete.forEach((tagName) => {
                                            expect(policyTags?.[tagListName]?.tags[tagName]).toBeFalsy();
                                        });

                                        resolve();
                                    },
                                });
                            }),
                    )
            );
        });

        it('reset the deleted policy tag when api returns error', () => {
            const fakePolicy = createRandomPolicy(0);
            fakePolicy.areTagsEnabled = true;

            const tagListName = 'Fake tag';
            const fakePolicyTags = createRandomPolicyTags(tagListName, 2);
            const tagsToDelete = Object.keys(fakePolicyTags?.[tagListName]?.tags ?? {});

            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();

            return (
                Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy)
                    .then(() => {
                        Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`, fakePolicyTags);
                    })
                    .then(() => {
                        // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                        fetch.fail();

                        Policy.deletePolicyTags(fakePolicy.id, tagsToDelete);
                        return waitForBatchedUpdates();
                    })
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    .then(fetch.resume)
                    .then(waitForBatchedUpdates)
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicy.id}`,
                                    waitForCollectionCallback: false,
                                    callback: (policyTags) => {
                                        Onyx.disconnect(connectionID);

                                        tagsToDelete.forEach((tagName) => {
                                            expect(policyTags?.[tagListName]?.tags[tagName].pendingAction).toBeFalsy();
                                            expect(policyTags?.[tagListName]?.tags[tagName].errors).toBeTruthy();
                                        });

                                        resolve();
                                    },
                                });
                            }),
                    )
            );
        });
    });
});
