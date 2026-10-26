import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';
import sanitizeLogParams from '@libs/sanitizeLogParams';

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

test('completion lookup strips ordinary authentication and redacts its capability', async () => {
    // Given a signed-in user and a caller that accidentally supplies a token
    await Onyx.set(ONYXKEYS.SESSION, {email: 'admin@example.com', authToken: 'ordinary-token'});
    await waitForBatchedUpdates();
    const completionHandle = 'ab'.repeat(32);

    // When completion is queried while ordinary credentials still exist
    const parameters = enhanceParameters(SIDE_EFFECT_REQUEST_COMMANDS.GET_DOMAIN_SESSION_REVOCATION_STATUS, {completionHandle, authToken: 'explicit-token'});

    // Then only the capability is sent, it cannot trigger reauth, and it is never logged
    expect(parameters).not.toHaveProperty('authToken');
    expect(parameters).not.toHaveProperty('email');
    expect(parameters).toMatchObject({completionHandle, skipReauthentication: true, shouldRetry: false});
    expect(sanitizeLogParams(parameters).completionHandle).toBe('<redacted>');
    expect(enhanceParameters(SIDE_EFFECT_REQUEST_COMMANDS.REVOKE_ALL_DOMAIN_MEMBER_SESSIONS, {}).authToken).toBe('ordinary-token');
});

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
