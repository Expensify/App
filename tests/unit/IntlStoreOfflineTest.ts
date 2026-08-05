import {LOCALES} from '@src/CONST/LOCALES';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

let mockIsOffline = false;
let mockShouldChunkFail = false;
const mockReachabilityListeners = new Set<() => void>();

jest.mock('@libs/NetworkState', () => ({
    getIsOffline: () => mockIsOffline,
    onReachabilityConfirmed: (callback: () => void) => {
        mockReachabilityListeners.add(callback);
        return () => mockReachabilityListeners.delete(callback);
    },
}));

// Throwing from the module factory makes the dynamic import inside IntlStore's loader reject
// the same way a ChunkLoadError does in the browser.
jest.mock('@src/languages/de', () => {
    if (mockShouldChunkFail) {
        mockShouldChunkFail = false;
        throw new Error('ChunkLoadError: Loading chunk languages_de failed');
    }
    return {__esModule: true, default: {common: {cancel: 'Abbrechen'}}};
});

function confirmReachability() {
    for (const callback of [...mockReachabilityListeners]) {
        callback();
    }
}

describe('IntlStore.load offline recovery', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        mockReachabilityListeners.clear();
        mockIsOffline = false;
        mockShouldChunkFail = false;
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('retries on reachability and keeps translations loading until the chunk arrives', async () => {
        mockIsOffline = true;
        mockShouldChunkFail = true;

        const onRejected = jest.fn();
        const promise = IntlStore.load(LOCALES.DE).catch(onRejected);
        await waitForBatchedUpdates();

        expect(onRejected).not.toHaveBeenCalled();
        expect(IntlStore.getCurrentLocale()).not.toBe(LOCALES.DE);
        expect(IntlStore.get('common.cancel', LOCALES.DE)).toBeNull();
        await expect(getOnyxValue(ONYXKEYS.RAM_ONLY_ARE_TRANSLATIONS_LOADING)).resolves.toBe(true);
        expect(mockReachabilityListeners.size).toBe(1);

        mockIsOffline = false;
        confirmReachability();
        await promise;
        await waitForBatchedUpdates();

        expect(onRejected).not.toHaveBeenCalled();
        expect(IntlStore.getCurrentLocale()).toBe(LOCALES.DE);
        expect(IntlStore.get('common.cancel', LOCALES.DE)).toBe('Abbrechen');
        expect(mockReachabilityListeners.size).toBe(0);
        await expect(getOnyxValue(ONYXKEYS.RAM_ONLY_ARE_TRANSLATIONS_LOADING)).resolves.toBe(false);
    });
});
