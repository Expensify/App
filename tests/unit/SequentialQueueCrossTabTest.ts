import {init as initActiveClientManager} from '@libs/ActiveClientManager';
import {WRITE_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import type {AnyRequest} from '../../src/types/onyx/Request';

import * as SequentialQueue from '../../src/libs/Network/SequentialQueue';
import * as RequestModule from '../../src/libs/Request';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/ActiveClientManager', () => jest.requireActual<Record<string, unknown>>('../../src/libs/ActiveClientManager/index.ts'));

beforeAll(() => Onyx.init({keys: ONYXKEYS}));

describe('SequentialQueue - cross-tab writes', () => {
    it('keeps and sends a write the leader queued when a follower tab writes back a stale copy of the queue', async () => {
        // Given the newest tab, which the web leader election makes the leader, with a paused queue holding two requests and a newer approval
        initActiveClientManager();
        await waitForBatchedUpdates();
        const processWithMiddleware = jest.spyOn(RequestModule, 'processWithMiddleware').mockResolvedValue({jsonCode: CONST.JSON_CODE.SUCCESS});
        const readNewestAction: AnyRequest = {command: WRITE_COMMANDS.READ_NEWEST_ACTION, requestIndex: 1};
        const openReport: AnyRequest = {command: WRITE_COMMANDS.OPEN_REPORT, requestIndex: 2};
        const approveMoneyRequest: AnyRequest = {command: WRITE_COMMANDS.APPROVE_MONEY_REQUEST, requestIndex: 3};
        SequentialQueue.pause();
        await SequentialQueue.push(readNewestAction);
        await SequentialQueue.push(openReport);
        await SequentialQueue.push(approveMoneyRequest);
        await waitForBatchedUpdates();

        // When a follower tab's copy of the queue, saved before the approval, lands in shared storage
        await Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, [readNewestAction, openReport]);
        await waitForBatchedUpdates();

        // Then the leader still sends the approval once the queue resumes
        SequentialQueue.unpause();
        await SequentialQueue.waitForIdle();
        await waitForBatchedUpdates();
        expect(processWithMiddleware.mock.calls.map(([sentRequest]) => sentRequest.command)).toEqual([
            WRITE_COMMANDS.READ_NEWEST_ACTION,
            WRITE_COMMANDS.OPEN_REPORT,
            WRITE_COMMANDS.APPROVE_MONEY_REQUEST,
        ]);
    });
});
