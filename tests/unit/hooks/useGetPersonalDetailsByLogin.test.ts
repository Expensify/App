import {act, renderHook, waitFor} from '@testing-library/react-native';

import useGetPersonalDetailsByLogin from '@hooks/useGetPersonalDetailsByLogin';

import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const ACCOUNT_ID_ALICE = 1;
const ACCOUNT_ID_BOB = 2;

const ALICE_LOGIN = 'alice@test.com';
const BOB_LOGIN = 'bob@test.com';

const PERSONAL_DETAILS_LIST: PersonalDetailsList = {
    [ACCOUNT_ID_ALICE]: {accountID: ACCOUNT_ID_ALICE, displayName: 'Alice', login: ALICE_LOGIN},
    [ACCOUNT_ID_BOB]: {accountID: ACCOUNT_ID_BOB, displayName: 'Bob', login: BOB_LOGIN},
};

// The derived value maps lowercased logins to account IDs (see the loginToAccountIDMap derived config).
const LOGIN_TO_ACCOUNT_ID_MAP = {
    [ALICE_LOGIN]: ACCOUNT_ID_ALICE,
    [BOB_LOGIN]: ACCOUNT_ID_BOB,
};

const seedOnyx = async (personalDetailsList = PERSONAL_DETAILS_LIST, loginToAccountIDMap = LOGIN_TO_ACCOUNT_ID_MAP) => {
    await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetailsList);
    await Onyx.set(ONYXKEYS.DERIVED.LOGIN_TO_ACCOUNT_ID_MAP, loginToAccountIDMap);
    await waitForBatchedUpdates();
};

describe('useGetPersonalDetailsByLogin', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('returns the personal details for a matching login', async () => {
        await seedOnyx();

        const {result} = renderHook(() => useGetPersonalDetailsByLogin(ALICE_LOGIN));

        await waitFor(() => {
            expect(result.current).toEqual(PERSONAL_DETAILS_LIST[ACCOUNT_ID_ALICE]);
        });
    });

    it('returns undefined when the login is undefined', async () => {
        await seedOnyx();

        const {result} = renderHook(() => useGetPersonalDetailsByLogin(undefined));

        await waitForBatchedUpdates();
        expect(result.current).toBeUndefined();
    });

    it('returns undefined when the login is not in the map', async () => {
        await seedOnyx();

        const {result} = renderHook(() => useGetPersonalDetailsByLogin('unknown@test.com'));

        await waitForBatchedUpdates();
        expect(result.current).toBeUndefined();
    });

    it('returns undefined when the account ID is in the map but the personal details are missing', async () => {
        // Login maps to an account ID that has no entry in the personal details list.
        await seedOnyx({[ACCOUNT_ID_ALICE]: {accountID: ACCOUNT_ID_ALICE, displayName: 'Alice', login: ALICE_LOGIN}}, LOGIN_TO_ACCOUNT_ID_MAP);

        const {result} = renderHook(() => useGetPersonalDetailsByLogin(BOB_LOGIN));

        await waitForBatchedUpdates();
        expect(result.current).toBeUndefined();
    });

    it('updates when the login argument changes', async () => {
        await seedOnyx();

        const {result, rerender} = renderHook(({login}: {login: string | undefined}) => useGetPersonalDetailsByLogin(login), {initialProps: {login: ALICE_LOGIN}});

        await waitFor(() => {
            expect(result.current).toEqual(PERSONAL_DETAILS_LIST[ACCOUNT_ID_ALICE]);
        });

        rerender({login: BOB_LOGIN});

        await waitFor(() => {
            expect(result.current).toEqual(PERSONAL_DETAILS_LIST[ACCOUNT_ID_BOB]);
        });
    });

    it('updates when the personal details change in Onyx', async () => {
        await seedOnyx();

        const {result} = renderHook(() => useGetPersonalDetailsByLogin(ALICE_LOGIN));

        await waitFor(() => {
            expect(result.current?.displayName).toBe('Alice');
        });

        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [ACCOUNT_ID_ALICE]: {displayName: 'Alice Updated'},
            });
            await waitForBatchedUpdates();
        });

        await waitFor(() => {
            expect(result.current?.displayName).toBe('Alice Updated');
        });
    });
});
