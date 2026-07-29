import loginToAccountIDMapConfig from '@libs/actions/OnyxDerived/configs/loginToAccountIDMap';

import type {PersonalDetailsList} from '@src/types/onyx';

describe('loginToAccountIDMap', () => {
    it('prefers the live account when a closed merged-away account shares the same login, regardless of order', () => {
        const closedHasHigherAccountID: PersonalDetailsList = {
            1: {accountID: 1, login: 'user1@example.com'},
            2: {accountID: 2, login: 'user1@example.com', isClosed: true},
        };

        expect(loginToAccountIDMapConfig.compute([closedHasHigherAccountID], {})).toEqual({'user1@example.com': 1});

        const closedHasLowerAccountID: PersonalDetailsList = {
            1: {accountID: 1, login: 'user1@example.com', isClosed: true},
            2: {accountID: 2, login: 'user1@example.com'},
        };

        expect(loginToAccountIDMapConfig.compute([closedHasLowerAccountID], {})).toEqual({'user1@example.com': 2});
    });
});
