import loginToAccountIDMapConfig from '@libs/actions/OnyxDerived/configs/loginToAccountIDMap';

import type {PersonalDetailsList} from '@src/types/onyx';

describe('loginToAccountIDMap', () => {
    const accountID1 = 1;
    const accountID2 = 2;
    const login = 'user1@example.com';

    it('prefers the live account when a closed merged-away account shares the same login, regardless of order', () => {
        const closedHasHigherAccountID: PersonalDetailsList = {
            [accountID1]: {accountID: accountID1, login},
            [accountID2]: {accountID: accountID2, login, isClosed: true},
        };

        expect(loginToAccountIDMapConfig.compute([closedHasHigherAccountID], {})).toEqual({[login]: accountID1});

        const closedHasLowerAccountID: PersonalDetailsList = {
            [accountID1]: {accountID: accountID1, login, isClosed: true},
            [accountID2]: {accountID: accountID2, login},
        };

        expect(loginToAccountIDMapConfig.compute([closedHasLowerAccountID], {})).toEqual({[login]: accountID2});
    });

    it('prefers the real account when an optimistic personal detail shares the same login, regardless of order', () => {
        const optimisticHasHigherAccountID: PersonalDetailsList = {
            [accountID1]: {accountID: accountID1, login},
            [accountID2]: {accountID: accountID2, login, isOptimisticPersonalDetail: true},
        };

        expect(loginToAccountIDMapConfig.compute([optimisticHasHigherAccountID], {})).toEqual({[login]: accountID1});

        const optimisticHasLowerAccountID: PersonalDetailsList = {
            [accountID1]: {accountID: accountID1, login, isOptimisticPersonalDetail: true},
            [accountID2]: {accountID: accountID2, login},
        };

        expect(loginToAccountIDMapConfig.compute([optimisticHasLowerAccountID], {})).toEqual({[login]: accountID2});
    });

    it('should return the current value when the logins are unchanged', () => {
        // Given the map computed from the current personal details
        const personalDetailsList: PersonalDetailsList = {[accountID1]: {accountID: accountID1, login}};
        const currentValue = loginToAccountIDMapConfig.compute([personalDetailsList], {});

        // When the user changes their name, which keeps every login on the same accountID
        const renamed: PersonalDetailsList = {[accountID1]: {accountID: accountID1, login, displayName: 'Renamed'}};

        // Then the same map comes back, so consumers comparing by reference don't re-render
        expect(loginToAccountIDMapConfig.compute([renamed], {currentValue})).toBe(currentValue);
    });

    it('should return a new map when a login moves to another accountID', () => {
        // Given a login that only has an optimistic personal detail so far
        const optimistic: PersonalDetailsList = {[accountID1]: {accountID: accountID1, login, isOptimisticPersonalDetail: true}};
        const currentValue = loginToAccountIDMapConfig.compute([optimistic], {});

        // When the server replaces it with the real account, so the key stays and only its value changes
        const real: PersonalDetailsList = {[accountID2]: {accountID: accountID2, login}};
        const result = loginToAccountIDMapConfig.compute([real], {currentValue});

        // Then the change must be detected, or attendees would keep pointing at the optimistic account
        expect(result).not.toBe(currentValue);
        expect(result).toEqual({[login]: accountID2});
    });
});
