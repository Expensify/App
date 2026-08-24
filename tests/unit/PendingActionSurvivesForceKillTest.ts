import {getAll as getAllPersistedRequests} from '@libs/actions/PersistedRequests';
import type * as PersistedRequestsModule from '@libs/actions/PersistedRequests';
import type * as QueuedOnyxUpdatesModule from '@libs/actions/QueuedOnyxUpdates';
import {isClientTheLeader} from '@libs/ActiveClientManager';
import {push as pushToSequentialQueue} from '@libs/Network/SequentialQueue';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, ReportActions} from '@src/types/onyx';
import type Request from '@src/types/onyx/Request';

import Onyx from 'react-native-onyx';

import '@libs/API/makeRequest';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/ActiveClientManager', () => ({
    isClientTheLeader: jest.fn(() => true),
    isReady: jest.fn(() => Promise.resolve()),
    init: jest.fn(),
}));

const mockOnRemoval: {callback?: () => void} = {};
jest.mock('@libs/actions/PersistedRequests', () => {
    const actual = jest.requireActual<typeof PersistedRequestsModule>('@libs/actions/PersistedRequests');
    return {
        ...actual,
        endRequestAndRemoveFromQueue: (...args: Parameters<typeof actual.endRequestAndRemoveFromQueue>) => {
            mockOnRemoval.callback?.();
            return actual.endRequestAndRemoveFromQueue(...args);
        },
    };
});

const mockDrainFlush = {isDisabled: false};
jest.mock('@libs/actions/QueuedOnyxUpdates', () => {
    const actual = jest.requireActual<typeof QueuedOnyxUpdatesModule>('@libs/actions/QueuedOnyxUpdates');
    return {
        ...actual,
        flushQueue: () => (mockDrainFlush.isDisabled ? Promise.resolve() : actual.flushQueue()),
    };
});

const REPORT_ID = '1';
const REPORT_ACTION_ID = '9999';
const REPORT_ACTIONS_KEY = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}` as const;

const optimisticAction = {
    [REPORT_ACTION_ID]: {
        reportActionID: REPORT_ACTION_ID,
        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        created: '2026-08-24 12:00:00.000',
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        isOptimisticAction: true,
    },
} as ReportActions;

const addCommentRequest: Request<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS> = {
    command: 'AddComment',
    data: {
        apiRequestType: CONST.API_REQUEST_TYPE.WRITE,
        reportActionID: REPORT_ACTION_ID,
        reportID: REPORT_ID,
    },
    successData: [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: REPORT_ACTIONS_KEY,
            value: {[REPORT_ACTION_ID]: {pendingAction: null, isOptimisticAction: null}},
        },
    ],
};

let liveReportAction: ReportAction | undefined;

beforeAll(() => {
    Onyx.init({keys: ONYXKEYS});
    Onyx.connectWithoutView({
        key: REPORT_ACTIONS_KEY,
        callback: (value) => {
            liveReportAction = value?.[REPORT_ACTION_ID];
        },
    });
});

beforeEach(async () => {
    jest.mocked(isClientTheLeader).mockReturnValue(true);
    mockOnRemoval.callback = undefined;
    mockDrainFlush.isDisabled = false;
    global.fetch = TestHelper.createGlobalFetchMock();
    await Onyx.clear();
    await waitForBatchedUpdates();
});

describe('a force kill between the response and the queue drain', () => {
    it('cannot strand pendingAction, because successData is committed before the request leaves disk', async () => {
        // Given an optimistic comment on disk with pendingAction ADD, and its AddComment request persisted
        await Onyx.merge(REPORT_ACTIONS_KEY, optimisticAction);
        await waitForBatchedUpdates();
        expect(liveReportAction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

        let pendingActionAtRemoval: unknown = 'request-never-removed';
        mockOnRemoval.callback = () => {
            pendingActionAtRemoval = liveReportAction?.pendingAction;
        };

        // When the request is sent and the server answers 200
        await pushToSequentialQueue(addCommentRequest);
        await waitForBatchedUpdates();
        await waitForBatchedUpdates();

        expect(getAllPersistedRequests()).toHaveLength(0);

        // Then the clear was already committed at the instant the request left disk
        expect(pendingActionAtRemoval).toBeUndefined();
    });

    it('leaves no pendingAction behind when the drain flush never runs', async () => {
        // Given an optimistic comment on disk with pendingAction ADD, and its AddComment request persisted
        await Onyx.merge(REPORT_ACTIONS_KEY, optimisticAction);
        await waitForBatchedUpdates();
        expect(liveReportAction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

        // When the response is processed but the deferred buffer is never flushed, as after a force kill
        mockDrainFlush.isDisabled = true;
        await pushToSequentialQueue(addCommentRequest);
        await waitForBatchedUpdates();
        await waitForBatchedUpdates();

        expect(getAllPersistedRequests()).toHaveLength(0);

        // Then the flag is already gone
        expect(liveReportAction?.pendingAction).toBeUndefined();
        expect(liveReportAction?.isOptimisticAction).toBeUndefined();

        expect(liveReportAction?.reportActionID).toBe(REPORT_ACTION_ID);
    });
});
