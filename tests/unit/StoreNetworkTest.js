import {
    afterAll, beforeEach, jest, test, expect, describe,
} from '@jest/globals';
import Onyx from 'react-native-onyx';
import Log from '../../src/libs/Log';
import * as Network from '../../src/libs/Network';
import {fetchAccountDetails} from '../../src/libs/actions/Session';
import ONYXKEYS from '../../src/ONYXKEYS';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';

jest.useFakeTimers();

Onyx.init({
    keys: ONYXKEYS,
    registerStorageEventListener: () => {},
});

jest.mock('../../src/libs/Log');

beforeEach(() => Onyx.clear().then(waitForPromisesToResolve));

// This unit test was moved to its own file because modifies Network.setIsReady which
// could mess up other unit tests, and also beforeEach can't be used for this scenario.
describe('retry network request', () => {
    const delayOrixConnect = 3000;
    const origSetIsReady = Network.setIsReady;
    const TEST_USER_LOGIN = 'test@testguy.com';

    // We can't mock Onyx functions here because Onyx.connect already registered the callbacks
    // when API.js is loaded, so instead we mock the setIsReady with setTimeout to simulate a
    // delay in the Onyx.connect callback.
    Network.setIsReady = val => setTimeout(() => origSetIsReady(val), delayOrixConnect);

    // We restore setIsReady to its original implementation.
    afterAll(() => {
        jest.runAllTimers();
        Network.setIsReady = origSetIsReady;
    });

    test('if auth and credentials are not read from Onyx yet', () => {
        // Given a test user login and account ID
        fetchAccountDetails(TEST_USER_LOGIN);

        // We should expect Log.hmmm to be called (logging an message to server when a request is made but Network is not ready)
        expect(Log.hmmm).toHaveBeenCalledWith('Trying to make a request when Network is not ready', {command: 'GetAccountStatus', type: 'post'});
    });
});
