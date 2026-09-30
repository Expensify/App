/* eslint-disable @typescript-eslint/naming-convention */
import Onyx from 'react-native-onyx';

import pkg from '../../package.json';
import CONFIG from '../../src/CONFIG';
import Log from '../../src/libs/Log';
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

describe('enhanceParameters missing authToken logging', () => {
    let logInfoSpy: jest.SpyInstance<void, Parameters<typeof Log.info>>;

    beforeEach(() => {
        logInfoSpy = jest.spyOn(Log, 'info').mockImplementation(() => {});
    });

    afterEach(() => {
        logInfoSpy.mockRestore();
    });

    it('should log the command and an empty token state when a session exists without a token', async () => {
        // Given a hydrated session that has an email but no token
        await Onyx.merge(ONYXKEYS.SESSION, {email: 'test-user@test.com', authToken: null});
        await waitForBatchedUpdates();

        // When a command that needs a token is enhanced
        const finalParameters = enhanceParameters('RequestMoney', {});

        // Then the request still goes out without a token, and the log tells hydrated-empty apart from not yet hydrated
        expect(finalParameters.authToken).toBeNull();
        expect(logInfoSpy).toHaveBeenCalledWith('[enhanceParameters] Sending request without authToken', false, expect.objectContaining({command: 'RequestMoney', authTokenState: 'empty'}));
    });

    it('should not log for the Log command so logging cannot recurse through the log flush', async () => {
        // Given a hydrated session with no token
        await Onyx.merge(ONYXKEYS.SESSION, {email: 'test-user@test.com', authToken: null});
        await waitForBatchedUpdates();

        // When the Log command itself is enhanced
        enhanceParameters('Log', {});

        // Then nothing is logged, because Log does not need a token
        expect(logInfoSpy).not.toHaveBeenCalledWith('[enhanceParameters] Sending request without authToken', expect.anything(), expect.anything());
    });
});
