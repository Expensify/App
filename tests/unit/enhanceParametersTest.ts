/* eslint-disable @typescript-eslint/naming-convention */
import Onyx from 'react-native-onyx';

import pkg from '../../package.json';
import CONFIG from '../../src/CONFIG';
import enhanceParameters from '../../src/libs/Network/enhanceParameters';
import ONYXKEYS from '../../src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

beforeAll(() => {
    Onyx.init({
        keys: ONYXKEYS,
    });
});

beforeEach(() => Onyx.clear());

test('Enhance parameters adds correct parameters for Log command with no authToken', () => {
    const command = 'Log';
    const parameters = {testParameter: 'test'};
    const email = 'test-user@test.com';
    const authToken = 'test-token';
    Onyx.merge(ONYXKEYS.SESSION, {email, authToken});
    return waitForBatchedUpdates().then(() => {
        const finalParameters = enhanceParameters(command, parameters);
        expect(finalParameters).toEqual({
            testParameter: 'test',
            api_setCookie: false,
            appversion: pkg.version,
            email,
            isFromDevEnv: true,
            platform: 'ios',
            referer: CONFIG.EXPENSIFY.EXPENSIFY_CASH_REFERER,
            clientUpdateID: -1,
        });
    });
});

test('Enhance parameters adds correct parameters for a command that requires authToken', () => {
    const command = 'Report_AddComment';
    const parameters = {testParameter: 'test'};
    const email = 'test-user@test.com';
    const authToken = 'test-token';
    Onyx.merge(ONYXKEYS.SESSION, {email, authToken});
    return waitForBatchedUpdates().then(() => {
        const finalParameters = enhanceParameters(command, parameters);
        expect(finalParameters).toEqual({
            testParameter: 'test',
            api_setCookie: false,
            appversion: pkg.version,
            email,
            isFromDevEnv: true,
            platform: 'ios',
            authToken,
            clientUpdateID: -1,
            referer: CONFIG.EXPENSIFY.EXPENSIFY_CASH_REFERER,
        });
    });
});

test('Enhance parameters keeps the authToken a caller passes instead of the session one', () => {
    // Given a session token, and a caller that sends a different token, as LogOut and the 2FA flows do
    const command = 'Report_AddComment';
    const callerAuthToken = 'eyJhbGciOiJFUzI1NiJ9.eyJzdWIiOiIyIn0.Y2FsbGVy';
    Onyx.merge(ONYXKEYS.SESSION, {email: 'test-user@test.com', authToken: 'eyJhbGciOiJFUzI1NiJ9.eyJzdWIiOiIxIn0.c2Vzc2lvbg'});
    return waitForBatchedUpdates().then(() => {
        // When the parameters are enhanced
        const finalParameters = enhanceParameters(command, {authToken: callerAuthToken});

        // Then the caller's token wins, so HttpUtils builds the Authorization header from the same token the server receives
        expect(finalParameters.authToken).toBe(callerAuthToken);
    });
});
