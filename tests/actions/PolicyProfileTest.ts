import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import * as Policy from '@src/libs/actions/Policy';
import * as ReportUtils from '@src/libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import createRandomPolicy from '../utils/collections/policies';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

OnyxUpdateManager();
describe('actions/PolicyProfile', () => {
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

    describe('updateWorkspaceDescription', () => {
        it('Update workspace`s description', () => {
            const fakePolicy = createRandomPolicy(0);

            const oldDescription = fakePolicy.description ?? '';
            const newDescription = 'Updated description';
            const parsedDescription = ReportUtils.getParsedComment(newDescription);
            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();
            return (
                Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy)
                    .then(() => {
                        Policy.updateWorkspaceDescription(fakePolicy.id, newDescription, oldDescription);
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

                                        expect(policy?.description).toBe(parsedDescription);
                                        expect(policy?.pendingFields?.description).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                                        expect(policy?.errorFields?.description).toBeFalsy();
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
                                        expect(policy?.pendingFields?.description).toBeFalsy();

                                        resolve();
                                    },
                                });
                            }),
                    )
            );
        });
    });
});
