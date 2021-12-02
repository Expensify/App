import _ from 'underscore';
import * as Network from '../../src/libs/Network';
import * as Session from '../../src/libs/actions/Session';
import * as Pusher from '../../src/libs/Pusher/pusher';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';

Network.setIsReady(true);

jest.mock('../../src/libs/API', () => ({
    __esModule: true,
    reauthenticate: jest.fn()
        .mockResolvedValue({jsonCode: 200}),
}));

jest.mock('../../src/libs/Pusher/pusher', () => ({
    __esModule: true,
    reconnect: jest.fn(),
}));

test('Multiple reauthenticatePusher calls should result in a single reconnect call', () => {
    // Given multiple reauthenticate calls happening at the same time
    _.each(_.range(5), () => Session.reauthenticatePusher());

    // Then a single reconnect call should be made
    return waitForPromisesToResolve()
        .then(() => {
            expect(Pusher.reconnect).toHaveBeenCalledTimes(1);
        });
});
