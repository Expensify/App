import Reauthentication, {resetReauthentication} from '@libs/Middleware/Reauthentication';
import SaveResponseInOnyx from '@libs/Middleware/SaveResponseInOnyx';
import reauthenticate from '@libs/Reauthentication';
import {endSpanWithAttributes, startSpan} from '@libs/telemetry/activeSpans';
import trackStartupDataRender from '@libs/telemetry/trackStartupDataRender';

import CONST from '@src/CONST';
import {flushQueue, queueOnyxUpdates} from '@src/libs/actions/QueuedOnyxUpdates';
import {READ_COMMANDS, WRITE_COMMANDS} from '@src/libs/API/types';
import HttpUtils from '@src/libs/HttpUtils';
import * as MainQueue from '@src/libs/Network/MainQueue';
import * as NetworkStore from '@src/libs/Network/NetworkStore';
import * as SequentialQueue from '@src/libs/Network/SequentialQueue';
import {setHasRadio} from '@src/libs/NetworkState';
import * as Request from '@src/libs/Request';
import ONYXKEYS from '@src/ONYXKEYS';
import type OnyxRequest from '@src/types/onyx/Request';

import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForNetworkPromises from '../utils/waitForNetworkPromises';

jest.mock('@libs/Reauthentication');
jest.mock('@libs/telemetry/activeSpans');
jest.mock('@libs/telemetry/trackStartupDataRender');

const mockStartSpan = jest.mocked(startSpan);
const mockEndSpanWithAttributes = jest.mocked(endSpanWithAttributes);
const mockTrackStartupDataRender = jest.mocked(trackStartupDataRender);

const APPLY = CONST.TELEMETRY.SPAN_STARTUP_DATA.APPLY;

let mockFetch: ReturnType<typeof TestHelper.getGlobalFetchMock>;

function startedSpanIdsFor(prefix: string) {
    return mockStartSpan.mock.calls.map(([spanId]) => spanId).filter((spanId) => spanId.startsWith(prefix));
}

Onyx.init({keys: ONYXKEYS});

beforeEach(() => {
    Request.clearMiddlewares();
    SequentialQueue.resetQueue();
    MainQueue.clear();
    HttpUtils.cancelPendingRequests();
    NetworkStore.checkRequiredData();
    resetReauthentication();
    setHasRadio(true);
    jest.clearAllMocks();
    mockFetch = TestHelper.getGlobalFetchMock();
    global.fetch = mockFetch;

    return Onyx.clear()
        .then(() => waitForBatchedUpdates())
        .then(() => waitForNetworkPromises());
});

describe('StartupData.Apply / StartupData.Render placement', () => {
    it('waits for the queued OpenApp updates to reach Onyx before ending the apply phase', () => {
        // OpenApp is a WRITE, so SaveResponseInOnyx stages its onyxData through queueOnyxUpdates and
        // SequentialQueue applies it only after processWithMiddleware has resolved.
        mockFetch.mockAPICommand(WRITE_COMMANDS.OPEN_APP, () => ({
            jsonCode: 200,
            lastUpdateID: 1,
            previousUpdateID: 0,
            onyxData: [{onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.HAS_LOADED_APP, value: true}],
        }));
        Request.addMiddleware(SaveResponseInOnyx);

        let hasLoadedApp: boolean | undefined;
        Onyx.connect({
            key: ONYXKEYS.HAS_LOADED_APP,
            callback: (value) => {
                hasLoadedApp = value;
            },
        });

        let hasLoadedAppWhenApplyEnded: boolean | undefined;
        let hasLoadedAppWhenRenderTrackingStarted: boolean | undefined;
        mockEndSpanWithAttributes.mockImplementation((spanId) => {
            if (!spanId.startsWith(APPLY)) {
                return;
            }
            hasLoadedAppWhenApplyEnded = hasLoadedApp;
        });
        mockTrackStartupDataRender.mockImplementation(() => {
            hasLoadedAppWhenRenderTrackingStarted = hasLoadedApp;
        });

        const request: OnyxRequest<typeof ONYXKEYS.HAS_LOADED_APP> = {
            command: WRITE_COMMANDS.OPEN_APP,
            data: {authToken: 'testToken', apiRequestType: CONST.API_REQUEST_TYPE.WRITE},
        };

        return (
            Request.processWithMiddleware(request, true)
                // SequentialQueue flushes the staged updates once the request promise has settled.
                .then(() => flushQueue())
                .then(() => waitForBatchedUpdates())
                .then(() => {
                    expect(hasLoadedApp).toBe(true);
                    expect(hasLoadedAppWhenApplyEnded).toBe(true);
                    expect(hasLoadedAppWhenRenderTrackingStarted).toBe(true);
                })
        );
    });

    it('records a single apply and render phase when a 407 forces reauthentication', () => {
        // handleExpiredSession retries by calling processWithMiddleware again from inside the still-pending
        // original call, so one login must not produce one pair of spans per attempt.
        jest.mocked(reauthenticate).mockResolvedValue(true);
        let openAppCalls = 0;
        mockFetch.mockAPICommand(WRITE_COMMANDS.OPEN_APP, () => {
            openAppCalls += 1;
            return openAppCalls === 1 ? {jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED} : {jsonCode: 200};
        });
        Request.addMiddleware(Reauthentication);

        const request: OnyxRequest<typeof ONYXKEYS.HAS_LOADED_APP> = {
            command: WRITE_COMMANDS.OPEN_APP,
            data: {authToken: 'testToken', apiRequestType: CONST.API_REQUEST_TYPE.WRITE, shouldRetry: true},
        };

        return Request.processWithMiddleware(request, true)
            .then(() => waitForBatchedUpdates())
            .then(() => {
                expect(jest.mocked(reauthenticate)).toHaveBeenCalledTimes(1);
                expect(startedSpanIdsFor(APPLY)).toHaveLength(1);
                expect(mockTrackStartupDataRender).toHaveBeenCalledTimes(1);
            });
    });

    it('ends the Search apply phase without waiting on an unrelated write flush', () => {
        // A Search READ applies its snapshot inline, so it must not inherit the pending flush of whatever write is in flight.
        mockFetch.mockAPICommand(READ_COMMANDS.SEARCH, () => ({jsonCode: 200}));
        queueOnyxUpdates([{onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.HAS_LOADED_APP, value: true}]);

        const request: OnyxRequest<typeof ONYXKEYS.HAS_LOADED_APP> = {
            command: READ_COMMANDS.SEARCH,
            data: {authToken: 'testToken', apiRequestType: CONST.API_REQUEST_TYPE.MAKE_REQUEST_WITH_SIDE_EFFECTS},
        };

        return Request.processWithMiddleware(request)
            .then(() => waitForBatchedUpdates())
            .then(() => {
                const endedSpanIds = mockEndSpanWithAttributes.mock.calls.map(([spanId]) => spanId);
                expect(endedSpanIds.some((spanId) => spanId.startsWith(CONST.TELEMETRY.SPAN_SEARCH_DATA.APPLY))).toBe(true);
            })
            .finally(() => flushQueue());
    });
});
