import Pusher from '@libs/Pusher';
import initializePusher from '@userActions/initializePusher';
import {subscribeToUserEvents} from '@userActions/User';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';

jest.mock('@libs/Pusher', () => ({
    __esModule: true,
    default: {
        init: jest.fn(() => Promise.resolve()),
    },
}));

jest.mock('@userActions/User', () => ({
    __esModule: true,
    subscribeToUserEvents: jest.fn(),
}));

describe('actions/initializePusher', () => {
    const mockedPusherInit = jest.mocked(Pusher.init);
    const mockedSubscribeToUserEvents = jest.mocked(subscribeToUserEvents);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('initializes Pusher and subscribes to the current user events', async () => {
        // Verifies the shared helper initializes Pusher with the expected config and forwards the caller context.
        const getReportAttributes = jest.fn();

        await initializePusher(123, 'test@test.com', getReportAttributes);

        expect(mockedPusherInit).toHaveBeenCalledWith({
            appKey: CONFIG.PUSHER.APP_KEY,
            cluster: CONFIG.PUSHER.CLUSTER,
            authEndpoint: `${CONFIG.EXPENSIFY.DEFAULT_API_ROOT}api/AuthenticatePusher?`,
        });
        expect(mockedSubscribeToUserEvents).toHaveBeenCalledWith(123, 'test@test.com', getReportAttributes);
    });

    it('falls back to default account and email values when parameters are not provided', async () => {
        // Verifies the helper still subscribes safely when no user context is passed in.
        await initializePusher();

        expect(mockedPusherInit).toHaveBeenCalledWith({
            appKey: CONFIG.PUSHER.APP_KEY,
            cluster: CONFIG.PUSHER.CLUSTER,
            authEndpoint: `${CONFIG.EXPENSIFY.DEFAULT_API_ROOT}api/AuthenticatePusher?`,
        });
        expect(mockedSubscribeToUserEvents).toHaveBeenCalledWith(CONST.DEFAULT_NUMBER_ID, '', undefined);
    });
});
