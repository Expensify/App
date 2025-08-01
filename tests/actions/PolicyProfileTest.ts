import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import * as Policy from '@src/libs/actions/Policy/Policy';
import * as ReportUtils from '@src/libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import createRandomPolicy from '../utils/collections/policies';
import * as TestHelper from '../utils/TestHelper';
import type {MockAxios} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('axios');

OnyxUpdateManager();
describe('actions/PolicyProfile', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    let mockAxios: MockAxios;
    beforeEach(() => {
        mockAxios = TestHelper.setupGlobalAxiosMock();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('updateWorkspaceDescription', () => {
        it('Update workspace`s description', async () => {
            const fakePolicy = createRandomPolicy(0);
            const oldDescription = fakePolicy.description ?? '';
            const newDescription = 'Updated description';
            const parsedDescription = ReportUtils.getParsedComment(newDescription);
            mockAxios?.pause?.();
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            Policy.updateWorkspaceDescription(fakePolicy.id, newDescription, oldDescription);
            await waitForBatchedUpdates();
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                    waitForCollectionCallback: false,
                    callback: (policy) => {
                        Onyx.disconnect(connection);

                        expect(policy?.description).toBe(parsedDescription);
                        expect(policy?.pendingFields?.description).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                        expect(policy?.errorFields?.description).toBeFalsy();
                        resolve();
                    },
                });
            });
            await mockAxios?.resume?.();
            await waitForBatchedUpdates();
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                    waitForCollectionCallback: false,
                    callback: (policy) => {
                        Onyx.disconnect(connection);
                        expect(policy?.pendingFields?.description).toBeFalsy();

                        resolve();
                    },
                });
            });
        });
    });
});
