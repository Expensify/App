import Log from '@libs/Log';
import {getLastAuthTokenDrop, setAuthToken} from '@libs/Network/NetworkStore';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const DROP_MESSAGE = '[NetworkStore] authToken dropped';

describe('NetworkStore authToken drop logging', () => {
    let logWarnSpy: jest.SpyInstance<void, Parameters<typeof Log.warn>>;

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await Onyx.merge(ONYXKEYS.SESSION, {email: 'test@test.com', accountID: 1, authToken: 'token'});
        await waitForBatchedUpdates();
        logWarnSpy = jest.spyOn(Log, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        logWarnSpy.mockRestore();
    });

    it('should log the caller stack when setAuthToken empties a live token', () => {
        // Given a signed-in session holding a token

        // When a caller empties the token directly
        setAuthToken(null);

        // Then the drop is logged with the stack, since the synchronous caller is the writer we want to name
        const lastDrop = getLastAuthTokenDrop();
        expect(lastDrop?.source).toBe('setAuthToken');
        expect(lastDrop?.stack).toContain('Error');
        expect(logWarnSpy).toHaveBeenCalledWith(DROP_MESSAGE, {source: 'setAuthToken', stack: lastDrop?.stack});
    });

    it('should not log when setAuthToken replaces the token with the deliberate invalid token', () => {
        // Given a signed-in session holding a token

        // When the token is swapped for a non-empty value, as Session does on purpose to force reauthentication
        setAuthToken('pizza');

        // Then nothing is logged, because the token was not emptied
        expect(logWarnSpy).not.toHaveBeenCalledWith(DROP_MESSAGE, expect.anything());
    });

    it('should log what survived when a session update empties the token', async () => {
        // Given a signed-in session holding a token

        // When an Onyx session update clears only the token
        await Onyx.merge(ONYXKEYS.SESSION, {authToken: null});
        await waitForBatchedUpdates();

        // Then the drop is logged along with the session fields that are still there
        expect(logWarnSpy).toHaveBeenCalledWith(DROP_MESSAGE, {source: 'session', hasEmail: true, accountID: 1});
        expect(getLastAuthTokenDrop()?.source).toBe('session');
    });
});
