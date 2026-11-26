import {act, renderHook} from '@testing-library/react-native';

import PersonalDetailsByLoginProvider, {buildPersonalDetailsByLogin} from '@components/PersonalDetailsByLoginProvider';

import usePersonalDetailByLogin, {usePersonalDetailsByLogins} from '@hooks/usePersonalDetailByLogin';

import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, PersonalDetailsList} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import {mergePersonalDetailsList, setPersonalDetailsList} from '../utils/PersonalDetailsTestUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const ALICE = {accountID: 1, displayName: 'Alice', login: 'alice@test.com'};
const BOB = {accountID: 2, displayName: 'Bob', login: 'bob@test.com'};
const NO_LOGIN = {accountID: 3, displayName: 'No Login'};

function wrapper({children}: {children: React.ReactNode}) {
    return <PersonalDetailsByLoginProvider>{children}</PersonalDetailsByLoginProvider>;
}

async function setPersonalDetails(personalDetails: PersonalDetails[]) {
    const personalDetailsList: PersonalDetailsList = {};
    for (const detail of personalDetails) {
        personalDetailsList[detail.accountID] = detail;
    }

    await act(async () => {
        await setPersonalDetailsList(personalDetailsList);
    });
    await waitForBatchedUpdates();
}

describe('usePersonalDetailByLogin', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('returns the personal details of the given login', async () => {
        await setPersonalDetails([ALICE, BOB]);

        const {result} = renderHook(() => usePersonalDetailByLogin(ALICE.login), {wrapper});

        expect(result.current).toEqual(ALICE);
    });

    it('returns undefined for a login without personal details', async () => {
        await setPersonalDetails([ALICE, NO_LOGIN]);

        const {result} = renderHook(() => usePersonalDetailByLogin('unknown@test.com'), {wrapper});

        expect(result.current).toBeUndefined();
    });

    it('returns undefined when the login is undefined', async () => {
        await setPersonalDetails([ALICE]);

        const {result} = renderHook(() => usePersonalDetailByLogin(undefined), {wrapper});

        expect(result.current).toBeUndefined();
    });

    it('updates when the personal details of the login change', async () => {
        await setPersonalDetails([ALICE]);

        const {result} = renderHook(() => usePersonalDetailByLogin(ALICE.login), {wrapper});

        await act(async () => {
            await mergePersonalDetailsList({[ALICE.accountID]: {displayName: 'Alice Renamed'}});
        });
        await waitForBatchedUpdates();

        expect(result.current?.displayName).toBe('Alice Renamed');
    });

    it('returns undefined when used without the provider', () => {
        const {result} = renderHook(() => usePersonalDetailByLogin(ALICE.login));

        expect(result.current).toBeUndefined();
    });

    it('does not re-render when the personal details of another login change', async () => {
        await setPersonalDetails([ALICE]);

        let renderCount = 0;
        renderHook(
            () => {
                renderCount += 1;
                return usePersonalDetailByLogin(ALICE.login);
            },
            {wrapper},
        );
        const renderCountBeforeUpdate = renderCount;

        await act(async () => {
            await mergePersonalDetailsList({[BOB.accountID]: BOB});
        });
        await waitForBatchedUpdates();

        expect(renderCount).toBe(renderCountBeforeUpdate);
    });

    it('re-renders when the personal details of the requested login change', async () => {
        await setPersonalDetails([ALICE]);

        let renderCount = 0;
        renderHook(
            () => {
                renderCount += 1;
                return usePersonalDetailByLogin(ALICE.login);
            },
            {wrapper},
        );
        const renderCountBeforeUpdate = renderCount;

        await act(async () => {
            await mergePersonalDetailsList({[ALICE.accountID]: {displayName: 'Alice Renamed'}});
        });
        await waitForBatchedUpdates();

        expect(renderCount).toBeGreaterThan(renderCountBeforeUpdate);
    });

    it('returns the selected value when a selector is passed', async () => {
        await setPersonalDetails([ALICE]);

        const {result} = renderHook(() => usePersonalDetailByLogin(ALICE.login, (personalDetails) => personalDetails?.displayName), {wrapper});

        expect(result.current).toBe(ALICE.displayName);
    });

    it('does not re-render when the part of the personal details the selector returns is unchanged', async () => {
        await setPersonalDetails([ALICE]);

        let renderCount = 0;
        renderHook(
            () => {
                renderCount += 1;
                return usePersonalDetailByLogin(ALICE.login, (personalDetails) => personalDetails?.displayName);
            },
            {wrapper},
        );
        const renderCountBeforeUpdate = renderCount;

        await act(async () => {
            await mergePersonalDetailsList({[ALICE.accountID]: {avatar: 'https://test.com/avatar.png'}});
        });
        await waitForBatchedUpdates();

        expect(renderCount).toBe(renderCountBeforeUpdate);
    });

    it('re-renders when the part of the personal details the selector returns changes', async () => {
        await setPersonalDetails([ALICE]);

        const {result} = renderHook(() => usePersonalDetailByLogin(ALICE.login, (personalDetails) => personalDetails?.displayName), {wrapper});

        await act(async () => {
            await mergePersonalDetailsList({[ALICE.accountID]: {displayName: 'Alice Renamed'}});
        });
        await waitForBatchedUpdates();

        expect(result.current).toBe('Alice Renamed');
    });
});

