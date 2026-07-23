import {getSortedPersonalDetails} from '@libs/SuggestionUtils';

import {formatPhoneNumber, localeCompare} from '../utils/TestHelper';

describe('SuggestionUtils', () => {
    describe('getSortedPersonalDetails', () => {
        it('Should sort using the weight if the weight is different', () => {
            const first = {login: 'John Doe', weight: 1, accountID: 1};
            const second = {login: 'Jane Doe', weight: 2, accountID: 2};
            expect(getSortedPersonalDetails([second, first], localeCompare, formatPhoneNumber)).toEqual([first, second]);
        });

        it('Should sort using the displayName if the weight is the same', () => {
            const first = {login: 'águero', weight: 2, accountID: 3};
            const second = {login: 'Bronn', weight: 2, accountID: 4};
            const third = {login: 'Carol', weight: 2, accountID: 5};
            expect(getSortedPersonalDetails([second, first, third], localeCompare, formatPhoneNumber)).toEqual([first, second, third]);
            expect(getSortedPersonalDetails([third, second, first], localeCompare, formatPhoneNumber)).toEqual([first, second, third]);
        });

        it('Should sort using the accountID if both the weight and displayName are the same', () => {
            const first = {login: 'aguero', weight: 2, accountID: 6};
            const second = {login: 'aguero', weight: 2, accountID: 7};
            expect(getSortedPersonalDetails([second, first], localeCompare, formatPhoneNumber)).toEqual([first, second]);
        });

        it('Should sort using the displayName with different diacritics if the weight is the same', () => {
            const first = {login: 'águero', weight: 2, accountID: 8};
            const second = {login: 'aguero', weight: 2, accountID: 8};
            expect(getSortedPersonalDetails([second, first], localeCompare, formatPhoneNumber)).toEqual([second, first]);
        });

        it('Should sort phone number logins using the passed formatter', () => {
            const first = {login: '+18172057554@expensify.sms', weight: 2, accountID: 9};
            const second = {login: '+34911234567@expensify.sms', weight: 2, accountID: 10};
            const formatPhoneNumberMock = jest.fn((phoneNumber: string) => {
                if (phoneNumber === first.login) {
                    return 'A formatted number';
                }
                if (phoneNumber === second.login) {
                    return 'B formatted number';
                }
                return phoneNumber;
            });

            expect(getSortedPersonalDetails([second, first], localeCompare, formatPhoneNumberMock)).toEqual([first, second]);
            expect(formatPhoneNumberMock).toHaveBeenCalledWith(first.login);
            expect(formatPhoneNumberMock).toHaveBeenCalledWith(second.login);
        });
    });
});
