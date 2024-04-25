import OnyxUpdateManager from "@libs/actions/OnyxUpdateManager";
import * as Policy from "@libs/actions/Policy";
import CONST from "@src/CONST";
import ONYXKEYS from "@src/ONYXKEYS";
import Onyx from "react-native-onyx";
import createRandomPolicy from "../utils/collections/policies";
import waitForBatchedUpdates from "../utils/waitForBatchedUpdates";
import * as TestHelper from '../utils/TestHelper';


OnyxUpdateManager()
describe('actions/Policy', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });

    })

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

            return Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy)
                .then(() => {
                    Policy.setPolicyRequiresTag(fakePolicy.id, true);
                    return waitForBatchedUpdates();
                })
                .then(() => new Promise<void>((resolve) => {
                        const connectionID = Onyx.connect({
                            key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                            waitForCollectionCallback: false,
                            callback: (policy) => {
                                Onyx.disconnect(connectionID);

                                // RequiresTag is enabled and pending
                                expect(policy?.requiresTag).toBeTruthy();
                                expect(policy?.pendingFields?.requiresTag).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE)

                                resolve();
                            }
                        })
                    }))
                // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                .then(fetch.resume)
                .then(waitForBatchedUpdates)
                .then(() => new Promise<void>((resolve) => {
                        const connectionID = Onyx.connect({
                            key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                            waitForCollectionCallback: false,
                            callback: (policy) => {
                                Onyx.disconnect(connectionID);
                                expect(policy?.pendingFields?.requiresTag).toBeFalsy()
                                resolve();
                            }
                        })
                    }))
        })

        it('disable require tag', () => {
            const fakePolicy = createRandomPolicy(0);
            fakePolicy.requiresTag = true;

            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();

            return Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy)
                .then(() => {
                    Policy.setPolicyRequiresTag(fakePolicy.id, false);
                    return waitForBatchedUpdates();
                })
                .then(() => new Promise<void>((resolve) => {
                        const connectionID = Onyx.connect({
                            key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                            waitForCollectionCallback: false,
                            callback: (policy) => {
                                Onyx.disconnect(connectionID);

                                // RequiresTag is enabled and pending
                                expect(policy?.requiresTag).toBeFalsy();
                                expect(policy?.pendingFields?.requiresTag).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE)

                                resolve();
                            }
                        })
                    }))
                // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                .then(fetch.resume)
                .then(waitForBatchedUpdates)
                .then(() => new Promise<void>((resolve) => {
                        const connectionID = Onyx.connect({
                            key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                            waitForCollectionCallback: false,
                            callback: (policy) => {
                                Onyx.disconnect(connectionID);
                                expect(policy?.pendingFields?.requiresTag).toBeFalsy()
                                resolve();
                            }
                        })
                    }))
        })
    })

    describe('RenamePolicyTaglist', () => {
        
    })
})