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
});
