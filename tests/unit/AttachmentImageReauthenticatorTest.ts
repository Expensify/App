import {reconnect} from '@libs/actions/Reconnect';
import activateReauthenticator from '@libs/actions/Session/AttachmentImageReauthenticator';
import {getIsOffline} from '@libs/NetworkState';
import reauthenticate from '@libs/Reauthentication';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

jest.mock('@libs/Log');
jest.mock('@libs/actions/Reconnect', () => ({reconnect: jest.fn()}));
jest.mock('@libs/Reauthentication', () => ({__esModule: true, default: jest.fn(() => Promise.resolve({wasSuccessful: true}))}));
jest.mock('@libs/NetworkState', () => ({getIsOffline: jest.fn(() => false)}));

const TIME_BEFORE_RECONNECT_MS = 3500;
const TIME_BEFORE_REAUTHENTICATION_MS = 10000;

describe('AttachmentImageReauthenticator', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        jest.useFakeTimers();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(getIsOffline).mockReturnValue(false);
    });

    afterEach(() => {
        jest.clearAllTimers();
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    test('reconnects before reauthenticating', async () => {
        // Given a receipt shown with an expired session
        activateReauthenticator({authToken: 'firstToken', encryptedAuthToken: 'firstEncryptedToken'});

        // When the first wait is over
        await jest.advanceTimersByTimeAsync(TIME_BEFORE_RECONNECT_MS);

        // Then the app reconnects, so a session the server still accepts comes back without signing in again
        expect(reconnect).toHaveBeenCalledTimes(1);
        expect(reauthenticate).not.toHaveBeenCalled();
    });

    test('does not reauthenticate when the reconnect brings back a new session', async () => {
        // Given a receipt shown with an expired session that already reconnected
        activateReauthenticator({authToken: 'secondToken', encryptedAuthToken: 'secondEncryptedToken'});
        await jest.advanceTimersByTimeAsync(TIME_BEFORE_RECONNECT_MS);

        // When the reconnect brings back a new session
        const sessionMerge = Onyx.merge(ONYXKEYS.SESSION, {authToken: 'secondTokenRefreshed', encryptedAuthToken: 'secondEncryptedTokenRefreshed'});
        await jest.advanceTimersByTimeAsync(0);
        await sessionMerge;
        await jest.advanceTimersByTimeAsync(TIME_BEFORE_REAUTHENTICATION_MS);

        // Then the app does not sign in again, since the new session already works
        expect(reconnect).toHaveBeenCalledTimes(1);
        expect(reauthenticate).not.toHaveBeenCalled();
    });

    test('does not reauthenticate when the reconnect only brings back a new creation date', async () => {
        // Given a receipt shown with an expired session that already reconnected
        const expiredSession = {authToken: 'fifthToken', encryptedAuthToken: 'fifthEncryptedToken', creationDate: 1};
        const sessionSet = Onyx.set(ONYXKEYS.SESSION, expiredSession);
        await jest.advanceTimersByTimeAsync(0);
        await sessionSet;
        activateReauthenticator(expiredSession);
        await jest.advanceTimersByTimeAsync(TIME_BEFORE_RECONNECT_MS);

        // When the reconnect keeps the same token but starts a new creation date
        const sessionMerge = Onyx.merge(ONYXKEYS.SESSION, {creationDate: 2});
        await jest.advanceTimersByTimeAsync(0);
        await sessionMerge;
        await jest.advanceTimersByTimeAsync(TIME_BEFORE_REAUTHENTICATION_MS);

        // Then the app does not sign in again, since the receipt can load with the refreshed session
        expect(reauthenticate).not.toHaveBeenCalled();
    });

    test('reauthenticates when the session is still the same after the reconnect', async () => {
        // Given a receipt shown with an expired session that already reconnected
        activateReauthenticator({authToken: 'thirdToken', encryptedAuthToken: 'thirdEncryptedToken'});
        await jest.advanceTimersByTimeAsync(TIME_BEFORE_RECONNECT_MS);

        // When no new session comes back before the second wait is over
        await jest.advanceTimersByTimeAsync(TIME_BEFORE_REAUTHENTICATION_MS);

        // Then the app signs in again, so the receipt still loads
        expect(reconnect).toHaveBeenCalledTimes(1);
        expect(reauthenticate).toHaveBeenCalledTimes(1);
    });

    test('does nothing while offline', async () => {
        // Given the app is offline
        jest.mocked(getIsOffline).mockReturnValue(true);

        // When a receipt is shown with an expired session and both waits are over
        activateReauthenticator({authToken: 'fourthToken', encryptedAuthToken: 'fourthEncryptedToken'});
        await jest.advanceTimersByTimeAsync(TIME_BEFORE_RECONNECT_MS + TIME_BEFORE_REAUTHENTICATION_MS);

        // Then nothing is sent, since neither request can reach the server
        expect(reconnect).not.toHaveBeenCalled();
        expect(reauthenticate).not.toHaveBeenCalled();
    });
});
