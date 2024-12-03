import generateMonthMatrix from '@src/components/DatePicker/CalendarPicker/generateMonthMatrix';

type MonthMatrix = Array<Array<number | undefined>>;

describe('generateMonthMatrix', () => {
    it('returns the correct matrix for January 2022', () => {
        const expected: MonthMatrix = [
            [undefined, undefined, undefined, undefined, undefined, 1, 2],
            [3, 4, 5, 6, 7, 8, 9],
            [10, 11, 12, 13, 14, 15, 16],
            [17, 18, 19, 20, 21, 22, 23],
            [24, 25, 26, 27, 28, 29, 30],
            [31, undefined, undefined, undefined, undefined, undefined, undefined],
        ];
        expect(generateMonthMatrix(2022, 0)).toEqual(expected);
    });

    it('returns the correct matrix for February 2022', () => {
        const expected: MonthMatrix = [
            [undefined, 1, 2, 3, 4, 5, 6],
            [7, 8, 9, 10, 11, 12, 13],
            [14, 15, 16, 17, 18, 19, 20],
            [21, 22, 23, 24, 25, 26, 27],
            [28, undefined, undefined, undefined, undefined, undefined, undefined],
        ];
        expect(generateMonthMatrix(2022, 1)).toEqual(expected);
    });

    it('returns the correct matrix for leap year February 2020', () => {
        const expected: MonthMatrix = [
            [undefined, undefined, undefined, undefined, undefined, 1, 2],
            [3, 4, 5, 6, 7, 8, 9],
            [10, 11, 12, 13, 14, 15, 16],
            [17, 18, 19, 20, 21, 22, 23],
            [24, 25, 26, 27, 28, 29, undefined],
        ];
        expect(generateMonthMatrix(2020, 1)).toEqual(expected);
    });

    it('returns the correct matrix for March 2022', () => {
        const expected: MonthMatrix = [
            [undefined, 1, 2, 3, 4, 5, 6],
            [7, 8, 9, 10, 11, 12, 13],
            [14, 15, 16, 17, 18, 19, 20],
            [21, 22, 23, 24, 25, 26, 27],
            [28, 29, 30, 31, undefined, undefined, undefined],
        ];
        expect(generateMonthMatrix(2022, 2)).toEqual(expected);
    });

    it('returns the correct matrix for April 2022', () => {
        const expected: MonthMatrix = [
            [undefined, undefined, undefined, undefined, 1, 2, 3],
            [4, 5, 6, 7, 8, 9, 10],
            [11, 12, 13, 14, 15, 16, 17],
            [18, 19, 20, 21, 22, 23, 24],
            [25, 26, 27, 28, 29, 30, undefined],
        ];
        expect(generateMonthMatrix(2022, 3)).toEqual(expected);
    });

    it('returns the correct matrix for December 2022', () => {
        const expected: MonthMatrix = [
            [undefined, undefined, undefined, 1, 2, 3, 4],
            [5, 6, 7, 8, 9, 10, 11],
            [12, 13, 14, 15, 16, 17, 18],
            [19, 20, 21, 22, 23, 24, 25],
            [26, 27, 28, 29, 30, 31, undefined],
        ];
        expect(generateMonthMatrix(2022, 11)).toEqual(expected);
    });

    it('returns the correct matrix for January 2025', () => {
        const expected: MonthMatrix = [
            [undefined, undefined, 1, 2, 3, 4, 5],
            [6, 7, 8, 9, 10, 11, 12],
            [13, 14, 15, 16, 17, 18, 19],
            [20, 21, 22, 23, 24, 25, 26],
            [27, 28, 29, 30, 31, undefined, undefined],
        ];
        expect(generateMonthMatrix(2025, 0)).toEqual(expected);
    });

    it('returns the correct matrix for February 2025', () => {
        const expected: MonthMatrix = [
            [undefined, undefined, undefined, undefined, undefined, 1, 2],
            [3, 4, 5, 6, 7, 8, 9],
            [10, 11, 12, 13, 14, 15, 16],
            [17, 18, 19, 20, 21, 22, 23],
            [24, 25, 26, 27, 28, undefined, undefined],
        ];
        expect(generateMonthMatrix(2025, 1)).toEqual(expected);
    });

    it('returns the correct matrix for June 2025', () => {
        const expected: MonthMatrix = [
            [undefined, undefined, undefined, undefined, undefined, undefined, 1],
            [2, 3, 4, 5, 6, 7, 8],
            [9, 10, 11, 12, 13, 14, 15],
            [16, 17, 18, 19, 20, 21, 22],
            [23, 24, 25, 26, 27, 28, 29],
            [30, undefined, undefined, undefined, undefined, undefined, undefined],
        ];
        expect(generateMonthMatrix(2025, 5)).toEqual(expected);
    });

    it('returns the correct matrix for December 2025', () => {
        const expected: MonthMatrix = [
            [1, 2, 3, 4, 5, 6, 7],
            [8, 9, 10, 11, 12, 13, 14],
            [15, 16, 17, 18, 19, 20, 21],
            [22, 23, 24, 25, 26, 27, 28],
            [29, 30, 31, undefined, undefined, undefined, undefined],
        ];
        expect(generateMonthMatrix(2025, 11)).toEqual(expected);
    });

    it('throws an error if month is less than 0', () => {
        expect(() => generateMonthMatrix(2022, -1)).toThrow();
    });

    it('throws an error if month is greater than 11', () => {
        expect(() => generateMonthMatrix(2022, 12)).toThrow();
    });

    it('throws an error if year is negative', () => {
        expect(() => generateMonthMatrix(-1, 0)).toThrow();
    });

    it('returns a matrix with 6 rows and 7 columns for January 2022', () => {
        const matrix = generateMonthMatrix(2022, 0);
        expect(matrix.length).toBe(6);
        expect(matrix[0].length).toBe(7);
    });
});