describe('usePersonalDetailsByLogins', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('only returns the personal details of the requested logins', async () => {
        await setPersonalDetails([ALICE, BOB]);

        const {result} = renderHook(() => usePersonalDetailsByLogins([ALICE.login]), {wrapper});

        expect(result.current).toEqual({[ALICE.login]: ALICE});
    });

    it('leaves out logins without personal details', async () => {
        await setPersonalDetails([ALICE]);

        const {result} = renderHook(() => usePersonalDetailsByLogins([ALICE.login, 'unknown@test.com', undefined]), {wrapper});

        expect(result.current).toEqual({[ALICE.login]: ALICE});
    });

    it('returns an empty object for an empty logins array', async () => {
        await setPersonalDetails([ALICE]);

        const {result} = renderHook(() => usePersonalDetailsByLogins([]), {wrapper});

        expect(result.current).toEqual({});
    });

    it('updates when the personal details of a requested login change', async () => {
        await setPersonalDetails([ALICE]);

        const {result} = renderHook(() => usePersonalDetailsByLogins([ALICE.login]), {wrapper});

        await act(async () => {
            await mergePersonalDetailsList({[ALICE.accountID]: {displayName: 'Alice Renamed'}});
        });
        await waitForBatchedUpdates();

        expect(result.current[ALICE.login]?.displayName).toBe('Alice Renamed');
    });

    it('returns an empty object when used without the provider', () => {
        const {result} = renderHook(() => usePersonalDetailsByLogins([ALICE.login]));

        expect(result.current).toEqual({});
    });

    it('does not re-render when the personal details of another login change', async () => {
        await setPersonalDetails([ALICE]);

        let renderCount = 0;
        renderHook(
            () => {
                renderCount += 1;
                return usePersonalDetailsByLogins([ALICE.login]);
            },
            {wrapper},
        );
        const renderCountBeforeUpdate = renderCount;

        await act(async () => {
            await mergePersonalDetailsList({[BOB.accountID]: BOB});
        });
        await waitForBatchedUpdates();

        expect(renderCount).toBe(renderCountBeforeUpdate);
    });

    it('re-renders when the personal details of a requested login change', async () => {
        await setPersonalDetails([ALICE]);

        let renderCount = 0;
        renderHook(
            () => {
                renderCount += 1;
                return usePersonalDetailsByLogins([ALICE.login]);
            },
            {wrapper},
        );
        const renderCountBeforeUpdate = renderCount;

        await act(async () => {
            await mergePersonalDetailsList({[ALICE.accountID]: {displayName: 'Alice Renamed'}});
        });
        await waitForBatchedUpdates();

        expect(renderCount).toBeGreaterThan(renderCountBeforeUpdate);
    });

    it('returns the selected value when a selector is passed', async () => {
        await setPersonalDetails([ALICE, BOB]);

        const {result} = renderHook(() => usePersonalDetailsByLogins([ALICE.login, BOB.login], (personalDetailsByLogin) => Object.keys(personalDetailsByLogin).length), {wrapper});

        expect(result.current).toBe(2);
    });

    it('does not re-render when the part of the personal details the selector returns is unchanged', async () => {
        await setPersonalDetails([ALICE]);

        let renderCount = 0;
        renderHook(
            () => {
                renderCount += 1;
                return usePersonalDetailsByLogins([ALICE.login], (personalDetailsByLogin) => Object.keys(personalDetailsByLogin).length);
            },
            {wrapper},
        );
        const renderCountBeforeUpdate = renderCount;

        await act(async () => {
            await mergePersonalDetailsList({[ALICE.accountID]: {displayName: 'Alice Renamed'}});
        });
        await waitForBatchedUpdates();

        expect(renderCount).toBe(renderCountBeforeUpdate);
    });

    it('re-renders when the part of the personal details the selector returns changes', async () => {
        await setPersonalDetails([ALICE]);

        const {result} = renderHook(() => usePersonalDetailsByLogins([ALICE.login, BOB.login], (personalDetailsByLogin) => Object.keys(personalDetailsByLogin).length), {wrapper});

        await act(async () => {
            await mergePersonalDetailsList({[BOB.accountID]: BOB});
        });
        await waitForBatchedUpdates();

        expect(result.current).toBe(2);
    });
});

