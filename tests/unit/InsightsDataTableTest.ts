import {formatPercentOfTotal} from '@components/Search/InsightsDataTable';

import CONST from '@src/CONST';

describe('formatPercentOfTotal', () => {
    it.each([
        {percentOfTotal: 40.14, expected: '40.1%'},
        {percentOfTotal: 3.5, expected: '3.5%'},
    ])('keeps one decimal place when the share has one ($percentOfTotal)', ({percentOfTotal, expected}) => {
        // Given a group whose share of the spend is not a round number
        const groupTotal = 10000;

        // When the share is formatted for the inline table
        const formatted = formatPercentOfTotal(percentOfTotal, groupTotal, CONST.LOCALES.EN);

        // Then one decimal survives, because whole percents are too coarse to tell adjacent rows apart
        expect(formatted).toBe(expected);
    });

    it.each([
        {percentOfTotal: 30, expected: '30%'},
        {percentOfTotal: 100, expected: '100%'},
    ])('drops the decimal when the share is round ($percentOfTotal)', ({percentOfTotal, expected}) => {
        // Given a group whose share of the spend lands on a whole percent
        const groupTotal = 10000;

        // When the share is formatted for the inline table
        const formatted = formatPercentOfTotal(percentOfTotal, groupTotal, CONST.LOCALES.EN);

        // Then no trailing zero is shown, because "30.0%" reads as precision the number does not carry
        expect(formatted).toBe(expected);
    });

    it('reports a share too small to round as "less than", not as zero', () => {
        // Given a group whose share rounds below the smallest percent the table reports
        const percentOfTotal = 0.03;
        const groupTotal = 10000;

        // When the share is formatted for the inline table
        const formatted = formatPercentOfTotal(percentOfTotal, groupTotal, CONST.LOCALES.EN);

        // Then it reads as "less than", because 0% next to a non-zero amount looks like a bug
        expect(formatted).toBe('<0.1%');
    });

    it('reports a group the search rounded down to zero as "less than", since it still spent something', () => {
        // Given a group the search reported as 0%, although its total is not zero, because the backend rounds
        // the share it sends
        const percentOfTotal = 0;
        const groupTotal = 47392;

        // When the share is formatted for the inline table
        const formatted = formatPercentOfTotal(percentOfTotal, groupTotal, CONST.LOCALES.EN);

        // Then it reads as "less than" rather than zero, because the group's own amount is visible in the same row
        // and showing 0% beside it would contradict it
        expect(formatted).toBe('<0.1%');
    });

    it('shows a group that spent nothing as a genuine zero', () => {
        // Given a group that really spent nothing, so both its share and its total are zero
        const percentOfTotal = 0;
        const groupTotal = 0;

        // When the share is formatted for the inline table
        const formatted = formatPercentOfTotal(percentOfTotal, groupTotal, CONST.LOCALES.EN);

        // Then a plain zero is shown, because "<0.1%" would claim spend the group does not have
        expect(formatted).toBe('0%');
    });

    it.each([
        {percentOfTotal: 98.77999877929688, groupTotal: 5970688778, expected: '98.8%'},
        {percentOfTotal: 0.6299999952316284, groupTotal: 38285552, expected: '0.6%'},
    ])('carries the float precision the search reports ($percentOfTotal)', ({percentOfTotal, groupTotal, expected}) => {
        // Given a share the search sent as a float, carrying the digits a 32-bit value cannot represent exactly

        // When the share is formatted for the inline table
        const formatted = formatPercentOfTotal(percentOfTotal, groupTotal, CONST.LOCALES.EN);

        // Then the noise is rounded away, because the raw float would otherwise print a dozen meaningless digits
        expect(formatted).toBe(expected);
    });

    it('uses the locale decimal separator rather than a hand-built string', () => {
        // Given a Polish user, whose locale writes decimals with a comma
        const percentOfTotal = 40.14;
        const groupTotal = 10000;

        // When the share is formatted for the inline table
        const formatted = formatPercentOfTotal(percentOfTotal, groupTotal, CONST.LOCALES.PL);

        // Then the separator follows the locale, because formatting the number by hand would hard-code a dot
        // for every language
        expect(formatted).toBe('40,1%');
    });
});
