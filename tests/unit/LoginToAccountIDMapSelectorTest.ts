import type {LoginToAccountIDMapDerivedValue} from '@src/types/onyx';

import {accountIDSelector} from '@selectors/LoginToAccountIDMap';

describe('LoginToAccountIDMapSelector', () => {
    const ALICE_LOGIN = 'alice@test.com';
    const BOB_LOGIN = 'bob@test.com';
    const loginToAccountIDMap: LoginToAccountIDMapDerivedValue = {
        [ALICE_LOGIN]: 1,
        [BOB_LOGIN]: 2,
    };

    describe('accountIDSelector', () => {
        it('should return the account ID for the given login', () => {
            const result = accountIDSelector(ALICE_LOGIN)(loginToAccountIDMap);
            expect(result).toBe(1);
        });

        it('should return undefined when the login is not in the map', () => {
            const result = accountIDSelector('unknown@test.com')(loginToAccountIDMap);
            expect(result).toBeUndefined();
        });

        it('should return undefined when the login is undefined without accessing the map', () => {
            const result = accountIDSelector(undefined)(loginToAccountIDMap);
            expect(result).toBeUndefined();
        });

        it('should return undefined when the login is an empty string', () => {
            // An empty string is falsy, so the selector short-circuits before touching the map.
            const result = accountIDSelector('')(loginToAccountIDMap);
            expect(result).toBeUndefined();
        });

        it('should return undefined for an empty map', () => {
            const result = accountIDSelector(ALICE_LOGIN)({});
            expect(result).toBeUndefined();
        });
    });
});
