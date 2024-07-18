import compareUserInList from '@libs/compareUserInList';

describe('compareUserInList', () => {
    it('Should compare the weight if the weight is different', () => {
        const first = {displayName: 'John Doe', weight: 1, accountID: 1};
        const second = {displayName: 'Jane Doe', weight: 2, accountID: 2};
        expect(compareUserInList(first, second)).toBe(-1);
    });

    it('Should compare the displayName if the weight is the same', () => {
        const first = {displayName: 'águero', weight: 2, accountID: 1};
        const second = {displayName: 'Bronn', weight: 2, accountID: 1};
        const third = {displayName: 'Carol', weight: 2, accountID: 1};
        expect(compareUserInList(first, second)).toBe(-1);
        expect(compareUserInList(first, third)).toBe(-1);
        expect(compareUserInList(second, third)).toBe(-1);
    });

    it('Should compare the accountID if both the weight and displayName are the same', () => {
        const first = {displayName: 'águero', weight: 2, accountID: 1};
        const second = {displayName: 'aguero', weight: 2, accountID: 2};
        expect(compareUserInList(first, second)).toBe(-1);
    });
});
