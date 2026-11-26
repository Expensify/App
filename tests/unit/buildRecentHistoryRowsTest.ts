import buildRecentHistoryRows from '@pages/Insights/details/buildRecentHistoryRows';

describe('buildRecentHistoryRows', () => {
    it('names each period by its first day, for every period length', () => {
        // Given one period of each length the backend sends, each named by its own fields
        const history = [
            {total: 100, count: 1, day: '2026-11-24'},
            {total: 100, count: 1, week: '2026-11-22'},
            {total: 100, count: 1, year: 2026, month: 11},
            {total: 100, count: 1, year: 2026, quarter: 4},
        ];

        // When the rows are laid out
        const {rows} = buildRecentHistoryRows(history, undefined, false);

        // Then every row starts on the period's first day, which its name is formatted from
        expect(rows.map(({start}) => start)).toEqual(['2026-11-24', '2026-11-22', '2026-11-01', '2026-10-01']);
    });

    it('scales the bars and the average marker to whichever is larger', () => {
        // Given an average above every period's spend
        const history = [
            {total: 5000, count: 2, year: 2026, month: 11},
            {total: 2500, count: 1, year: 2026, month: 10},
        ];

        // When the rows are laid out with that average
        const {rows, averageWidthPercent} = buildRecentHistoryRows(history, 10000, false);

        // Then the average reaches the end of the track, so its marker stays on the bars
        expect(rows.map(({widthPercent}) => widthPercent)).toEqual([50, 25]);
        expect(averageWidthPercent).toBe(100);
    });

    it('marks only the newest period as in progress', () => {
        // Given a summarized period that hasn't ended yet
        const history = [
            {total: 100, count: 1, year: 2026, month: 11},
            {total: 100, count: 1, year: 2026, month: 10},
        ];

        // When the rows are laid out
        const {rows} = buildRecentHistoryRows(history, undefined, true);

        // Then only the summarized period, which comes first, is drawn as still growing
        expect(rows.map(({isInProgress}) => isInProgress)).toEqual([true, false]);
    });

    it('lists at most four periods and starts the scale at the refund', () => {
        // Given five periods, one of them refunded below zero
        const history = [
            {total: -100, count: 1, year: 2026, month: 11},
            {total: 400, count: 1, year: 2026, month: 10},
            {total: 200, count: 1, year: 2026, month: 9},
            {total: 100, count: 1, year: 2026, month: 8},
            {total: 900, count: 1, year: 2026, month: 7},
        ];

        // When the rows are laid out without an average
        const {rows, averageWidthPercent} = buildRecentHistoryRows(history, undefined, false);

        // Then the four newest periods are listed on a scale from the refund to the largest spend, and the fifth doesn't widen it
        expect(rows.map(({widthPercent}) => widthPercent)).toEqual([0, 100, 60, 40]);
        expect(averageWidthPercent).toBeUndefined();
    });

    it('keeps a negative average on the scale', () => {
        // Given refunds that bring the average below zero
        const history = [
            {total: 300, count: 1, year: 2026, month: 11},
            {total: -500, count: 1, year: 2026, month: 10},
        ];

        // When the rows are laid out with that average
        const {rows, averageWidthPercent} = buildRecentHistoryRows(history, -100, false);

        // Then the average is marked on the scale starting at the refund
        expect(rows.map(({widthPercent}) => widthPercent)).toEqual([100, 0]);
        expect(averageWidthPercent).toBe(50);
    });

    it('starts the scale at a negative average when the listed periods are all positive', () => {
        // Given periods with spend only, and an average brought below zero by refunds in older periods, which the section doesn't list
        const history = [
            {total: 300, count: 1, year: 2026, month: 11},
            {total: 100, count: 1, year: 2026, month: 10},
        ];

        // When the rows are laid out with that average
        const {rows, averageWidthPercent} = buildRecentHistoryRows(history, -100, false);

        // Then the scale starts at the average, so its marker sits at the track's start and the bars are measured from it
        expect(rows.map(({widthPercent}) => widthPercent)).toEqual([100, 50]);
        expect(averageWidthPercent).toBe(0);
    });
});
