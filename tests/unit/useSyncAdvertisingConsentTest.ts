import {act, renderHook} from '@testing-library/react-native';

import useSyncAdvertisingConsent from '@hooks/useSyncAdvertisingConsent';

import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import type {TargetedAdvertisingConsent, TargetedAdvertisingConsentCallback} from '@libs/Ketch/types';
import {isRecord} from '@libs/ObjectUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Session} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

let mockConsent: TargetedAdvertisingConsent | undefined;
const mockCallbacks = new Set<TargetedAdvertisingConsentCallback>();

jest.mock('@libs/Ketch', () => ({
    getTargetedAdvertisingConsent: () => mockConsent,
    subscribeToTargetedAdvertisingConsent: (callback: TargetedAdvertisingConsentCallback) => {
        mockCallbacks.add(callback);
        return () => mockCallbacks.delete(callback);
    },
}));

function changeConsent(consent: TargetedAdvertisingConsent) {
    mockConsent = consent;
    act(() => {
        for (const callback of mockCallbacks) {
            callback(consent);
        }
    });
}

const {GRANTED, DENIED} = CONST.TARGETED_ADVERTISING_CONSENT;

describe('useSyncAdvertisingConsent', () => {
    let writeSpy: jest.SpyInstance;

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockConsent = undefined;
        mockCallbacks.clear();
        // Apply the optimistic data like the real API.write so the last sent consent is saved
        writeSpy = jest.spyOn(API, 'write').mockImplementation((_command, _params, onyxData) => {
            Onyx.update(onyxData?.optimisticData ?? []);
            return Promise.resolve();
        });
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(() => {
        writeSpy.mockRestore();
    });

    function signIn(authTokenType?: Session['authTokenType']) {
        return Onyx.set(ONYXKEYS.SESSION, {authToken: 'token', accountID: 1, email: 'user@expensify.com', authTokenType});
    }

    function sentConsents() {
        return writeSpy.mock.calls
            .filter(([command]) => command === WRITE_COMMANDS.UPDATE_ADVERTISING_CONSENT)
            .map(([, params]: unknown[]) => (isRecord(params) ? params.targetedAdvertisingConsent : undefined));
    }

    it('sends the consent once after sign in, then only when it changes', async () => {
        // Given Ketch already resolved the consent before the user signed in
        mockConsent = GRANTED;
        renderHook(() => useSyncAdvertisingConsent());
        await waitForBatchedUpdatesWithAct();
        expect(sentConsents()).toEqual([]);

        // When the user signs in, the consent is sent once
        await signIn();
        await waitForBatchedUpdatesWithAct();
        expect(sentConsents()).toEqual([GRANTED]);

        // And when Ketch reports the same consent again, nothing is sent
        changeConsent(GRANTED);
        await waitForBatchedUpdatesWithAct();
        expect(sentConsents()).toEqual([GRANTED]);

        // And when the user changes it in the banner, the new value is sent
        changeConsent(DENIED);
        await waitForBatchedUpdatesWithAct();
        expect(sentConsents()).toEqual([GRANTED, DENIED]);
        expect(await getOnyxValue(ONYXKEYS.LAST_SENT_TARGETED_ADVERTISING_CONSENT)).toBe(DENIED);
    });

    it('does not send the consent again after sign in when it matches the last value sent', async () => {
        await Onyx.set(ONYXKEYS.LAST_SENT_TARGETED_ADVERTISING_CONSENT, DENIED);
        mockConsent = DENIED;
        await signIn();
        renderHook(() => useSyncAdvertisingConsent());
        await waitForBatchedUpdatesWithAct();

        expect(sentConsents()).toEqual([]);
    });

    it('does not send anything while the consent is unknown', async () => {
        await signIn();
        renderHook(() => useSyncAdvertisingConsent());
        await waitForBatchedUpdatesWithAct();

        expect(sentConsents()).toEqual([]);
    });

    it.each([CONST.AUTH_TOKEN_TYPES.ANONYMOUS, CONST.AUTH_TOKEN_TYPES.SUPPORT, CONST.AUTH_TOKEN_TYPES.DELEGATE])('does not send the consent for %s sessions', async (authTokenType) => {
        mockConsent = GRANTED;
        await signIn(authTokenType);
        renderHook(() => useSyncAdvertisingConsent());
        await waitForBatchedUpdatesWithAct();

        expect(sentConsents()).toEqual([]);
    });
});
