import getInsightsAverageComparison from '@pages/Insights/details/getInsightsAverageComparison';

describe('getInsightsAverageComparison', () => {
    it('asks for more history when fewer than three complete periods are behind the average', () => {
        // Given an average built from only two complete periods
        // When it is compared to the period
        const comparison = getInsightsAverageComparison({total: 5000, count: 2, shareOfTotal: 10, average: 4000, averagePeriodCount: 2});

        // Then no comparison is drawn, since two periods are too few to call normal
        expect(comparison).toEqual({type: 'notEnoughHistory'});
    });

    it('asks for more history when the backend has no history to average', () => {
        // Given a summary without an average
        // When it is compared to the period
        const comparison = getInsightsAverageComparison({total: 5000, count: 2, shareOfTotal: 10, average: null, averagePeriodCount: 0});

        // Then no comparison is drawn
        expect(comparison).toEqual({type: 'notEnoughHistory'});
    });

    it('calls the item new when it had no spend in the history', () => {
        // Given enough history in which the item never had spend
        // When it is compared to the period
        const comparison = getInsightsAverageComparison({total: 5000, count: 2, shareOfTotal: 10, average: 0, averagePeriodCount: 12});

        // Then it reads as new instead of a percentage of zero
        expect(comparison).toEqual({type: 'new'});
    });

    it('compares spend above the average as a positive difference', () => {
        // Given a period that spent $114 against a $100 average
        // When it is compared
        const comparison = getInsightsAverageComparison({total: 11400, count: 3, shareOfTotal: 10, average: 10000, averagePeriodCount: 6});

        // Then it is $14 or 14% over
        expect(comparison).toMatchObject({type: 'change', difference: 1400});
        expect(comparison.type === 'change' ? comparison.percentage : undefined).toBeCloseTo(14);
    });

    it('compares spend below the average as a negative difference', () => {
        // Given a period that spent $90 against a $100 average
        // When it is compared
        const comparison = getInsightsAverageComparison({total: 9000, count: 3, shareOfTotal: 10, average: 10000, averagePeriodCount: 12});

        // Then it is $10 or 10% under
        expect(comparison).toEqual({type: 'change', difference: -1000, percentage: 10});
    });
});
