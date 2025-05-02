/* eslint-disable @typescript-eslint/naming-convention */
import Onyx from 'react-native-onyx';
import pkg from '../../package.json';
import CONFIG from '../../src/CONFIG';
import enhanceParameters from '../../src/libs/Network/enhanceParameters';
import ONYXKEYS from '../../src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

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
