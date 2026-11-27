import {getSortedPersonalDetails} from '@libs/SuggestionUtils';

import {formatPhoneNumber, localeCompare, translateLocal} from '../utils/TestHelper';

// More than any list in these tests, so every user is returned
const LIMIT = 20;

describe('SuggestionUtils', () => {
    describe('getSortedPersonalDetails', () => {
        it('Should sort using the weight if the weight is different', () => {
            const first = {login: 'John Doe', weight: 1, accountID: 1};
            const second = {login: 'Jane Doe', weight: 2, accountID: 2};
            expect(getSortedPersonalDetails([second, first], localeCompare, formatPhoneNumber, translateLocal, LIMIT)).toEqual([first, second]);
        });

        it('Should sort using the displayName if the weight is the same', () => {
            const first = {login: 'águero', weight: 2, accountID: 3};
            const second = {login: 'Bronn', weight: 2, accountID: 4};
            const third = {login: 'Carol', weight: 2, accountID: 5};
            expect(getSortedPersonalDetails([second, first, third], localeCompare, formatPhoneNumber, translateLocal, LIMIT)).toEqual([first, second, third]);
            expect(getSortedPersonalDetails([third, second, first], localeCompare, formatPhoneNumber, translateLocal, LIMIT)).toEqual([first, second, third]);
        });

        it('Should sort using the accountID if both the weight and displayName are the same', () => {
            const first = {login: 'aguero', weight: 2, accountID: 6};
            const second = {login: 'aguero', weight: 2, accountID: 7};
            expect(getSortedPersonalDetails([second, first], localeCompare, formatPhoneNumber, translateLocal, LIMIT)).toEqual([first, second]);
        });

        it('Should sort using the displayName with different diacritics if the weight is the same', () => {
            const first = {login: 'águero', weight: 2, accountID: 8};
            const second = {login: 'aguero', weight: 2, accountID: 8};
            expect(getSortedPersonalDetails([second, first], localeCompare, formatPhoneNumber, translateLocal, LIMIT)).toEqual([second, first]);
        });

        it('Should return only the first users up to the limit, in order', () => {
            const users = ['Eve', 'Bob', 'Dan', 'Amy', 'Cid'].map((login, index) => ({login, weight: 2, accountID: 20 + index}));
            expect(getSortedPersonalDetails(users, localeCompare, formatPhoneNumber, translateLocal, 3).map((user) => user.login)).toEqual(['Amy', 'Bob', 'Cid']);
            expect(getSortedPersonalDetails(users, localeCompare, formatPhoneNumber, translateLocal, 1).map((user) => user.login)).toEqual(['Amy']);
            expect(getSortedPersonalDetails(users, localeCompare, formatPhoneNumber, translateLocal, 0)).toEqual([]);
        });

        it('Should keep users that compare equal in their input order', () => {
            const first = {login: 'same', weight: 2, accountID: 30, avatar: 'first'};
            const second = {login: 'same', weight: 2, accountID: 30, avatar: 'second'};
            const third = {login: 'same', weight: 2, accountID: 30, avatar: 'third'};
            expect(getSortedPersonalDetails([second, third, first], localeCompare, formatPhoneNumber, translateLocal, LIMIT).map((user) => user.avatar)).toEqual([
                'second',
                'third',
                'first',
            ]);
            expect(getSortedPersonalDetails([second, third, first], localeCompare, formatPhoneNumber, translateLocal, 2).map((user) => user.avatar)).toEqual(['second', 'third']);
        });
    });
});
