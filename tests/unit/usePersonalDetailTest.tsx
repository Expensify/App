import {act, renderHook} from '@testing-library/react-native';

import {usePersonalDetail, usePersonalDetailsByIDs} from '@hooks/usePersonalDetails';

import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, PersonalDetailsList} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const ALICE = {accountID: 1, displayName: 'Alice', login: 'alice@test.com'};
const BOB = {accountID: 2, displayName: 'Bob', login: 'bob@test.com'};

const loginSelector = (personalDetail: PersonalDetails | undefined) => personalDetail?.login;
const loginsSelector = (personalDetails: PersonalDetailsList) => Object.values(personalDetails).map((personalDetail) => personalDetail?.login);

async function mergePersonalDetails(personalDetails: Record<number, Partial<PersonalDetails>>) {
    await act(async () => {
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
    });
    await waitForBatchedUpdates();
}

describe('usePersonalDetail', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {[ALICE.accountID]: ALICE, [BOB.accountID]: BOB});
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdates();
    });

    it('returns the whole record of the given account', () => {
        // Given the personal details list contains Alice and Bob

        // When reading Alice's personal details without a selector
        const {result} = renderHook(() => usePersonalDetail(ALICE.accountID));

        // Then only Alice's record is returned
        expect(result.current[0]).toEqual(ALICE);
    });

    it('returns undefined when the account ID is undefined', () => {
        // Given the personal details list is loaded

        // When reading personal details for an undefined account ID, e.g. while the owner is still unknown
        const {result} = renderHook(() => usePersonalDetail(undefined, loginSelector));

        // Then nothing is returned, so callers fall back instead of reading another account's data
        expect(result.current[0]).toBeUndefined();
    });

    it('returns the selected part of the record when a selector is passed', () => {
        // Given the personal details list contains Alice and Bob

        // When reading only Alice's login
        const {result} = renderHook(() => usePersonalDetail(ALICE.accountID, loginSelector));

        // Then the selector receives Alice's record, not the whole list
        expect(result.current[0]).toBe(ALICE.login);
    });

    it('updates when the selected field changes', async () => {
        // Given a component reading Alice's login
        const {result} = renderHook(() => usePersonalDetail(ALICE.accountID, loginSelector));

        // When Alice's login changes
        await mergePersonalDetails({[ALICE.accountID]: {login: 'alice.new@test.com'}});

        // Then the new login is returned
        expect(result.current[0]).toBe('alice.new@test.com');
    });

    it('does not re-render when a field outside the selector changes', async () => {
        // Given a component reading only Alice's login
        let renderCount = 0;
        renderHook(() => {
            renderCount++;
            return usePersonalDetail(ALICE.accountID, loginSelector);
        });
        const initialRenderCount = renderCount;

        // When Alice's display name and Bob's login change
        await mergePersonalDetails({[ALICE.accountID]: {displayName: 'Alice Renamed'}, [BOB.accountID]: {login: 'bob.new@test.com'}});

        // Then the component doesn't re-render, because the login it selected is unchanged
        expect(renderCount).toBe(initialRenderCount);
    });

    it('does not re-render when another account changes', async () => {
        // Given a component reading Alice's whole record
        let renderCount = 0;
        renderHook(() => {
            renderCount++;
            return usePersonalDetail(ALICE.accountID);
        });
        const initialRenderCount = renderCount;

        // When only Bob's record changes
        await mergePersonalDetails({[BOB.accountID]: {displayName: 'Bob Renamed'}});

        // Then the component doesn't re-render, because Alice's record is unchanged
        expect(renderCount).toBe(initialRenderCount);
    });
});

describe('usePersonalDetailsByIDs', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {[ALICE.accountID]: ALICE, [BOB.accountID]: BOB});
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdates();
    });

    it('passes only the requested accounts to the selector', () => {
        // Given the personal details list contains Alice and Bob

        // When selecting logins for Alice only
        const {result} = renderHook(() => usePersonalDetailsByIDs([ALICE.accountID], loginsSelector));

        // Then Bob's login is left out, because the selector only sees the requested accounts
        expect(result.current[0]).toEqual([ALICE.login]);
    });

    it('does not re-render when a field outside the selector changes', async () => {
        // Given a component reading only Alice's login
        let renderCount = 0;
        renderHook(() => {
            renderCount++;
            return usePersonalDetailsByIDs([ALICE.accountID], loginsSelector);
        });
        const initialRenderCount = renderCount;

        // When Alice's display name changes
        await mergePersonalDetails({[ALICE.accountID]: {displayName: 'Alice Renamed'}});

        // Then the component doesn't re-render, because the selected logins are unchanged
        expect(renderCount).toBe(initialRenderCount);
    });
});
