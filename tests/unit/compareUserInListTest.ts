import {compareUserInList} from '@pages/home/report/ReportActionCompose/SuggestionMention';

describe('compareUserInList', () => {
    it('Should compare the weight if the weight is different', () => {
        const first = {login: 'John Doe', weight: 1, accountID: 1};
        const second = {login: 'Jane Doe', weight: 2, accountID: 2};
        expect(compareUserInList(first, second)).toBe(-1);
        expect(compareUserInList(second, first)).toBe(1);
    });

    it('Should compare the displayName if the weight is the same', () => {
        const first = {login: 'águero', weight: 2, accountID: 3};
        const second = {login: 'Bronn', weight: 2, accountID: 4};
        const third = {login: 'Carol', weight: 2, accountID: 5};
        expect(compareUserInList(first, second)).toBe(-1);
        expect(compareUserInList(first, third)).toBe(-1);
        expect(compareUserInList(second, third)).toBe(-1);

        expect(compareUserInList(second, first)).toBe(1);
        expect(compareUserInList(third, first)).toBe(1);
        expect(compareUserInList(third, second)).toBe(1);
    });

    it('Should compare the accountID if both the weight and displayName are the same', () => {
        const first = {login: 'águero', weight: 2, accountID: 6};
        const second = {login: 'aguero', weight: 2, accountID: 7};
        expect(compareUserInList(first, second)).toBe(-1);
        expect(compareUserInList(second, first)).toBe(1);
    });
});