describe('buildPersonalDetailsByLogin', () => {
    it('skips personal details without a login', () => {
        // Given a personal details list with an entry that has no login, next to one that does
        const personalDetailsList: PersonalDetailsList = {
            [ALICE.accountID]: ALICE,
            [NO_LOGIN.accountID]: NO_LOGIN,
        };

        // When the list is keyed by login
        const personalDetailsByLogin = buildPersonalDetailsByLogin(personalDetailsList);

        // Then only the entry with a login is kept, because there is no login to key the other one by
        expect(personalDetailsByLogin).toEqual({[ALICE.login]: ALICE});
    });

    it('replaces a closed account with a real account that has the same login', () => {
        // Given a closed account and a real account that share a login, with the closed one read first
        const closedAccount: PersonalDetails = {accountID: 10, login: ALICE.login, isClosed: true};
        const realAccount: PersonalDetails = {accountID: 11, login: ALICE.login};
        const personalDetailsList: PersonalDetailsList = {
            [closedAccount.accountID]: closedAccount,
            [realAccount.accountID]: realAccount,
        };

        // When the list is keyed by login
        const personalDetailsByLogin = buildPersonalDetailsByLogin(personalDetailsList);

        // Then the login points to the real account, because a closed account is never the one a login lookup should find
        expect(personalDetailsByLogin[ALICE.login]).toBe(realAccount);
    });

    it('replaces an optimistic account with a real account that has the same login', () => {
        // Given an optimistic account and a real account that share a login, with the optimistic one read first
        const optimisticAccount: PersonalDetails = {accountID: 10, login: ALICE.login, isOptimisticPersonalDetail: true};
        const realAccount: PersonalDetails = {accountID: 11, login: ALICE.login};
        const personalDetailsList: PersonalDetailsList = {
            [optimisticAccount.accountID]: optimisticAccount,
            [realAccount.accountID]: realAccount,
        };

        // When the list is keyed by login
        const personalDetailsByLogin = buildPersonalDetailsByLogin(personalDetailsList);

        // Then the login points to the real account, because the optimistic one is only a placeholder until the server responds
        expect(personalDetailsByLogin[ALICE.login]).toBe(realAccount);
    });

    it('keeps the first real account when two real accounts have the same login', () => {
        // Given two real accounts that share a login
        const firstAccount: PersonalDetails = {accountID: 10, login: ALICE.login};
        const secondAccount: PersonalDetails = {accountID: 11, login: ALICE.login};
        const personalDetailsList: PersonalDetailsList = {
            [firstAccount.accountID]: firstAccount,
            [secondAccount.accountID]: secondAccount,
        };

        // When the list is keyed by login
        const personalDetailsByLogin = buildPersonalDetailsByLogin(personalDetailsList);

        // Then the login points to the first account, because a later real account never replaces a real one
        expect(personalDetailsByLogin[ALICE.login]).toBe(firstAccount);
    });
});
