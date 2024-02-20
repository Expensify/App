const {default: localeCompare} = require('@libs/LocaleCompare');

describe('localeCompare', () => {
    it('should return -1 for descending comparison', () => {
        const result = localeCompare('Da Vinci', 'Tesla');

        expect(result).toBe(-1);
    });

    it('should return -1 for ascending comparison', () => {
        const result = localeCompare('Zidane', 'Messi');

        expect(result).toBe(1);
    });

    it('should return 0 for equal strings', () => {
        const result = localeCompare('Cat', 'Cat');

        expect(result).toBe(0);
    });

    it('should discard sensitivity differences', () => {
        const result = localeCompare('apple', 'Apple');

        expect(result).toBe(0);
    });
});
