import sortBy from '@src/utils/sortBy';

describe('sortBy', () => {
    it('should sort by object key', () => {
        const array = [{id: 3}, {id: 1}, {id: 2}];
        const sorted = sortBy(array, 'id');
        expect(sorted).toEqual([{id: 1}, {id: 2}, {id: 3}]);
    });

    it('should sort by function', () => {
        const array = [{id: 3}, {id: 1}, {id: 2}];
        const sorted = sortBy(array, (obj) => obj.id);
        expect(sorted).toEqual([{id: 1}, {id: 2}, {id: 3}]);
    });

    it('should sort by date', () => {
        const array = [{date: new Date(2022, 1, 1)}, {date: new Date(2022, 0, 1)}, {date: new Date(2022, 2, 1)}];
        const sorted = sortBy(array, 'date');
        expect(sorted).toEqual([{date: new Date(2022, 0, 1)}, {date: new Date(2022, 1, 1)}, {date: new Date(2022, 2, 1)}]);
    });
});
