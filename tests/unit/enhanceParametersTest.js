import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../src/ONYXKEYS';
import enhanceParameters from '../../src/libs/Network/enhanceParameters';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';
import CONFIG from '../../src/CONFIG';

beforeEach(() => Onyx.clear());

test('Enhance parameters adds correct parameters for Log command with no authToken', () => {
    const command = 'Log';
    const parameters = {testParameter: 'test'};
    const email = 'test-user@test.com';
    const authToken = 'test-token';
    Onyx.merge(ONYXKEYS.SESSION, {email, authToken});
    return waitForPromisesToResolve()
        .then(() => {
            const finalParameters = enhanceParameters(command, parameters);
            expect(finalParameters).toEqual({
                testParameter: 'test',
                api_setCookie: false,
                email,
                referer: CONFIG.EXPENSIFY.EXPENSIFY_CASH_REFERER,
            });
        });
});

test('Enhance parameters adds correct parameters for a command that requires authToken', () => {
    const command = 'Report_AddComment';
    const parameters = {testParameter: 'test'};
    const email = 'test-user@test.com';
    const authToken = 'test-token';
    Onyx.merge(ONYXKEYS.SESSION, {email, authToken});
    return waitForPromisesToResolve()
        .then(() => {
            const finalParameters = enhanceParameters(command, parameters);
            expect(finalParameters).toEqual({
                testParameter: 'test',
                api_setCookie: false,
                email,
                authToken,
                referer: CONFIG.EXPENSIFY.EXPENSIFY_CASH_REFERER,
            });
        });
});
