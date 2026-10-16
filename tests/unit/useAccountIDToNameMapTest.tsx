import {act, renderHook} from '@testing-library/react-native';

import useAccountIDToNameMap from '@hooks/useAccountIDToNameMap';

import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, PersonalDetailsList} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

function createPersonalDetails(accountID: number, overrides: Partial<PersonalDetails> = {}): PersonalDetails {
    return {
        accountID,
        login: `user${accountID}@example.com`,
        displayName: `User ${accountID}`,
        ...overrides,
    } as PersonalDetails;
}

function buildList(entries: Array<[number, PersonalDetails | null]>): PersonalDetailsList {
    const list: PersonalDetailsList = {};
    for (const [id, details] of entries) {
        list[String(id)] = details;
    }
    return list;
}

const renderAccountIDToNameMap = async () => {
    const hook = renderHook(() => useAccountIDToNameMap());
    await act(async () => {
        await waitForBatchedUpdates();
    });
    return hook;
};

describe('useAccountIDToNameMap', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('returns an empty object when personalDetailsList is not set', async () => {
        const {result} = await renderAccountIDToNameMap();
        expect(result.current).toEqual({});
    });

    it('maps accountID to login when login is present', async () => {
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, buildList([[1, createPersonalDetails(1, {login: 'alice@example.com', displayName: 'Alice'})]]));
        const {result} = await renderAccountIDToNameMap();
        expect(result.current['1']).toBe('alice@example.com');
    });

    it('falls back to displayName when login is undefined', async () => {
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, buildList([[2, createPersonalDetails(2, {login: undefined, displayName: 'Bob'})]]));
        const {result} = await renderAccountIDToNameMap();
        expect(result.current['2']).toBe('Bob');
    });

    it('falls back to an empty string when both login and displayName are undefined', async () => {
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, buildList([[3, createPersonalDetails(3, {login: undefined, displayName: undefined})]]));
        const {result} = await renderAccountIDToNameMap();
        expect(result.current['3']).toBe('');
    });

    it('maps multiple accounts and skips null entries', async () => {
        await Onyx.set(
            ONYXKEYS.PERSONAL_DETAILS_LIST,
            buildList([
                [10, createPersonalDetails(10, {login: 'eve@example.com', displayName: 'Eve'})],
                [11, createPersonalDetails(11, {login: undefined, displayName: 'Frank'})],
                [12, null],
            ]),
        );

        const {result} = await renderAccountIDToNameMap();

        expect(result.current['10']).toBe('eve@example.com');
        expect(result.current['11']).toBe('Frank');
        expect(result.current['12']).toBeUndefined();
    });

    it('reflects updates to personal details', async () => {
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, buildList([[1, createPersonalDetails(1, {login: 'alice@example.com'})]]));
        const {result} = await renderAccountIDToNameMap();
        expect(result.current['1']).toBe('alice@example.com');

        const accountID = 1;
        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[accountID]: {login: 'alice2@example.com'}});
            await waitForBatchedUpdates();
        });

        expect(result.current['1']).toBe('alice2@example.com');
    });

    it('keeps a stable reference across re-renders when personal details do not change', async () => {
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, buildList([[1, createPersonalDetails(1, {login: 'alice@example.com'})]]));
        const {result, rerender} = await renderAccountIDToNameMap();
        const firstResult = result.current;

        rerender({});
        await act(async () => {
            await waitForBatchedUpdates();
        });

        expect(result.current).toBe(firstResult);
    });
});
