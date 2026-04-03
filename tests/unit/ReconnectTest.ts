import Onyx from 'react-native-onyx';
import {openApp, reconnectApp} from '@libs/actions/App';
import {reconnect} from '@libs/actions/Reconnect';
import {flush} from '@libs/Network/SequentialQueue';
import {getIsOffline, setHasRadio, setSustainedFailures} from '@libs/NetworkState';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/Log');
jest.mock('@libs/Network/SequentialQueue', () => ({flush: jest.fn()}));
jest.mock('@libs/actions/App', () => ({openApp: jest.fn(), reconnectApp: jest.fn(), confirmReadyToOpenApp: jest.fn()}));

describe('Reconnect', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        jest.clearAllMocks();
        setHasRadio(true);
        setSustainedFailures(false);
    });

    test('calls openApp when isLoadingApp is true', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: 1234, email: 'test@test.com'});
        await Onyx.merge(ONYXKEYS.RAM_ONLY_IS_LOADING_APP, true);
        await waitForBatchedUpdates();

        reconnect();

        expect(jest.mocked(openApp)).toHaveBeenCalledTimes(1);
        expect(jest.mocked(reconnectApp)).not.toHaveBeenCalled();
    });

    test('calls reconnectApp when isLoadingApp is false', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: 1234, email: 'test@test.com'});
        await Onyx.merge(ONYXKEYS.RAM_ONLY_IS_LOADING_APP, false);
        await waitForBatchedUpdates();

        reconnect();

        expect(jest.mocked(reconnectApp)).toHaveBeenCalledTimes(1);
        expect(jest.mocked(openApp)).not.toHaveBeenCalled();
    });

    test('passes lastUpdateIDAppliedToClient to reconnectApp', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: 1234, email: 'test@test.com'});
        await Onyx.merge(ONYXKEYS.RAM_ONLY_IS_LOADING_APP, false);
        await Onyx.merge(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 42);
        await waitForBatchedUpdates();

        reconnect();

        expect(jest.mocked(reconnectApp)).toHaveBeenCalledWith(42);
    });

    test('is a no-op when there is no active session', async () => {
        await waitForBatchedUpdates();

        reconnect();

        expect(jest.mocked(openApp)).not.toHaveBeenCalled();
        expect(jest.mocked(reconnectApp)).not.toHaveBeenCalled();
    });

    test('offline→online transition flushes the sequential queue', () => {
        setHasRadio(false);
        expect(getIsOffline()).toBe(true);

        jest.mocked(flush).mockClear();

        setHasRadio(true);
        expect(getIsOffline()).toBe(false);

        expect(jest.mocked(flush)).toHaveBeenCalledTimes(1);
    });
});
